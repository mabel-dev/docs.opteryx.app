---
title: How to Read a JSON Lines (JSONL) File with Python - Rugo, Opteryx and pandas
description: Read a JSON Lines (JSONL / NDJSON) file in Python with Rugo or Opteryx and load it into pandas. Get the types right, filter rows while reading, handle malformed lines, and query JSONL with SQL.
---

# How to Read a JSON Lines File with Python

JSON Lines — also called JSONL or NDJSON — is one JSON object per line:

```json
{"Company":"RVSN USSR","Location":"Site 1/5, Baikonur Cosmodrome, Kazakhstan","Price":null,"Lauched_at":"1957-10-04T19:28:00+00:00","Rocket":"Sputnik 8K71PS","Rocket_Status":"Retired","Mission":"Sputnik-1","Mission_Status":"Success"}
```

It's the usual shape for logs, event streams and API exports, because a writer can add a line without rewriting the file. The cost falls on the reader. A JSONL file has no schema, so the reader has to decide each column's type by looking at the values — and most JSONL problems are a reader deciding wrongly.

This page uses the two readers that come from Opteryx:

- **[Rugo](/docs/guides/rugo-standalone)** — the file reader inside Opteryx, published on its own. A native JSONL parser that can drop columns and rows as it reads. No SQL.
- **[Opteryx](/docs/guides/querying-local-data)** — the SQL engine built on Rugo, running in your Python process. Use it when you want to aggregate, join or rank before the data reaches pandas.

Both hand results over as Arrow, which pandas converts directly.

> **Try it yourself:** every example on this page runs in the companion notebook. [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-a-json-lines-file-with-python.ipynb) or [download the notebook](/notebooks/read-a-json-lines-file-with-python.ipynb).

## What You'll Be Able to Do

By the end of this page you'll be able to:

- load a JSONL file into a pandas DataFrame with Rugo
- explain why a numeric column can come back as text, and fix it
- read only the columns and rows you need
- decide what happens to a malformed line
- query a JSONL file with SQL and get the answer back as a DataFrame

## Install

```bash
pip install rugo opteryx-core pandas pyarrow
```

Rugo and Opteryx have no dependencies of their own. pandas and PyArrow are only needed for the final step, turning the result into a DataFrame.

The examples use `space_missions.jsonl`, 4,630 orbital launch attempts. To make it, [download the Parquet version](https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/flat/space_missions/space_missions.parquet) and convert it with the `rugo` command that comes with Rugo:

```bash
rugo convert space_missions.parquet space_missions.jsonl
```

## Load a JSONL File into pandas

```python
import pyarrow
from rugo.jsonl import read_jsonl

with read_jsonl("space_missions.jsonl") as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
```

The reader yields a **morsel** — a batch of columns — which converts to an Arrow table and then to pandas. Look at the types, though:

```text
Company           str
Location          str
Price             str    ← should be a number
Lauched_at        str
...
```

## Getting the Types Right

Rugo decides each column's type from the first **5** records by default. The first launches in this file have no recorded price, so `Price` is `null` in all five. With no value to go on, the column falls back to text.

There are two fixes. Look at more records:

```python
with read_jsonl("space_missions.jsonl", infer_sample_size=500) as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
# Price is now float64
```

or say what the type is:

```python
with read_jsonl("space_missions.jsonl", explicit_schema={"Price": "DOUBLE"}) as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
```

A declared column is parsed strictly. If a value doesn't fit — `"N/A"` in a `DOUBLE` column — the read fails with an error naming the column, the row and the value, rather than quietly turning the column into text. Declare the columns you depend on, especially in pipelines where a file's first few records aren't typical.

The sample size also decides **which columns exist**: a key that first appears after the sample window isn't read at all. If a field is rare, raise `infer_sample_size` or declare it.

### Timestamps

Timestamps arrive as text unless you declare them. Declared `TIMESTAMP` columns accept ISO-8601 text without a UTC offset (`2024-01-01T00:00:00`). For values that carry one, like the `+00:00` in this file, keep the column as text and convert it after reading, or cast it in SQL (below):

```python
import pandas as pd

df["Lauched_at"] = pd.to_datetime(df["Lauched_at"], utc=True)
```

## Read Only the Columns and Rows You Need

`columns` picks the fields to build, and `predicates` drops rows as they're read, so non-matching records never become columns:

```python
with read_jsonl(
    "space_missions.jsonl",
    columns=["Company", "Mission", "Price"],
    predicates=[("Company", "==", "SpaceX"), ("Price", "<", 60)],
    infer_sample_size=500,
) as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
# 25 rows
```

