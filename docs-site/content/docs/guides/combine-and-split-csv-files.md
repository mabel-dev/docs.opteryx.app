---
title: Combine and Split CSV Files - the rugo Command
description: Merge many CSV files into one, or split a big CSV into parts, with the rugo command. Handles the header row for you, and explains the type mismatch that can stop a merge.
---

# Combine and Split CSV Files

CSVs pile up in the wrong shapes: a file per day that you want as a month, or one enormous export that a spreadsheet or an import tool can't open. Unix has tools for this (`cat`, `split`), but CSV has a header row, and the Unix tools don't know about it. [Rugo](/docs/guides/rugo-standalone) does: `merge` and `split` keep exactly one header per file.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- split a large CSV into parts, each with its own header
- merge CSVs into one file with a single header
- understand why a merge was refused for a type mismatch
- decide when `cat` and `split` are enough

## Split a File

```bash
pip install rugo
rugo split space_missions.csv --rows 2000
```

```text
space_missions.part0000.csv  (2000 rows)
space_missions.part0001.csv  (2000 rows)
space_missions.part0002.csv  (630 rows)
```

The example file is `space_missions.csv`, 4,630 orbital launch attempts. To make it, [download the Parquet version](https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/missions/space_missions.parquet) and run `rugo convert space_missions.parquet space_missions.csv`.

Each part starts with the header row, so it opens on its own:

```bash
head -2 space_missions.part0001.csv
```

```text
Company,Location,Price,Lauched_at,Rocket,Rocket_Status,Mission,Mission_Status
NASA,"LC-39A, Kennedy Space Center, Florida, USA",450.0,1982-06-27T16:09:00+00:00,Space Shuttle Columbia,Retired,STS-4,Success
```

`--rows` counts data rows, not lines, and the header doesn't count towards it. Parts land beside the input, with a zero-padded number so a wildcard lists them in order.

## Merge Files

The last name on the line is the output; everything before it is an input:

```bash
rugo merge space_missions.part000*.csv space_missions_all.csv
```

```text
merged 3 files (4630 rows) -> space_missions_all.csv
```

The result has one header row and 4,630 data rows. Rows keep the order of the files you gave.

Every file must have the same column names in the same order.

## When a Merge Is Refused: Types

CSV carries no types, so Rugo works them out for each file from its first rows, and a merge needs every file to come out the same. Usually they do. They don't when one file's sample looks different to another's — a `Price` column that is whole numbers in the first rows of one file and has decimals in the other is `int64` in one and `float64` in the other:

```text
ValueError: concat: all inputs must share one type for 'Price' - found INT64 (1 part), FLOAT64 (1 part)
```

Nothing is written. There are two ways out:

- **Declare the types** by reading each CSV in Python with `explicit_schema`, so every file comes out the same. See [Convert CSV to Parquet](/docs/guides/convert-csv-to-parquet#when-the-types-arent-right).
- **Make the files agree** at the source, for example by always writing `450.0`, never `450`.

## When `cat` and `split` Are Enough

If every file has the same columns and you don't care about types, plain tools are fine. They don't infer anything, so they can't disagree:

```bash
# combine: keep the first file's header, drop the others'
awk 'FNR > 1 || NR == 1' day1.csv day2.csv day3.csv > month.csv
```

Reach for `rugo` instead when you want the row count reported, a mismatch in columns caught rather than silently written, or the parts written in another format with `--format parquet`. One thing plain `split -l` can't promise: it cuts on line breaks, and a CSV field in quotes can contain one, so it can cut a record in half. `rugo split` keeps a quoted field with its line break in one piece.

## Large Files

`merge` and `split` build the whole result in memory before writing it, so they suit files that fit in RAM. For a file that doesn't, `split -l` is the practical tool.

## Related

- [Convert CSV to Parquet](/docs/guides/convert-csv-to-parquet)
- [Convert Parquet to CSV](/docs/guides/convert-parquet-to-csv)
- [Combine and split Parquet files](/docs/guides/combine-and-split-parquet-files)
- [The Rugo Command Line](/docs/guides/rugo-cli)
