---
title: Convert Avro to Parquet - the rugo Command and Python
description: Convert Apache Avro files to Parquet with one rugo command, or with Python for streaming output. Covers batch conversion, how Avro types map across, and why queries on the Parquet copy are so much faster.
---

# Convert Avro to Parquet

Avro is a good format to *write* — records land one at a time, with the schema alongside. It is a poor format to *query*. Every record is stored whole, there are no column statistics, and a filter on one column still steps through every field of every row. Parquet stores each column separately with statistics, so a reader can skip what it doesn't need. On ClickBench's 100 million rows, the same data stored as Parquet runs about 26× faster in Opteryx than the Avro copy (see [the Avro reader post](/blog/2026-10-11-avro-reader)).

So the usual pattern is to let Avro do the landing and convert once. [Rugo](/docs/guides/rugo-standalone) does the conversion in a single command, with no Python in between.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- convert an Avro file to Parquet from the shell
- check the result without opening it
- convert a folder of Avro files, and merge them into one
- know how Avro types and nested records come across
- split one Avro file into several Parquet files
- convert from Python when you need streaming output

## Convert One File

```bash
pip install rugo
rugo convert space_missions.avro space_missions.parquet
```

```text
space_missions.avro (avro, 4630 rows) -> space_missions.parquet (parquet)
```

Both formats are inferred from the extensions. The example file is `space_missions.avro`, 4,630 orbital launch attempts; [download it](https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/avro/space_missions.avro) from the Opteryx repository.

## Check the Result

The row count should match, and the schema should carry the types across:

```bash
rugo count space_missions.avro
rugo count space_missions.parquet
rugo schema space_missions.parquet
```

```text
4630
4630
name            type           nullable
--------------  -------------  --------
Company         varchar        True
Location        varchar        True
Price           float64        True
Lauched_at      timestamp[us]  True
Rocket          varchar        True
Mission         varchar        True
Mission_Status  varchar        True
```

The Parquet file also gains something the Avro file never had — column statistics. `describe` reads them from the footer without scanning any rows, and it refuses to run on the Avro original because Avro has no footer to read:

```bash
rugo describe space_missions.parquet
```

```text
name            type           null_count  min        max       distinct_count
--------------  -------------  ----------  ---------  --------  --------------
Company         varchar        0           AEB        i-Space   62
Price           float64        3380        2.5        450.0
Mission_Status  varchar        0           Failure    Success   4
```

Those statistics are what lets a query skip data. `Price` is null in 3,380 of 4,630 rows, which you can see before writing a single query.

## How Types Come Across

The Avro schema is read from the file header and its types are carried into the Parquet schema:

| Avro | Parquet |
|---|---|
| `["null", T]` | nullable column of `T` |
| `timestamp-millis`, `timestamp-micros` | `timestamp`, in UTC |
| enum | text, using the symbol |
| record, map, array of nested values | JSON text |

A nested record becomes a single text column holding JSON — `Rocket` above is `{"Name":"Sputnik 8K71PS","Status":"Retired"}`. Opteryx's `->>` operator pulls a field back out:

```sql
SELECT Company, COUNT(*) AS launches
  FROM READ_PARQUET('space_missions.parquet')
 WHERE Rocket->>'Status' = 'Active'
 GROUP BY Company
 ORDER BY launches DESC
 LIMIT 5
```

If a nested field is one you filter on constantly, read it out as its own column when you convert — see [Python](#convert-from-python) below. Avro features Rugo doesn't read (unions other than `["null", T]`, recursive types, `uuid`, `duration` and a few others) are refused with an error rather than skipped; the full list is on [How to Read an Avro File with Python](/docs/guides/read-an-avro-file-with-python#what-rugo-reads).

## Convert a Folder of Avro Files

Kafka sinks and change-capture tools tend to leave many small Avro files. A shell loop converts each one beside the original:

```bash
for f in events/*.avro; do rugo convert "$f" "${f%.avro}.parquet"; done
```

```text
events/part0000.avro (avro, 2000 rows) -> events/part0000.parquet (parquet)
events/part0001.avro (avro, 2000 rows) -> events/part0001.parquet (parquet)
events/part0002.avro (avro, 630 rows) -> events/part0002.parquet (parquet)
```

Opteryx can read a folder of Parquet files as one table, so that is often enough. To end up with a single file instead, `merge` concatenates files that share a schema:

```bash
rugo merge events/*.parquet events.parquet
```

```text
merged 3 files (4630 rows) -> events.parquet
```

Schemas must match on column names, order and types; a mismatch fails rather than filling with nulls. You can also hand `merge` the Avro files directly and skip the loop:

```bash
rugo merge events/*.avro events.parquet
```

## Split One Avro File into Several Parquet Files

`split` writes parts of a fixed number of rows, and `--format` chooses what to write:

```bash
rugo split space_missions.avro --rows 2000 --format parquet
```

```text
space_missions.part0000.parquet  (2000 rows)
space_missions.part0001.parquet  (2000 rows)
space_missions.part0002.parquet  (630 rows)
```

Parts land beside the input and are numbered so a wildcard lists them in order. See [Combine and split Avro files](/docs/guides/combine-and-split-avro-files) and [Combine and split Parquet files](/docs/guides/combine-and-split-parquet-files) for more on both verbs.

## Convert from Python

The command builds the whole result in memory before writing it. That is fine for most files; for control over the output, use the Python API, which writes one Parquet row group per batch as it is decoded:

```python
from rugo import parquet
from rugo.avro import read_avro

with read_avro("space_missions.avro") as reader:
    with open("space_missions.parquet", "wb") as f:
        with parquet.open_parquet_writer(f.write) as writer:
            for morsel in reader:
                writer.write_row_group(morsel)
```

This is also where you can reshape on the way through. `read_avro` takes `columns`, including dotted names for fields inside a nested record, so the nested values arrive as ordinary columns:

```python
with read_avro(
    "space_missions.avro",
    columns=["Company", "Mission", "Rocket.Name", "Rocket.Status"],
) as reader:
    ...  # same writer loop as above
```

Note that `read_avro` reads the Avro file into memory before decoding it, so the *input* file still has to fit. If it doesn't, split it upstream. The Python route bounds the memory used for the Parquet output, not for the Avro input.

## Or Skip the Conversion

Opteryx can also query Avro directly with `READ_AVRO`, which is the right choice for a one-off look at a file:

```sql
SELECT COUNT(*) FROM READ_AVRO('events/*.avro');
```

Convert when you will query the same data more than once. You pay for the conversion once, and every query after that reads less.

## Related

- [How to Read an Avro File with Python](/docs/guides/read-an-avro-file-with-python)
- [How to Read a Parquet File with Python](/docs/guides/read-a-parquet-file-with-python)
- [The Rugo Command Line](/docs/guides/rugo-cli)
- [Using Rugo Standalone](/docs/guides/rugo-standalone)
