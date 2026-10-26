---
title: How to Read an Avro File with Python - Rugo, Opteryx and pandas
description: Read an Apache Avro file in Python with Rugo and load it into pandas. Inspect the embedded schema, select fields including nested ones, read with a reader schema, and convert Avro to Parquet to query it with SQL.
---

# How to Read an Avro File with Python

Apache Avro is a row-oriented binary format. Each file starts with a header holding the **writer schema** as JSON, followed by compressed blocks of records encoded against that schema. You'll meet it in Kafka pipelines, Hadoop-era data lakes and Iceberg manifest files — anywhere records are written one at a time and the schema has to travel with the data.

Being row-oriented shapes how you read it. Parquet stores each column separately with statistics, so a reader can skip columns and row groups it doesn't need. Avro stores whole records one after another, with no statistics, so there's nothing that lets a reader skip records unread. Choosing columns still pays — fields you don't ask for are never turned into columns — but filtering rows happens after decoding.

This page uses **[Rugo](/docs/guides/rugo-standalone)**, the file reader inside Opteryx, published on its own. It hands results over as Arrow, which pandas converts directly.

> **Try it yourself:** every example on this page runs in the companion notebook. [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-an-avro-file-with-python.ipynb) or [download the notebook](/notebooks/read-an-avro-file-with-python.ipynb).

## What You'll Be Able to Do

By the end of this page you'll be able to:

- read an Avro file's schema and codec without reading its records
- load an Avro file into a pandas DataFrame with Rugo
- read only the fields you need, including fields inside nested records
- read a file through a reader schema, to rename, drop or add fields
- query Avro with SQL, or convert it to Parquet first when you'll query it again and again

## Install

```bash
pip install rugo opteryx-core pandas pyarrow
```

Rugo and Opteryx have no dependencies of their own. pandas and PyArrow are only needed for the final step, turning the result into a DataFrame.

The examples use `space_missions.avro`, 4,630 orbital launch attempts. [Download it](https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/avro/space_missions.avro) from the Opteryx repository.

## Read the Schema First

The schema is in the header, so you can see what a file holds without decoding a single record:

```python
from rugo.avro import read_metadata

meta = read_metadata("space_missions.avro")
print(meta.codec)       # 'deflate'
print(meta.columns)     # top-level field names

for field in meta.schema["fields"]:
    print(field["name"], field["type"])
```

```text
Company         string
Location        string
Price           ['null', 'double']
Lauched_at      ['null', {'type': 'long', 'logicalType': 'timestamp-micros'}]
Rocket          {'type': 'record', 'name': 'Rocket', 'fields': [{'name': 'Name', ...}, {'name': 'Status', ...}]}
Mission         string
Mission_Status  string
```

`["null", "double"]` is how Avro spells a nullable column. `Rocket` is a nested record with a name and an enum status.

## Load an Avro File into pandas

```python
import pyarrow
from rugo.avro import read_avro

with read_avro("space_missions.avro") as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
```

`read_avro` yields **morsels** — batches of columns made of whole Avro blocks, up to 65,536 rows each. Each converts to an Arrow table; concatenate them and convert once to get a single DataFrame.

Types come from the schema. Logical types are decoded for you — `timestamp-micros` arrives as a datetime — and a nested record arrives as JSON text:

```text
Company                   str
Location                  str
Price                 float64
Lauched_at     datetime64[us]
Rocket                    str     {"Name":"Sputnik 8K71PS","Status":"Retired"}
Mission                   str
Mission_Status            str
```

## Read Only the Fields You Need

Name the fields with `columns`. A dotted name reads one field out of a nested record as an ordinary column, so you don't have to parse the JSON:

```python
with read_avro(
    "space_missions.avro",
    columns=["Company", "Mission", "Rocket.Name", "Rocket.Status"],
) as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
```

```text
     Company       Mission     Rocket.Name Rocket.Status
0  RVSN USSR     Sputnik-1  Sputnik 8K71PS       Retired
1  RVSN USSR     Sputnik-2  Sputnik 8K71PS       Retired
2    US Navy  Vanguard TV3        Vanguard       Retired
```

Enums come back as their symbol text. A field that isn't in the schema raises an error rather than returning an empty column.

## Filtering Rows

There's no `predicates` argument: with no statistics in an Avro file, there's nothing a reader could use to skip records. Filter each morsel as it arrives, so the DataFrame you build only ever holds the matching rows:

```python
import pandas as pd

parts = []
with read_avro("space_missions.avro", columns=["Company", "Mission", "Price"]) as reader:
    for morsel in reader:
        chunk = morsel.to_arrow().to_pandas()
        parts.append(chunk[(chunk["Company"] == "SpaceX") & (chunk["Price"] < 60)])

df = pd.concat(parts, ignore_index=True)
# 25 rows
```

