---
title: How to Read a JSON Lines (JSONL) File with Python - pandas, PyArrow and SQL
description: Read a JSON Lines (JSONL / NDJSON) file in Python and load it into pandas. Control types, filter rows while reading, stream large files in chunks, and query JSONL with SQL.
---

# How to Read a JSON Lines File with Python

JSON Lines — also called JSONL or NDJSON — is one JSON object per line:

```json
{"order_id": 1, "customer_id": 3649, "country": "NL", "status": "delivered", "amount": 32.86, "ordered_at": "2024-01-01T00:04:45"}
{"order_id": 2, "customer_id": 820, "country": "CA", "status": "cancelled", "amount": 24.65, "ordered_at": "2024-01-01T00:05:23"}
```

It's the usual shape for logs, event streams, API exports and anything appended to over time, because a writer can add a line without rewriting the file. That convenience has a cost for readers: there's no schema, no index and no statistics, so every reader has to parse text and work out the types itself. Most of this page is about doing that parsing once, and keeping only what you need.

> **Try it yourself:** every example on this page runs in the companion notebook, which builds its own sample file. [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-a-json-lines-file-with-python.ipynb) or [download the notebook](/notebooks/read-a-json-lines-file-with-python.ipynb).

## What You'll Be Able to Do

By the end of this page you'll be able to:

- load a JSONL file into a pandas DataFrame, and control the types it gets
- read a file too large for memory in chunks, keeping only matching rows
- stream a file line by line with nothing but the standard library
- filter while reading with a native reader, so unwanted rows are never built
- query a JSONL file with SQL and get the result back as a DataFrame

## The Short Answer: pandas

```python
import pandas as pd

df = pd.read_json("orders.jsonl", lines=True)
```

`lines=True` is the important part — without it pandas expects a single JSON document and fails on the second line.

pandas infers each column's type from the values. Integers, floats and strings come out as you'd expect. Dates are a special case: by default pandas converts a column to datetime **only if its name looks like a date** — ending in `_at` or `_time`, starting with `timestamp`, or named `modified`, `date` or `datetime`. In the sample file `ordered_at` qualifies, so:

```text
order_id                int64
customer_id             int64
country                   str
status                    str
amount                float64
ordered_at     datetime64[us]
```

A date column named `created` or `when` stays as text. Name it explicitly:

```python
df = pd.read_json("orders.jsonl", lines=True, convert_dates=["when"])
```

and set any other type you don't want left to inference with `dtype`:

```python
df = pd.read_json("orders.jsonl", lines=True, dtype={"customer_id": "int64", "country": "string"})
```

To look at the first rows of a large file without reading it all, use `nrows`:

```python
df = pd.read_json("orders.jsonl", lines=True, nrows=1000)
```

## Large Files: Read in Chunks

`read_json` builds the whole DataFrame in memory, and a DataFrame is much larger than the text it came from once every value is a Python-level object. For a big file, read it in chunks and keep only the rows and columns you need from each:

```python
parts = []
with pd.read_json("orders.jsonl", lines=True, chunksize=50_000) as reader:
    for chunk in reader:
        parts.append(
            chunk.loc[(chunk["country"] == "GB") & (chunk["amount"] > 100), ["order_id", "amount"]]
        )

df = pd.concat(parts, ignore_index=True)
# 2,108 rows
```

Memory now peaks at one chunk plus the matches, not the whole file. This is filtering *after* parsing, though — every line is still parsed into a DataFrame row before it's thrown away. pandas has no way to filter JSONL while reading.

## Standard Library Only

With no dependencies at all, a generator gives you the same streaming filter and keeps only plain dicts:

```python
import json

def matching_orders(path):
    with open(path) as f:
        for line in f:
            if not line.strip():
                continue
            row = json.loads(line)
            if row["country"] == "GB" and row["amount"] > 100:
                yield {"order_id": row["order_id"], "amount": row["amount"]}

df = pd.DataFrame(matching_orders("orders.jsonl"))
```

This is the easiest version to adapt — a line that fails to parse can be logged and skipped, a nested field can be pulled out with ordinary Python — and the slowest, because every line goes through `json.loads` in the interpreter.

## PyArrow

PyArrow has a multi-threaded native JSONL parser. It reads the whole file into an Arrow table, which converts to pandas:

```python
import pyarrow.json as pj
import pyarrow.compute as pc

table = pj.read_json("orders.jsonl")
gb = table.filter((pc.field("country") == "GB") & (pc.field("amount") > 100))
df = gb.to_pandas()
```

