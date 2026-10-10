---
title: How to Read an Avro File with Python - fastavro, pandas and Polars
description: Read an Apache Avro file in Python and load it into pandas. Inspect the embedded schema, select fields with a reader schema, filter records while streaming, and convert Avro to Parquet for repeated queries.
---

# How to Read an Avro File with Python

Apache Avro is a row-oriented binary format. Each file starts with a header holding the **writer schema** as JSON, followed by blocks of records encoded against that schema. You'll meet it in Kafka pipelines, Hadoop-era data lakes and Iceberg manifest files — anywhere records are written one at a time and the schema has to travel with the data.

Being row-oriented shapes how you read it. Parquet stores each column separately with statistics, so a reader can skip columns and row groups it doesn't need. Avro stores whole records one after another, with no statistics, so every record has to be decoded to find out whether you want it. Filtering is still worth doing — it keeps memory down — but it saves decoding work only in readers that can skip fields, and never lets you skip records unread.

> **Try it yourself:** every example on this page runs in the companion notebook, which builds its own sample file. [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-an-avro-file-with-python.ipynb) or [download the notebook](/notebooks/read-an-avro-file-with-python.ipynb).

## What You'll Be Able to Do

By the end of this page you'll be able to:

- load an Avro file into a pandas DataFrame
- read a file's schema and compression codec without reading its records
- read only some fields with a reader schema or a column list
- filter records while streaming, so non-matching rows never reach pandas
- explain why filtering Avro saves memory but not much time, and when to convert to Parquet instead

## The Short Answer: fastavro and pandas

