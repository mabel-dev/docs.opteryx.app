---
title: How to Read an ORC File with Python - Rugo, Opteryx and pandas
description: Read an Apache ORC file in Python with Rugo and load it into pandas. Inspect the footer without reading any data, select columns, see how nested types come across, and convert ORC to Parquet to query it with SQL.
---

# How to Read an ORC File with Python

Apache ORC is a column-oriented binary format from the Hadoop and Hive world. A file is a series of **stripes**, each holding the columns of a few tens of thousands of rows, followed by a footer that records the schema, the row count and per-column statistics. You'll meet it in Hive and Spark data lakes, and as one of the three file formats Iceberg tables can use.

Being column-oriented shapes how you read it. The footer is at the end of the file, so a reader can tell you the schema, the row count and the compression codec without decoding a single value. Choosing columns pays too: a column you don't ask for is never decoded.

This page uses **[Rugo](/docs/guides/rugo-standalone)**, the file reader inside Opteryx, published on its own. It hands results over as Arrow, which pandas converts directly.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- read an ORC file's schema, row count and codec without reading its data
- load an ORC file into a pandas DataFrame with Rugo
- read only the columns you need
- know how ORC's nested types come across
- query ORC with SQL, or convert it to Parquet first when you'll query it again and again

## Install

```bash
pip install rugo opteryx-core pandas pyarrow
```

Rugo and Opteryx have no dependencies of their own. pandas and PyArrow are only needed for the final step, turning the result into a DataFrame.

The examples use `space_missions.orc`, 4,630 orbital launch attempts, with a nested `Rocket` struct. [Download it](/data/space_missions.orc) from this site. It is the same data as the Avro examples in [How to Read an Avro File with Python](/docs/guides/read-an-avro-file-with-python), so the two pages can be compared line by line.

## Read the Footer First

The footer is at the end of the file, so you can see what a file holds without decoding a single value:

```python
from rugo.orc import read_metadata

meta = read_metadata("space_missions.orc")
print(meta.compression)   # 'zstd'
print(meta.num_rows)      # 4630
print(meta.stripes)       # 1

for column in meta.columns:
    print(column["name"], column["kind"])
```

```text
Company         STRING
Location        STRING
Price           DOUBLE
Lauched_at      TIMESTAMP
Rocket          STRUCT
Mission         STRING
Mission_Status  STRING
```

`kind` is the ORC type. `Rocket` is a nested struct with a name and a status. Unlike Avro, ORC has no separate nullable type: every column may hold nulls.

## Load an ORC File into pandas

```python
import pyarrow
from rugo.orc import read_orc

df = pyarrow.concat_tables(morsel.to_arrow() for morsel in read_orc("space_missions.orc")).to_pandas()
```

`read_orc` yields **morsels** — batches of columns, one per stripe. Each converts to an Arrow table; concatenate them and convert once to get a single DataFrame. Unlike `read_avro` it is a plain iterator rather than a context manager.

Types come from the footer:

```text
Company                   str
Location                  str
Price                 float64
Lauched_at     datetime64[us]
Rocket                    str     {"Name":"Sputnik 8K71PS","Status":"Retired"}
Mission                   str
Mission_Status            str
```

## Read Only the Columns You Need

Name the columns with `columns`. Streams for the columns you leave out are skipped rather than decoded:

```python
df = pyarrow.concat_tables(
    morsel.to_arrow()
    for morsel in read_orc("space_missions.orc", columns=["Company", "Mission", "Rocket"])
).to_pandas()
```

```text
     Company       Mission                                        Rocket
0  RVSN USSR     Sputnik-1  {"Name":"Sputnik 8K71PS","Status":"Retired"}
1  RVSN USSR     Sputnik-2  {"Name":"Sputnik 8K71PS","Status":"Retired"}
2    US Navy  Vanguard TV3        {"Name":"Vanguard","Status":"Retired"}
```

A column that isn't in the file raises an error rather than returning an empty column. Unlike the Avro reader, `columns` takes top-level names only: a dotted name such as `Rocket.Name` is refused, so read `Rocket` and take the field out of it afterwards — with `->>` in SQL, as below, or with `json.loads` in Python.

## How Nested Types Come Across

| ORC | Rugo |
|---|---|
| struct | JSON text |
| map | JSON text |
| list of a scalar | array |
| timestamp, timestamp with local time zone | timestamp, in UTC |
| date | date |
| decimal | decimal |

