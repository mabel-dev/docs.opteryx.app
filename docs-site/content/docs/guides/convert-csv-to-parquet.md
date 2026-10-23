---
title: Convert CSV to Parquet - the rugo Command and Python
description: Convert a CSV file to Parquet with one rugo command, or with Python when you need to set the delimiter, declare column types or handle a file with no header. Explains how column types are chosen.
---

# Convert CSV to Parquet

A CSV file is text. Every number is a string of digits, every date is a string, and a reader has to look at the values to guess what each column holds. Parquet records the types, stores each column separately and keeps statistics, so a query can skip data it doesn't need. Converting once, and querying the Parquet copy from then on, is the cheapest speed-up available for CSV data.

[Rugo](/docs/guides/rugo-standalone) does the conversion from the shell, with no Python in between.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- convert a CSV file to Parquet with one command
- see which types were chosen, and why
- fix a column that came out as the wrong type
- convert a CSV with a different delimiter or no header row
- combine many CSV files into one Parquet file, or split one into several

## Convert One File

```bash
pip install rugo
rugo convert space_missions.csv space_missions.parquet
```

```text
space_missions.csv (csv, 4630 rows) -> space_missions.parquet (parquet)
```

Both formats are inferred from the extensions. The example file is `space_missions.csv`, 4,630 orbital launch attempts. To make it, [download the Parquet version](https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/missions/space_missions.parquet) and run `rugo convert space_missions.parquet space_missions.csv`.

The first line of the CSV is taken as the header, and empty fields become nulls.

## Check the Types

```bash
rugo schema space_missions.parquet
```

```text
name            type     nullable
--------------  -------  --------
Company         varchar  True
Location        varchar  True
Price           float64  True
Lauched_at      varchar  True
Rocket          varchar  True
Rocket_Status   varchar  True
Mission         varchar  True
Mission_Status  varchar  True
```

`Price` became `float64` because the reader looked at the values and saw decimal numbers. `Lauched_at` stayed `varchar`: timestamps are never guessed, so a date column arrives as text unless you declare it (below).

Two things about how the guess is made:

- **It uses a sample.** The reader looks at the first 128 rows. If the first rows don't look like the rest — a column that is whole numbers at the top and has decimals further down — the type can be wrong for the file as a whole.
- **`rugo schema` on the CSV itself is no help.** It reports every column of a CSV as `string`. Check the schema of the Parquet file you made instead.

Because Parquet has statistics, you can also look at what's in the columns without scanning anything:

```bash
rugo describe space_missions.parquet
```

`Price`, for instance, shows 3,380 nulls in 4,630 rows — the empty fields from the CSV.

## When the Types Aren't Right

The command has no options for types; for that, use the Python API. `explicit_schema` declares the columns you care about, and everything else is still guessed:

```python
from rugo import parquet
from rugo.csv import read_csv

with read_csv(
    "space_missions.csv",
    explicit_schema={"Price": "DOUBLE", "Lauched_at": "TIMESTAMP"},
) as reader:
    with open("space_missions.parquet", "wb") as f:
        with parquet.open_parquet_writer(f.write) as writer:
            for morsel in reader:
                writer.write_row_group(morsel)
```

`Price` is now `float64` and `Lauched_at` is `timestamp[us]`, with values such as `1957-10-04 19:28:00+00:00`. A declared column is parsed strictly: a value that doesn't fit fails the read with an error naming the column and the value, rather than quietly turning the column into text. Declare the columns your pipeline depends on.

If you'd rather the reader look at more rows before it decides, raise the sample: `read_csv(..., infer_sample_size=1000)`.

## A Different Delimiter, or No Header

`read_csv` takes `delimiter` and `has_header`:

```python
with read_csv("export.csv", delimiter=";") as reader:
    ...  # same writer loop as above

with read_csv("raw.csv", has_header=False) as reader:
    ...  # columns are named col_0, col_1, ...
```

The `rugo` command assumes commas and a header row.

## Convert a Folder of CSV Files

A shell loop converts each file beside the original:

```bash
for f in exports/*.csv; do rugo convert "$f" "${f%.csv}.parquet"; done
```

Each file is typed on its own, so two files can disagree — one whose first rows are whole numbers and another with decimals will come out as `int64` and `float64`. `rugo merge` refuses files whose types differ (see [the schema rule](/docs/guides/combine-and-split-parquet-files#the-schema-rule)), so check the schemas before combining the results. Declaring the types, as above, makes every file come out the same.

## Combine Many CSV Files into One Parquet File

`merge` takes any number of inputs and writes whatever format the output name asks for, so combining a folder of CSVs into a single Parquet file is one command. The last name is the output:

```bash
rugo merge space_missions.part000*.csv space_missions.parquet
```

```text
merged 3 files (4630 rows) -> space_missions.parquet
```

Rows come out in the order the files were given. Every CSV must have the same column names in the same order. Types are worked out per file, so if two files disagree about a column — whole numbers at the top of one, decimals in the other — the merge fails:

```text
ValueError: concat: all inputs must share one type for 'Price' - found INT64 (1 part), FLOAT64 (1 part)
```

To make the files agree, declare the types and write every file through one Parquet writer. Each input becomes its own row group:

```python
import glob
from rugo import parquet
from rugo.csv import read_csv

SCHEMA = {"Price": "DOUBLE", "Lauched_at": "TIMESTAMP"}

with open("space_missions.parquet", "wb") as f, parquet.open_parquet_writer(f.write) as writer:
    for path in sorted(glob.glob("exports/*.csv")):
        with read_csv(path, explicit_schema=SCHEMA) as reader:
            for morsel in reader:
                writer.write_row_group(morsel)
```

## Split One CSV into Several Parquet Files

`split` goes the other way, in parts of a fixed number of rows. `--format` chooses what to write:

```bash
rugo split space_missions.csv --rows 2000 --format parquet
```

```text
space_missions.part0000.parquet  (2000 rows)
space_missions.part0001.parquet  (2000 rows)
space_missions.part0002.parquet  (630 rows)
```

Parts land beside the input and are numbered so a wildcard lists them in order. See [Combine and split Parquet files](/docs/guides/combine-and-split-parquet-files) for more on both verbs.

## Large Files

`rugo convert` builds the whole result in memory before writing it. For a file that doesn't fit, use the Python route above, which writes one Parquet row group per batch as it reads.

## Query the Result

The Parquet file is ready for [Opteryx](/docs/guides/querying-local-data), or for anything else that reads Parquet:

```sql
SELECT Company, COUNT(*) AS launches
  FROM READ_PARQUET('space_missions.parquet')
 GROUP BY Company
 ORDER BY launches DESC
 LIMIT 5
```

Opteryx can also query a CSV directly with `READ_CSV('...')`, which is fine for a single look. Convert when you'll come back to the data.

## Related

- [How to Read a Parquet File with Python](/docs/guides/read-a-parquet-file-with-python)
- [Convert JSON Lines to Parquet](/docs/guides/convert-jsonl-to-parquet)
- [Combine and split Parquet files](/docs/guides/combine-and-split-parquet-files)
- [The Rugo Command Line](/docs/guides/rugo-cli)
