---
title: Convert JSON Lines to Parquet - the rugo Command and Python
description: Convert a JSON Lines (JSONL / NDJSON) file to Parquet with one rugo command, or with Python to declare column types. Explains why a numeric column can come out as text and how to fix it.
---

# Convert JSON Lines to Parquet

JSON Lines — also called JSONL or NDJSON — is one JSON object per line. It's what logs, event streams and API exports are made of, and it's a poor format to query: every line is parsed in full, there are no statistics, and the same key names are repeated on every row. Parquet stores each column once, with types and statistics. On the example below, 1.1 MB of JSONL becomes 87 KB of Parquet.

[Rugo](/docs/guides/rugo-standalone) does the conversion from the shell, with no Python in between.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- convert a JSONL file to Parquet with one command
- explain why a numeric column can come out as text
- declare types so the result is the same every time
- decide what happens to a malformed line

## Convert One File

```bash
pip install rugo
rugo convert space_missions.jsonl space_missions.parquet
```

```text
space_missions.jsonl (jsonl, 4630 rows) -> space_missions.parquet (parquet)
```

Both formats are inferred from the extensions. The example file is `space_missions.jsonl`, 4,630 orbital launch attempts. To make it, [download the Parquet version](https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/missions/space_missions.parquet) and run `rugo convert space_missions.parquet space_missions.jsonl`.

## Check the Types

```bash
rugo schema space_missions.parquet
```

```text
name            type     nullable
--------------  -------  --------
Company         varchar  True
Location        varchar  True
Price           varchar  True
Lauched_at      varchar  True
Rocket          varchar  True
Rocket_Status   varchar  True
Mission         varchar  True
Mission_Status  varchar  True
```

Look at `Price`. It is a number in the data, and it came out as text. JSONL has no schema, so the reader decides each column's type from the first **5** records. The earliest launches in this file have no recorded price, so `Price` is `null` in all five, and with no value to go on the column falls back to text.

This is the thing to watch for with JSONL. The conversion succeeds, and the damage only shows when you try to sum the column.

## Fix It with Python

The command has no options for types. In Python you can look at more records, or say what the type is.

Look at more records:

```python
from rugo import parquet
from rugo.jsonl import read_jsonl

with read_jsonl("space_missions.jsonl", infer_sample_size=500) as reader:
    with open("space_missions.parquet", "wb") as f:
        with parquet.open_parquet_writer(f.write) as writer:
            for morsel in reader:
                writer.write_row_group(morsel)
```

Or declare the columns you depend on, which is the safer choice for a pipeline:

```python
with read_jsonl(
    "space_missions.jsonl",
    explicit_schema={"Price": "DOUBLE", "Lauched_at": "TIMESTAMP"},
) as reader:
    ...  # same writer loop as above
```

`Price` is then `float64` and `Lauched_at` is `timestamp[us]`. A declared column is parsed strictly: a value that doesn't fit, such as `"N/A"` in a `DOUBLE` column, fails with an error naming the column, the row and the value. Timestamps are never guessed, so without the declaration `Lauched_at` stays text.

The sample size also decides **which columns exist**. A key that first appears after the sample window isn't read at all, so if a field is rare, raise `infer_sample_size` or declare it.

## Malformed Lines

By default a line that isn't valid JSON fails the read, naming the line number and byte offset. To skip bad lines instead, pass `fail_on_error=False` to `read_jsonl`. Keep the default in pipelines, where a bad line means a bad upstream writer. Skip when exploring a file you don't control.

## Convert a Folder of JSONL Files

```bash
for f in logs/*.jsonl; do rugo convert "$f" "${f%.jsonl}.parquet"; done
```

Each file is typed from its own first records, so two files can disagree about a column. Declare the types with `explicit_schema` and every file comes out the same. [Combine and split JSON Lines files](/docs/guides/combine-and-split-jsonl-files) covers putting the results together.

## Large Files

`rugo convert` builds the whole result in memory before writing it. For a file that doesn't fit, use the Python route above, which writes one Parquet row group per batch.

## Or Skip the Conversion

Opteryx reads JSONL directly with [`READ_JSONL`](/docs/reference/sql/statements/read-jsonl), which suits a one-off question. Convert when you'll query the same data repeatedly, so each query reads less.

## Related

- [How to Read a JSON Lines File with Python](/docs/guides/read-a-json-lines-file-with-python)
- [Convert CSV to Parquet](/docs/guides/convert-csv-to-parquet)
- [Combine and split JSON Lines files](/docs/guides/combine-and-split-jsonl-files)
- [The Rugo Command Line](/docs/guides/rugo-cli)
