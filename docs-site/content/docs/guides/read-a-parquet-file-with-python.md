---
title: How to Read a Parquet File with Python - pandas, PyArrow and SQL
description: Read a Parquet file in Python and load it into pandas. Select columns, filter rows while reading, inspect metadata, stream files larger than memory, and query Parquet with SQL.
---

# How to Read a Parquet File with Python

Parquet is a columnar file format: values are stored column by column, compressed, and grouped into **row groups** that each carry min/max statistics. That layout is why the right way to read Parquet is not "load the whole file, then throw most of it away". Every good reader lets you name the columns you want and the rows you want, and skips the rest before it is decoded.

This page covers reading Parquet into pandas, filtering while reading, looking inside a file before you load it, streaming files larger than memory, and querying Parquet with SQL.

> **Try it yourself:** every example on this page runs in the companion notebook, which builds its own sample file. [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-a-parquet-file-with-python.ipynb) or [download the notebook](/notebooks/read-a-parquet-file-with-python.ipynb).

## What You'll Be Able to Do

By the end of this page you'll be able to:

- load a Parquet file into a pandas DataFrame in one line
- read only the columns you need, and filter rows while reading rather than after
- explain why a filter on a sorted column skips whole row groups
- read a file's schema, row count and statistics without reading its data
- process a file larger than memory in batches
- query Parquet with SQL and get the result back as a DataFrame

## The Short Answer: pandas

```bash
pip install pandas pyarrow
```

```python
import pandas as pd

df = pd.read_parquet("orders.parquet")
```

pandas hands the read to PyArrow, so you need both installed. Types come straight from the schema stored in the file — there is no type inference and no date parsing to configure:

```text
order_id                int64
customer_id             int64
country                   str
status                    str
amount                float64
ordered_at     datetime64[us]
```

The examples on this page use an `orders.parquet` file with 200,000 rows and ten row groups, sorted by `ordered_at`.

## Read Only the Columns You Need

Because Parquet stores each column separately, a column you don't ask for is never read from disk or decompressed:

```python
df = pd.read_parquet("orders.parquet", columns=["order_id", "country", "amount"])
```

On a wide file this is the single biggest speed-up available. Name your columns instead of reading everything and dropping columns afterwards.

## Filter While Reading

`filters` applies a predicate as part of the read. A list of tuples is combined with AND:

```python
df = pd.read_parquet(
    "orders.parquet",
    columns=["order_id", "country", "amount"],
    filters=[("country", "==", "GB"), ("amount", ">", 100)],
)
# 2,108 rows
```

A list of lists is OR — each inner list is one AND group:

```python
df = pd.read_parquet(
    "orders.parquet",
    filters=[[("status", "==", "returned")], [("status", "==", "cancelled")]],
)
```

`in` is usually simpler than an OR:

```python
df = pd.read_parquet("orders.parquet", filters=[("status", "in", ["returned", "cancelled"])])
```

Compare a timestamp column against a `pd.Timestamp`, not a string:

```python
df = pd.read_parquet(
    "orders.parquet",
    filters=[("ordered_at", ">=", pd.Timestamp("2024-12-01"))],
)
```

### Why this is faster than filtering afterwards

A filter on read works in two stages. First, each row group's min/max statistics are checked; a row group whose range can't contain a match is skipped without being decompressed. Then the surviving rows are filtered exactly.

How much the first stage saves depends on how the file was written. `orders.parquet` is sorted by `ordered_at`, so each row group covers about five weeks and the December filter above only decodes the last row group. `country` is not sorted — every row group contains every country — so a `country == "GB"` filter can't skip anything and only saves you the cost of building rows you don't want. If you control how the files are written, sort by the column you filter on most.

## Look Inside Before You Read

`pyarrow.parquet.ParquetFile` reads the footer — schema, row counts, statistics — without touching the data:

```python
import pyarrow.parquet as pq

pf = pq.ParquetFile("orders.parquet")

print(pf.schema_arrow)               # column names and types
print(pf.metadata.num_rows)          # 200000
print(pf.metadata.num_row_groups)    # 10

stats = pf.metadata.row_group(0).column(5).statistics
print(stats.min, stats.max)          # range of ordered_at in the first row group
```

This is a cheap way to answer "what's in this file?" before deciding how to read it.

## Files Bigger Than Memory

`iter_batches` streams a file in pieces, so only one batch is in memory at a time:

