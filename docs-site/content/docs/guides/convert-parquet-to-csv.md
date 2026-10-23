---
title: Convert Parquet to CSV - the rugo Command and Python
description: Convert a Parquet file to CSV with one rugo command, or with Python to choose the columns. Explains what CSV loses on the way out, and what the file looks like when it is read back.
---

# Convert Parquet to CSV

Parquet is the better format to keep data in, and CSV is the format everything else accepts. Spreadsheets, import screens and hand-offs to other teams still ask for it. [Rugo](/docs/guides/rugo-standalone) writes the CSV from the shell, with no Python in between.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- convert a Parquet file to CSV with one command
- know what the CSV looks like — nulls, quoting, timestamps
- write only some of the columns
- know what is lost, and what happens when the CSV is read back

## Convert One File

```bash
pip install rugo
rugo convert space_missions.parquet space_missions.csv
```

```text
space_missions.parquet (parquet, 4630 rows) -> space_missions.csv (csv)
```

The example file is `space_missions.parquet`, 4,630 orbital launch attempts. [Download it](https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/missions/space_missions.parquet) from the Opteryx repository.

## What the CSV Looks Like

```bash
head -3 space_missions.csv
```

```text
Company,Location,Price,Lauched_at,Rocket,Rocket_Status,Mission,Mission_Status
RVSN USSR,"Site 1/5, Baikonur Cosmodrome, Kazakhstan",,1957-10-04T19:28:00+00:00,Sputnik 8K71PS,Retired,Sputnik-1,Success
RVSN USSR,"Site 1/5, Baikonur Cosmodrome, Kazakhstan",,1957-11-03T02:30:00+00:00,Sputnik 8K71PS,Retired,Sputnik-2,Success
```

- **The first line is the header.**
- **Nulls are empty fields.** `Price` is null for these first launches, so it is nothing between two commas.
- **Values that contain a comma are quoted**, like the `Location` above.
- **Timestamps are ISO-8601 text**, with the UTC offset: `1957-10-04T19:28:00+00:00`.

The file is also bigger: 576 KB against 93 KB for the Parquet.

## What Is Lost

CSV holds text and nothing else. The column types, the nullability and the statistics in the Parquet footer don't come with it. Read the CSV back and the types are guessed again:

```bash
rugo convert space_missions.csv again.parquet
rugo schema again.parquet
```

`Price` comes back as `float64` because the reader sees decimals in its sample, but `Lauched_at` is `varchar`, not a timestamp. If a type matters downstream, hand over the Parquet file, or tell the receiving system the types. To get them back on your side, see [Convert CSV to Parquet](/docs/guides/convert-csv-to-parquet#when-the-types-arent-right).

## Write Only Some of the Columns

The command writes every column. To choose, use Python, which reads just the columns you ask for — the rest are never decoded:

```python
from rugo import parquet
from rugo.csv import write_csv

with parquet.read_parquet(
    "space_missions.parquet", columns=["Company", "Mission", "Price"]
) as reader:
    with open("missions_subset.csv", "wb") as f:
        for morsel in reader:
            f.write(write_csv(morsel))
```

```text
Company,Mission,Price
RVSN USSR,Sputnik-1,
RVSN USSR,Sputnik-2,
```

Reading Parquet by column is also where the filtering options live — see [How to Read a Parquet File with Python](/docs/guides/read-a-parquet-file-with-python) for `predicates`, which let you write only the matching rows.

## Large Files

`rugo convert` builds the whole result in memory before writing it. The Python route above writes one batch at a time, so the CSV can be larger than memory.

## Related

- [Convert Parquet to JSON Lines](/docs/guides/convert-parquet-to-jsonl)
- [Convert CSV to Parquet](/docs/guides/convert-csv-to-parquet)
- [Combine and split CSV files](/docs/guides/combine-and-split-csv-files)
- [The Rugo Command Line](/docs/guides/rugo-cli)
