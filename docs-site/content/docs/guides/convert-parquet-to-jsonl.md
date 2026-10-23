---
title: Convert Parquet to JSON Lines - the rugo Command and Python
description: Convert a Parquet file to JSON Lines (JSONL / NDJSON) with one rugo command, or with Python to choose the columns. Shows what each line looks like and what is lost on the way out.
---

# Convert Parquet to JSON Lines

JSON Lines — also called JSONL or NDJSON — is one JSON object per line. It is what log shippers, message queues, search indexes and many APIs accept, and it is easy to stream because a line is a complete record. [Rugo](/docs/guides/rugo-standalone) writes it from a Parquet file with a single command.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- convert a Parquet file to JSONL with one command
- know what each line looks like — nulls, numbers, timestamps
- write only some of the columns
- know what is lost, and what happens when the JSONL is read back

## Convert One File

```bash
pip install rugo
rugo convert space_missions.parquet space_missions.jsonl
```

```text
space_missions.parquet (parquet, 4630 rows) -> space_missions.jsonl (jsonl)
```

The example file is `space_missions.parquet`, 4,630 orbital launch attempts. [Download it](https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/missions/space_missions.parquet) from the Opteryx repository.

## What Each Line Looks Like

```json
{"Company":"US Air Force","Location":"SLC-20, Cape Canaveral AFS, Florida, USA","Price":63.23,"Lauched_at":"1964-09-01T15:00:00+00:00","Rocket":"Titan IIIA","Rocket_Status":"Retired","Mission":"Transtage 1","Mission_Status":"Failure"}
```

- **Every line is one row**, with the column names as keys.
- **Nulls are `null`.** The earliest launches have `"Price":null`.
- **Numbers are JSON numbers**, not strings: `63.23`.
- **Timestamps are ISO-8601 text**, with the UTC offset.

The key names are repeated on every line, which is why the file is large: 1.1 MB, against 93 KB for the Parquet.

## What Is Lost

JSON has strings, numbers, booleans and null, and no other types. Dates and timestamps become text, and the column types, nullability and statistics in the Parquet footer aren't written.

Reading the JSONL back guesses the types from the first 5 records. Here those records have no price, so `Price` is read as text and not a number. If you're going to read the file again, [Convert JSON Lines to Parquet](/docs/guides/convert-jsonl-to-parquet#fix-it-with-python) shows how to declare the types.

## Write Only Some of the Columns

The command writes every column. To choose, use Python, which reads just the columns you ask for — the rest are never decoded:

```python
from rugo import parquet
from rugo.jsonl import write_jsonl

with parquet.read_parquet(
    "space_missions.parquet", columns=["Company", "Mission", "Price"]
) as reader:
    with open("missions_subset.jsonl", "wb") as f:
        for morsel in reader:
            f.write(write_jsonl(morsel))
```

Reading Parquet by column is also where the filtering options live — see [How to Read a Parquet File with Python](/docs/guides/read-a-parquet-file-with-python) for `predicates`, which let you write only the matching rows.

## Large Files

`rugo convert` builds the whole result in memory before writing it. The Python route above writes one batch at a time, so the JSONL can be larger than memory.

## Related

- [Convert Parquet to CSV](/docs/guides/convert-parquet-to-csv)
- [Convert JSON Lines to Parquet](/docs/guides/convert-jsonl-to-parquet)
- [Combine and split JSON Lines files](/docs/guides/combine-and-split-jsonl-files)
- [The Rugo Command Line](/docs/guides/rugo-cli)
