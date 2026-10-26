---
title: Convert ORC to Parquet - Rugo and Python
description: Convert Apache ORC files to Parquet with a few lines of Python and Rugo, streaming one stripe at a time. Covers checking the result, converting a folder, merging many ORC files into one Parquet file, and how ORC types map across.
---

# Convert ORC to Parquet

ORC and Parquet are close relatives — both are columnar, both compress each column separately, both keep their schema in a footer. If your data lands as ORC, from Hive, Spark or an Iceberg table, you can query it where it is: Opteryx reads it directly with `READ_ORC`.

The reason to convert is the rest of the toolchain. Opteryx prunes Parquet files hard — it skips row groups using the statistics in the footer, probes bloom filters, and checks dictionaries before it decodes a page (see [Rugo — the file engine](/docs/reference/internals/rugo)). Rugo does not yet skip ORC stripes from their statistics, so a filter on an ORC file decodes every stripe it touches. So the usual pattern is to let ORC do the landing and convert once, when you'll query the data more than once.

[Rugo](/docs/guides/rugo-standalone) reads ORC and writes Parquet. The `rugo` command line does not read ORC yet, so the conversion is a few lines of Python.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- convert an ORC file to Parquet, one stripe at a time
- check the result against the original without opening either file
- convert a folder of ORC files, or merge them into one Parquet file
- know how ORC types and nested types come across

## Convert One File

```bash
pip install rugo
```

```python
from rugo import parquet
from rugo.orc import read_orc

with open("space_missions.parquet", "wb") as f:
    with parquet.open_parquet_writer(f.write) as writer:
        for morsel in read_orc("space_missions.orc"):
            writer.write_row_group(morsel)
```

`read_orc` yields one morsel per stripe and the writer takes one row group per call, so the Parquet output is written as the ORC is decoded rather than built up in memory first. The example file is `space_missions.orc`, 4,630 orbital launch attempts; [download it](/data/space_missions.orc) from this site.

Note that `read_orc` reads the ORC file into memory before decoding it, so the *input* file still has to fit. The streaming bounds the memory used for the Parquet output, not for the ORC input.

## Check the Result

Both files carry their row count and schema in the footer, so you can compare them without reading any rows:

```python
from rugo import parquet
from rugo.orc import read_metadata

orc = read_metadata("space_missions.orc")
pq = parquet.read_metadata("space_missions.parquet")

print(orc.num_rows, pq.num_rows)

for column in pq.schema_columns:
    print(column.name, column.logical_type or column.physical_type)
```

```text
4630 4630
Company varchar
Location varchar
Price float64
Lauched_at timestamp[us]
Rocket varchar
Mission varchar
Mission_Status varchar
```

The row counts match and every column has come across with its type.

## How Types Come Across

The ORC footer's types are carried into the Parquet schema:

| ORC | Parquet |
|---|---|
| byte, short, int, long | `int8`, `int16`, `int32`, `int64` |
| float, double | `float32`, `float64` |
| string, varchar, char | `varchar` |
| date | `date32` |
| timestamp, timestamp with local time zone | `timestamp[us]`, in UTC |
| decimal | `decimal`, with its precision and scale |
| list of a scalar | array |
| struct, map | JSON text, as `varchar` |

A nested struct becomes a single text column holding JSON — `Rocket` above is `{"Name":"Sputnik 8K71PS","Status":"Retired"}`. Opteryx's `->>` operator pulls a field back out:

```sql
SELECT Company, COUNT(*) AS launches
  FROM READ_PARQUET('space_missions.parquet')
 WHERE Rocket->>'Status' = 'Active'
 GROUP BY Company
 ORDER BY launches DESC
 LIMIT 5
```

ORC features Rugo doesn't read (union columns, nanosecond timestamps, a `TIMESTAMP` written in a non-UTC zone, encrypted files, LZO compression) are refused with an error rather than skipped; the full list is on [How to Read an ORC File with Python](/docs/guides/read-an-orc-file-with-python#what-rugo-reads).

## Convert a Folder of ORC Files

Hive and Spark jobs tend to leave many part files. A loop converts each one beside the original:

```python
import glob
from rugo import parquet
from rugo.orc import read_orc

for path in sorted(glob.glob("events/*.orc")):
    out = path[: -len(".orc")] + ".parquet"
    rows = 0
    with open(out, "wb") as f:
        with parquet.open_parquet_writer(f.write) as writer:
            for morsel in read_orc(path):
                writer.write_row_group(morsel)
                rows += morsel.num_rows
    print(f"{path} ({rows} rows) -> {out}")
```

```text
events/part0000.orc (2000 rows) -> events/part0000.parquet
events/part0001.orc (2000 rows) -> events/part0001.parquet
events/part0002.orc (630 rows) -> events/part0002.parquet
```

Opteryx can read a folder of Parquet files as one table, so that is often enough:

```sql
SELECT COUNT(*) FROM READ_PARQUET('events/*.parquet');
```

## Merge Many ORC Files into One Parquet File

To end up with a single file, open the writer once and feed it every input. Each stripe becomes one row group, so three single-stripe files make a Parquet file with three row groups:

```python
import glob
from rugo import parquet
from rugo.orc import read_orc

with open("events.parquet", "wb") as f:
    with parquet.open_parquet_writer(f.write) as writer:
        for path in sorted(glob.glob("events/*.orc")):
            for morsel in read_orc(path):
                writer.write_row_group(morsel)
```

```python
meta = parquet.read_metadata("events.parquet")
print(meta.num_rows, meta.num_row_groups)
```

```text
4630 3
```

The files have to share a schema. Rugo does not fill gaps with nulls: a file whose columns differ from the first is a mistake to find, not a difference to paper over, so check each file's `read_metadata` first if you aren't sure.

## Or Skip the Conversion

Opteryx can also query ORC directly with `READ_ORC`, which is the right choice for a one-off look at a file or folder:

```sql
SELECT COUNT(*) FROM READ_ORC('events/*.orc');
```

Convert when you will query the same data more than once. You pay for the conversion once, and every query after that reads less.

## Related

- [How to Read an ORC File with Python](/docs/guides/read-an-orc-file-with-python)
- [Convert Avro to Parquet](/docs/guides/convert-avro-to-parquet)
- [How to Read a Parquet File with Python](/docs/guides/read-a-parquet-file-with-python)
- [Using Rugo Standalone](/docs/guides/rugo-standalone)