`read_avro` reads the file into memory before decoding it, so the file itself has to fit. If you'll filter the same data again and again, [convert it to Parquet](/docs/guides/convert-avro-to-parquet) and let the reader skip what it doesn't need.

## Read Through a Reader Schema

Avro's way to change the shape of what you read is a **reader schema**: the schema you want, matched against the schema the file was written with.

```python
reader_schema = {
    "type": "record",
    "name": "Launch",
    "fields": [
        {"name": "Mission", "type": "string"},
        {"name": "Price", "type": ["null", "double"], "default": None},
        {"name": "Source", "type": "string", "default": "space_missions"},
        {"name": "Rocket", "type": {"type": "record", "name": "Rocket", "fields": [
            {"name": "Name", "type": "string"},
            {"name": "Stages", "type": ["null", "int"], "default": None},
        ]}},
    ],
}

with read_avro("space_missions.avro", reader_schema=reader_schema) as reader:
    df = pyarrow.concat_tables(morsel.to_arrow() for morsel in reader).to_pandas()
```

```text
     Mission  Price          Source                                   Rocket
0  Sputnik-1    NaN  space_missions  {"Name":"Sputnik 8K71PS","Stages":null}
1  Sputnik-2    NaN  space_missions  {"Name":"Sputnik 8K71PS","Stages":null}
```

Fields left out of the reader schema are dropped. A field the file doesn't have takes its `default` (`Source`, `Rocket.Stages`). Numbers can be widened — `int` to `long`, `float` to `double`. This is how Avro lets files written with an old version of a schema be read with a new one. When both schemas carry field IDs, as Iceberg's do, fields are matched by ID instead of by name.

## What Rugo Reads

- **Codecs:** null, deflate, snappy and zstandard. bzip2 and xz are refused by name.
- **Types:** all primitive types, enums, fixed, `date`, `time-*`, `timestamp-millis`/`-micros` (as UTC), decimals up to 38 digits, and arrays of scalars. Records, maps and arrays of nested values come back as JSON text.
- **Not supported:** unions other than `["null", T]`, recursive types, `uuid`, `timestamp-nanos`, `local-timestamp-*` and `duration`.
- **Writing:** Rugo can also write Avro — `write_avro` and `open_avro_writer` in `rugo.avro`, or `rugo convert data.parquet data.avro` from the [command line](/docs/guides/rugo-cli).

## Query with SQL

Opteryx reads Avro directly with `READ_AVRO`, which takes a file path or a wildcard. As with the Python reader, the nested `Rocket` record is JSON text, and `->>` pulls a field out of it:

```python
import opteryx
import pyarrow

morsels = opteryx.session().execute_to_morsels("""
    SELECT Company, COUNT(*) AS launches
      FROM READ_AVRO('space_missions.avro')
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

`READ_AVRO` has the same limits as any Avro reader: there are no statistics to skip data with, so a filter reads every row. If you'll query the data more than once, convert it once and query the Parquet copy. Rugo reads the Avro and writes the Parquet, with the types from the Avro schema carried across:

```python
from rugo import parquet
from rugo.avro import read_avro

with read_avro("space_missions.avro") as reader:
    with open("space_missions.parquet", "wb") as f:
        with parquet.open_parquet_writer(f.write) as writer:
            for morsel in reader:
                writer.write_row_group(morsel)
```

From the shell it is one command, `rugo convert space_missions.avro space_missions.parquet` — see [Convert Avro to Parquet](/docs/guides/convert-avro-to-parquet) for batch conversion and how types come across. Then query the Parquet file with [Opteryx](/docs/guides/querying-local-data); the nested `Rocket` record is still JSON text:

```python
import opteryx
import pyarrow

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
| See the schema and codec | `read_metadata` |
| Load a file into pandas | `read_avro` |
| Read some fields, including nested ones | `read_avro` with `columns` (dotted names for nested fields) |
| Read old and new schema versions together | `read_avro` with a `reader_schema` |
| Query it once with SQL | `READ_AVRO` in Opteryx |
| Aggregate, join or filter repeatedly | Convert to Parquet with `rugo convert`, then query with Opteryx |

## Try It in a Notebook

The companion notebook downloads `space_missions.avro` and runs every example on this page.

- [Open in Google Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/read-an-avro-file-with-python.ipynb)
- [Download the notebook (.ipynb)](/notebooks/read-an-avro-file-with-python.ipynb)

## Related

- [Convert Avro to Parquet](/docs/guides/convert-avro-to-parquet)
- [How to read an ORC file with Python](/docs/guides/read-an-orc-file-with-python)
- [How to read a Parquet file with Python](/docs/guides/read-a-parquet-file-with-python)
- [How to read a JSON Lines file with Python](/docs/guides/read-a-json-lines-file-with-python)
- [Using Rugo Standalone](/docs/guides/rugo-standalone)
- [The Rugo Command Line](/docs/guides/rugo-cli)
- [Compatibility](/docs/roadmap-guarantees/compatibility)