A nested struct becomes a single text column holding JSON, as it does for Avro. Lists of scalars stay arrays.

## Filtering Rows

There is no `predicates` argument, and Rugo does not yet use the footer's statistics to skip stripes, so a filter happens after decoding. Do it in pandas:

```python
spacex = df[df["Company"] == "SpaceX"]
```

Or filter in SQL — see below.

## What Rugo Reads

- **Codecs:** none, zlib, snappy, lz4 and zstandard. LZO is refused by name.
- **Types:** boolean, byte, short, int, long, float, double, string, varchar, char, binary, date, timestamp, timestamp with local time zone, decimal, structs, maps and lists.
- **Not supported:** union columns, nanosecond timestamp units, encrypted files, and a `TIMESTAMP` written in a time zone other than UTC. These are refused with an error naming the problem, rather than skipped.
- **Reading by Iceberg field ID:** `read_orc` takes `reader` and `match_by_id` for files written by Iceberg, which carry a field ID on every column. It is the interface Opteryx uses to read an Iceberg table's ORC data files and is not needed for ordinary files.
- **Memory:** Rugo reads the whole file into memory before decoding it, so the file has to fit; the morsels are then produced one stripe at a time.
- **Writing:** Rugo reads ORC but does not write it. To produce ORC, use Spark, Hive or PyArrow.

## Query with SQL

Opteryx reads ORC directly with `READ_ORC`, which takes a file path or a wildcard. As with the Python reader, the nested `Rocket` struct is JSON text, and `->>` pulls a field out of it:

```python
import opteryx
import pyarrow

morsels = opteryx.session().execute_to_morsels("""
    SELECT Company, COUNT(*) AS launches
      FROM READ_ORC('space_missions.orc')
     WHERE Rocket->>'Status' = 'Active'
     GROUP BY Company
     ORDER BY launches DESC
     LIMIT 5
""")
df = pyarrow.concat_tables(m.to_arrow() for m in morsels).to_pandas()
```

```text
       Company  launches
0         CASC       281
1  Arianespace       128
2       SpaceX       120
3          ULA        83
4     Northrop        69
```

## Convert to Parquet for Repeated Queries

If you'll query the data more than once, convert it once and query the Parquet copy. Rugo reads the ORC and writes the Parquet one row group per stripe, with the types carried across:

```python
from rugo import parquet
from rugo.orc import read_orc

with open("space_missions.parquet", "wb") as f:
    with parquet.open_parquet_writer(f.write) as writer:
        for morsel in read_orc("space_missions.orc"):
            writer.write_row_group(morsel)
```

See [Convert ORC to Parquet](/docs/guides/convert-orc-to-parquet) for checking the result and how types come across. Then query the Parquet file with [Opteryx](/docs/guides/querying-local-data); the nested `Rocket` struct is still JSON text:

```python
morsels = opteryx.session().execute_to_morsels("""
    SELECT Company, COUNT(*) AS launches
      FROM READ_PARQUET('space_missions.parquet')
     WHERE Rocket->>'Status' = 'Active'
     GROUP BY Company
     ORDER BY launches DESC
     LIMIT 5
""")
df = pyarrow.concat_tables(m.to_arrow() for m in morsels).to_pandas()
```

```text
       Company  launches
0         CASC       281
1  Arianespace       128
2       SpaceX       120
3          ULA        83
4     Northrop        69
```

From here, everything in [How to read a Parquet file with Python](/docs/guides/read-a-parquet-file-with-python) applies — column selection and filters that skip data before it's decoded.

## Which One to Use

| You want to... | Use |
|---|---|
| See the schema, row count and codec | `read_metadata` |
| Load a file into pandas | `read_orc` |
| Read some columns | `read_orc` with `columns` |
| Query it once with SQL | `READ_ORC` in Opteryx |
| Aggregate, join or filter repeatedly | Convert to Parquet, then query with Opteryx |

## Related

- [Convert ORC to Parquet](/docs/guides/convert-orc-to-parquet)
- [How to read an Avro file with Python](/docs/guides/read-an-avro-file-with-python)
- [How to read a Parquet file with Python](/docs/guides/read-a-parquet-file-with-python)
- [How to read a JSON Lines file with Python](/docs/guides/read-a-json-lines-file-with-python)
- [Using Rugo Standalone](/docs/guides/rugo-standalone)
- [Compatibility](/docs/roadmap-guarantees/compatibility)