[fastavro](https://fastavro.readthedocs.io) is the standard Avro library for Python. pandas has no Avro reader of its own, so read the records with fastavro and hand them to a DataFrame:

```bash
pip install fastavro pandas
```

```python
import fastavro
import pandas as pd

with open("orders.avro", "rb") as f:
    df = pd.DataFrame.from_records(fastavro.reader(f))
```

Avro's types carry through. Logical types are decoded for you — a `timestamp-millis` field arrives as a timezone-aware datetime:

```text
order_id                     int64
customer_id                  int64
country                        str
status                         str
amount                     float64
ordered_at     datetime64[us, UTC]
```

The examples on this page use an `orders.avro` file with 200,000 records, compressed with deflate.

## Read the Schema First

The header is at the start of the file, so the schema and codec are available as soon as the reader is opened, before any record is decoded:

```python
with open("orders.avro", "rb") as f:
    reader = fastavro.reader(f)
    print(reader.writer_schema)
    print(reader.codec)          # 'deflate'
```

```python
{'type': 'record', 'name': 'Order', 'fields': [
    {'name': 'order_id', 'type': 'long'},
    {'name': 'customer_id', 'type': 'long'},
    {'name': 'country', 'type': 'string'},
    {'name': 'status', 'type': 'string'},
    {'name': 'amount', 'type': 'double'},
    {'name': 'ordered_at', 'type': {'type': 'long', 'logicalType': 'timestamp-millis'}}]}
```

## Read Only Some Fields

Avro's way to select fields is a **reader schema**: the schema you want, resolved against the schema the file was written with. Leave a field out and it's dropped:

```python
reader_schema = {
    "type": "record",
    "name": "Order",
    "fields": [
        {"name": "order_id", "type": "long"},
        {"name": "amount", "type": "double"},
    ],
}

with open("orders.avro", "rb") as f:
    df = pd.DataFrame.from_records(fastavro.reader(f, reader_schema=reader_schema))
```

Reader schemas do more than select. A field the file doesn't have is filled from its `default`, and numeric types can be widened (`int` to `long`, `float` to `double`) — which is how Avro lets old and new versions of a record be read together.

## Filter While Reading

fastavro yields one record at a time, so put the filter in a generator and pandas only ever sees the rows you keep:

```python
def matching_orders(path):
    with open(path, "rb") as f:
        for record in fastavro.reader(f):
            if record["country"] == "GB" and record["amount"] > 100:
                yield {"order_id": record["order_id"], "amount": record["amount"]}

df = pd.DataFrame(matching_orders("orders.avro"))
# 2,108 rows
```

Memory now holds only the matches. Every record is still decoded — that's unavoidable with a row format.

To work in batches instead of single records, `fastavro.block_reader` yields one Avro block at a time:

```python
parts = []
with open("orders.avro", "rb") as f:
    for block in fastavro.block_reader(f):
        chunk = pd.DataFrame.from_records(list(block))
        parts.append(chunk[chunk["status"] == "returned"])

df = pd.concat(parts, ignore_index=True)
```

## Polars

[Polars](https://pola.rs) reads Avro natively, with a column list, and converts to pandas:

```bash
pip install polars pyarrow
```

```python
import polars as pl

df = (
    pl.read_avro("orders.avro", columns=["order_id", "country", "amount"])
      .filter((pl.col("country") == "GB") & (pl.col("amount") > 100))
      .to_pandas()
)
```

Only the listed columns end up in the frame, and `n_rows` stops after the first N records for a quick look. The filter runs on the loaded frame — there is no lazy `scan_avro` — so the selected columns must fit in memory. Polars marks its Avro support as unstable.

## Rugo (Experimental)

Rugo, the file reader inside [Opteryx](/docs/introduction/what-is-opteryx), has a native Avro reader in development. It isn't in a released `rugo` wheel yet; the API below is the one being built.

```python
import pyarrow
from rugo.avro import read_avro, read_metadata

print(read_metadata("orders.avro"))
# AvroMetadata(codec='deflate', columns=['order_id', 'customer_id', ...])

with read_avro("orders.avro", columns=["order_id", "country", "amount"]) as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
```

`columns` accepts dotted names to read a single field out of a nested record (`"customer.region"`), and `reader_schema` works as it does in fastavro. Unlike the Parquet and JSONL readers there's no `predicates` argument — with no statistics to prune by, filter the result. SQL over Avro (`READ_AVRO`) isn't available yet; until it is, convert the file to Parquet as below.

## Querying Avro Repeatedly: Convert to Parquet

If you'll read the same Avro data more than once, decode it once and write Parquet. Parquet keeps the types, adds per-column statistics, and lets every later read skip the columns and row groups it doesn't need:

```python
import fastavro
import pyarrow
import pyarrow.parquet as pq

with open("orders.avro", "rb") as f:
    table = pyarrow.Table.from_pylist(list(fastavro.reader(f)))

pq.write_table(table, "orders.parquet")
```

For a file larger than memory, write it in chunks with `pq.ParquetWriter`, converting one `block_reader` block (or a few thousand records) at a time.

Once it's Parquet, filter on read with pandas or query it with SQL in [Opteryx](/docs/guides/querying-local-data):

```python
import opteryx

morsels = opteryx.session().execute_to_morsels("""
    SELECT country, COUNT(*) AS orders, ROUND(AVG(amount), 2) AS avg_amount
      FROM READ_PARQUET('orders.parquet')
     WHERE status = 'delivered'
     GROUP BY country
     ORDER BY orders DESC
""")
df = pyarrow.concat_tables(m.to_arrow() for m in morsels).to_pandas()
```

See [How to read a Parquet file with Python](/docs/guides/read-a-parquet-file-with-python) for everything you can do from there.

## Which One to Use

| You want to... | Use |
|---|---|
| Load a file into pandas | `fastavro.reader` + `pd.DataFrame.from_records` |
| See the schema and codec | `fastavro.reader(f).writer_schema` |
| Read only some fields | A fastavro reader schema, or `pl.read_avro(columns=...)` |
| Keep only matching rows of a large file | A filtering generator over `fastavro.reader` |
| Query the same data repeatedly | Convert to Parquet once, then query that |

## Try It in a Notebook

The companion notebook writes a sample `orders.avro` with fastavro and runs every example on this page.

- [Open in Google Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-an-avro-file-with-python.ipynb)
- [Download the notebook (.ipynb)](/notebooks/read-an-avro-file-with-python.ipynb)

## Related

- [How to read a Parquet file with Python](/docs/guides/read-a-parquet-file-with-python)
- [How to read a JSON Lines file with Python](/docs/guides/read-a-json-lines-file-with-python)
- [Compatibility](/docs/roadmap-guarantees/compatibility)