```python
pf = pq.ParquetFile("orders.parquet")

for batch in pf.iter_batches(batch_size=50_000, columns=["country", "amount"]):
    chunk = batch.to_pandas()
    ...  # aggregate or write out each chunk
```

If what you want at the end is a summary — totals by country, a monthly count — it is usually simpler to let a query engine do the aggregation and only return the answer. See [With SQL: Opteryx](#with-sql-opteryx) below.

## Reading a Folder of Files

Datasets are often split across many files. Pass the folder instead of a file:

```python
df = pd.read_parquet("orders_split/")
```

Hive-style partition folders (`month=2024-12/`) become a column, and `filters` on that column skip whole folders:

```python
df = pd.read_parquet("orders_by_month/", filters=[("month", "==", "2024-12")])
```

## Without PyArrow: Rugo

[Rugo](/docs/guides/rugo-standalone) is the file reader inside Opteryx, published on its own. It is a fraction of PyArrow's install size and supports the same column and row filtering:

```bash
pip install rugo
```

```python
import pyarrow
from rugo import parquet

with parquet.read_parquet(
    "orders.parquet",
    columns=["order_id", "country", "amount"],
    predicates=[("country", "=", "GB"), ("amount", ">", 100)],
) as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
```

Rugo prunes row groups using both min/max statistics and bloom filters, then filters rows exactly. A predicate column doesn't have to be in `columns` — it's read, used and dropped. Converting to pandas goes through Arrow, so PyArrow is needed for that last step; if you only need Python values, `morsel.column("amount").to_pylist()` avoids it.

## With SQL: Opteryx

When the question is an aggregate — counts, averages, top-N — write it as SQL and only bring the answer into pandas. [Opteryx Core](/docs/guides/querying-local-data) runs in-process and reads a file by path with [`READ_PARQUET`](/docs/reference/sql/statements/read-parquet):

```bash
pip install opteryx-core
```

```python
import opteryx
import pyarrow

session = opteryx.session()
morsels = session.execute_to_morsels("""
    SELECT country,
           COUNT(*)              AS orders,
           ROUND(AVG(amount), 2) AS avg_amount
      FROM READ_PARQUET('orders.parquet')
     WHERE status = 'delivered'
       AND ordered_at >= CAST('2024-07-01' AS TIMESTAMP)
     GROUP BY country
     ORDER BY orders DESC
""")
df = pyarrow.concat_tables(m.to_arrow() for m in morsels).to_pandas()
```

The `WHERE` clause and the referenced columns are pushed into the read, the same way `filters` and `columns` are in pandas — `EXPLAIN` shows it as `predicate pushdown into scan`. The scan and the grouping happen inside the engine; only eight rows reach Python.

Bind values as parameters rather than formatting them into the SQL:

```python
morsels = opteryx.session().execute_to_morsels(
    "SELECT order_id, amount FROM READ_PARQUET('orders.parquet') WHERE country = :country AND amount > :min_amount",
    params={"country": "GB", "min_amount": 100},
)
```

A glob reads many files as one table — `READ_PARQUET('orders_split/*.parquet')` — and `gs://`, `s3://` and `https://` paths work too.

## Which One to Use

| You want to... | Use |
|---|---|
| Load a file that fits in memory | `pd.read_parquet` |
| Load part of a file | `pd.read_parquet` with `columns` and `filters` |
| Check schema, row count or statistics | `pq.ParquetFile(...).metadata` |
| Process a file larger than memory | `ParquetFile.iter_batches` |
| Read Parquet without installing PyArrow | Rugo |
| Aggregate, join or rank before loading | Opteryx `READ_PARQUET` |

## Try It in a Notebook

The companion notebook builds a sample `orders.parquet` and runs every example on this page, including the row-group statistics that make filtering fast.

- [Open in Google Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-a-parquet-file-with-python.ipynb)
- [Download the notebook (.ipynb)](/notebooks/read-a-parquet-file-with-python.ipynb)

## Related

- [How to read a JSON Lines file with Python](/docs/guides/read-a-json-lines-file-with-python)
- [How to read an Avro file with Python](/docs/guides/read-an-avro-file-with-python)
- [READ_PARQUET](/docs/reference/sql/statements/read-parquet)
- [Querying Local Data](/docs/guides/querying-local-data)
- [Using Rugo Standalone](/docs/guides/rugo-standalone)