The filter runs over Arrow arrays rather than Python objects, but it still runs after the whole file is parsed. PyArrow recognises ISO timestamps on its own (`ordered_at` arrives as `timestamp[s]`), whatever the column is called.

## Filter While Reading: Rugo

[Rugo](/docs/guides/rugo-standalone), the file reader inside Opteryx, can apply column selection and predicates as it reads, so rows that don't match are never materialised:

```bash
pip install rugo
```

```python
import pyarrow
from rugo.jsonl import read_jsonl

with read_jsonl(
    "orders.jsonl",
    columns=["order_id", "country", "amount"],
    predicates=[("country", "==", "GB"), ("amount", ">", 100)],
) as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
```

Two things to know about Rugo's JSONL reader:

- **Types are inferred from the first 5 records by default.** A column whose type can't be decided from that sample, or that doesn't appear in it at all, needs `infer_sample_size` raised, or the type declared with `explicit_schema`.
- **Timestamps stay as text unless you declare them**:

```python
with read_jsonl(
    "orders.jsonl",
    columns=["order_id", "ordered_at"],
    explicit_schema={"ordered_at": "TIMESTAMP[us]"},
) as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
```

A declared column is parsed strictly — a value that doesn't fit raises an error naming the row, rather than quietly turning the column into strings.

`read_metadata("orders.jsonl")` returns the row count and the column names without building any columns.

## With SQL: Opteryx

When the question is an aggregate, write it as SQL and only bring the answer into pandas. [Opteryx Core](/docs/guides/querying-local-data) runs in-process and reads a file by path with [`READ_JSONL`](/docs/reference/sql/statements/read-jsonl):

```bash
pip install opteryx-core
```

```python
import opteryx
import pyarrow

session = opteryx.session()
morsels = session.execute_to_morsels("""
    SELECT status, COUNT(*) AS orders
      FROM READ_JSONL('orders.jsonl')
     WHERE country = 'GB'
     GROUP BY status
     ORDER BY orders DESC
""")
df = pyarrow.concat_tables(m.to_arrow() for m in morsels).to_pandas()
```

The `WHERE` clause and the columns the query uses are pushed into the read, so the filtering happens in Rugo before rows are built. Only five rows reach Python.

`READ_JSONL` reads timestamps as text, so `MIN(ordered_at)` and `ORDER BY ordered_at` work on ISO-8601 strings, but date arithmetic needs a `CAST(ordered_at AS TIMESTAMP)`. Pass `ignore_errors => true` to skip malformed lines instead of failing, and use a glob — `READ_JSONL('logs/*.jsonl')` — to read many files as one table.

If you query the same JSONL data repeatedly, convert it to Parquet once. JSONL has to be parsed in full on every read; Parquet carries its schema and the statistics that let a reader skip data. See [How to read a Parquet file with Python](/docs/guides/read-a-parquet-file-with-python).

## Common Problems

- **`ValueError: Trailing data`** — you've left out `lines=True`.
- **A numeric column comes back as `object` (or text)** — some line holds a non-numeric value (`"N/A"`, `""`). Find it, or declare the type so the error names the row.
- **A field that only some records have is missing** — samplers decide the columns from the first records. Raise the sample size, or declare the column.
- **Nested objects** — pandas keeps them as dicts in an `object` column; flatten with `pd.json_normalize` on the parsed records. Rugo returns them as JSON text.

## Which One to Use

| You want to... | Use |
|---|---|
| Load a file that fits in memory | `pd.read_json(..., lines=True)` |
| Load part of a large file | `read_json` with `chunksize`, or Rugo with `predicates` |
| No dependencies, custom per-line logic | `json.loads` in a generator |
| Fast native parse of the whole file | `pyarrow.json.read_json` |
| Aggregate, join or rank before loading | Opteryx `READ_JSONL` |

## Try It in a Notebook

The companion notebook builds a sample `orders.jsonl` and runs every example on this page.

- [Open in Google Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-a-json-lines-file-with-python.ipynb)
- [Download the notebook (.ipynb)](/notebooks/read-a-json-lines-file-with-python.ipynb)

## Related

- [How to read a Parquet file with Python](/docs/guides/read-a-parquet-file-with-python)
- [How to read an Avro file with Python](/docs/guides/read-an-avro-file-with-python)
- [READ_JSONL](/docs/reference/sql/statements/read-jsonl)
- [Using Rugo Standalone](/docs/guides/rugo-standalone)