The operators are `==`, `!=`, `<`, `<=`, `>`, `>=`, `in`, `not in`, `is null` and `is not null`, and the tuples are combined with AND. A predicate's value must match the column's JSON type — it's never converted — so `("Price", "<", "60")` raises an error explaining that a number column can't be compared with a string.

Unlike Parquet, JSONL has no statistics, so every line still has to be scanned. What filtering on read saves is memory and the time spent building values you'd only discard.

## Malformed Lines

By default a line that isn't valid JSON fails the read, with the line number and byte offset of the problem:

```text
ValueError: Malformed JSONL at line 2 (byte offset 8): '{"a":2'
```

To skip bad lines instead, pass `fail_on_error=False`:

```python
with read_jsonl("events.jsonl", fail_on_error=False) as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
```

Keep the default in pipelines, where a bad line means a bad upstream writer. Skip when exploring a file you don't control.

## Query with SQL: Opteryx

When the question is an aggregate, write it as SQL and only bring the answer into pandas. [`READ_JSONL`](/docs/reference/sql/statements/read-jsonl) reads a file by path:

```python
import opteryx
import pyarrow

morsels = opteryx.session().execute_to_morsels("""
    SELECT Mission_Status, COUNT(*) AS launches
      FROM READ_JSONL('space_missions.jsonl')
     WHERE Company = 'SpaceX'
     GROUP BY Mission_Status
     ORDER BY launches DESC
""")
df = pyarrow.concat_tables(m.to_arrow() for m in morsels).to_pandas()
```

```text
      Mission_Status  launches
0            Success       172
1            Failure         5
2    Partial Failure         4
3  Prelaunch Failure         1
```

`READ_JSONL` uses the same inference as Rugo, with the same options. A query that treats `Price` as a number needs the larger sample:

```sql
SELECT COUNT(*)
  FROM READ_JSONL('space_missions.jsonl', infer_sample_size => 500)
 WHERE Price < 60
```

Without it, Opteryx refuses the query and explains that a `VARCHAR` column can't be compared with a number. Timestamps are text here too; cast them when you need date logic:

```sql
SELECT EXTRACT(year FROM CAST(Lauched_at AS TIMESTAMP)) AS year, COUNT(*) AS launches
  FROM READ_JSONL('space_missions.jsonl')
 GROUP BY year
 ORDER BY launches DESC
```

Pass `ignore_errors => true` to skip malformed lines instead of failing, and use a glob — `READ_JSONL('logs/*.jsonl')` — to read many files as one table.

## Querying the Same Data Repeatedly: Convert to Parquet

Every read of a JSONL file parses all of it and infers the types again. If you'll read the same data more than once, convert it to Parquet. The types are fixed once, and later reads can skip the columns and row groups they don't need.

Convert with the types you want, not the ones inference happens to pick — Rugo reads the JSONL and writes the Parquet:

```python
from rugo import parquet
from rugo.jsonl import read_jsonl

with read_jsonl("space_missions.jsonl", explicit_schema={"Price": "DOUBLE"}) as reader:
    with open("space_missions_typed.parquet", "wb") as f:
        with parquet.open_parquet_writer(f.write) as writer:
            for morsel in reader:
                writer.write_row_group(morsel)
```

The quick `rugo convert space_missions.jsonl out.parquet` uses default inference, so on this file `Price` would be stored as text. Check any conversion with `rugo schema`. See [How to read a Parquet file with Python](/docs/guides/read-a-parquet-file-with-python) for reading the result back.

## Which One to Use

| You want to... | Use |
|---|---|
| Load a file, or part of one, into pandas | Rugo `read_jsonl` with `columns` and `predicates` |
| Make sure columns get the right types | `explicit_schema`, or a larger `infer_sample_size` |
| Aggregate, join or rank before loading | Opteryx `READ_JSONL` |
| Query the same data repeatedly | Convert to Parquet with declared types, then query that |

## Try It in a Notebook

The companion notebook builds `space_missions.jsonl` and runs every example on this page.

- [Open in Google Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-a-json-lines-file-with-python.ipynb)
- [Download the notebook (.ipynb)](/notebooks/read-a-json-lines-file-with-python.ipynb)

## Related

- [How to read a Parquet file with Python](/docs/guides/read-a-parquet-file-with-python)
- [How to read an Avro file with Python](/docs/guides/read-an-avro-file-with-python)
- [Using Rugo Standalone](/docs/guides/rugo-standalone)
- [READ_JSONL](/docs/reference/sql/statements/read-jsonl)
