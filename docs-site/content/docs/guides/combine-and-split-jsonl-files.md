---
title: Combine and Split JSON Lines Files - the rugo Command
description: Merge many JSON Lines (JSONL / NDJSON) files into one, or split a big one into parts, with the rugo command. Also covers when cat and split are all you need.
---

# Combine and Split JSON Lines Files

JSON Lines — also called JSONL or NDJSON — is one JSON object per line, which makes it the easiest of the formats to combine and split: a line is a whole record, so joining two files is just putting one after the other. Often the plain Unix tools are the right answer. [Rugo](/docs/guides/rugo-standalone) is for when you want more than that.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- combine and split JSONL with `cat` and `split`
- do the same with `rugo merge` and `rugo split`
- know what Rugo adds, and what it costs
- combine files and write Parquet in one step

## Plain Tools First

```bash
# combine
cat day1.jsonl day2.jsonl day3.jsonl > month.jsonl

# split into files of 1,000,000 lines
split -l 1000000 month.jsonl month.part.
```

These stream, so they work on files of any size, and they don't parse anything — each line is copied as it is, whatever it contains. If that is all you need, use them.

## Split with Rugo

```bash
pip install rugo
rugo split space_missions.jsonl --rows 2000
```

```text
space_missions.part0000.jsonl  (2000 rows)
space_missions.part0001.jsonl  (2000 rows)
space_missions.part0002.jsonl  (630 rows)
```

The example file is `space_missions.jsonl`, 4,630 orbital launch attempts. To make it, [download the Parquet version](https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/missions/space_missions.parquet) and run `rugo convert space_missions.parquet space_missions.jsonl`.

Parts land beside the input, with a zero-padded number so a wildcard lists them in order. Unlike `split -l`, Rugo parses the file as it goes, so a malformed line fails the split, with its line number and byte offset, instead of being copied into a part:

```text
ValueError: Malformed JSONL at line 3 (byte offset 468): '{"a":2'
```

## Merge with Rugo

The last name on the line is the output; everything before it is an input:

```bash
rugo merge space_missions.part000*.jsonl space_missions_all.jsonl
```

```text
merged 3 files (4630 rows) -> space_missions_all.jsonl
```

This reports the number of rows written. A malformed line fails the merge too, with its line number and byte offset.

## What Rugo Adds, and What It Costs

- **Validation.** Bad lines are found now, not by whatever reads the file next.
- **Row counts.** Both verbs tell you how many rows they moved, which is a cheap check that nothing was lost.
- **Output format.** `rugo split --format parquet` writes the parts as Parquet, and `rugo merge` writes to whatever format the output name asks for. Combining JSONL files into one Parquet file is one command: `rugo merge day*.jsonl month.parquet`. Mind the types it picks (below): with this example's files, `Price` comes out as text.
- **The cost is types.** `cat` doesn't care what is in a line. Rugo works out a type for each column, from the first 5 records of each file, because it has to turn the lines into columns to do any of this. Two files can disagree — a number column that is `null` at the top of one file is read as text there, and as a number in the other — and a merge of files that disagree is refused with an error naming the column. Declare the types in Python with `explicit_schema` to make every file come out the same; see [Convert JSON Lines to Parquet](/docs/guides/convert-jsonl-to-parquet#fix-it-with-python).

So: for JSONL to JSONL with no checking, use `cat`. For JSONL to Parquet, or when you want validation and counts, use `rugo`.

## Large Files

`merge` and `split` build the whole result in memory before writing it, so they suit files that fit in RAM. For files that don't, use `split -l` and `cat`.

## Related

- [Convert JSON Lines to Parquet](/docs/guides/convert-jsonl-to-parquet)
- [Convert Parquet to JSON Lines](/docs/guides/convert-parquet-to-jsonl)
- [Combine and split Parquet files](/docs/guides/combine-and-split-parquet-files)
- [The Rugo Command Line](/docs/guides/rugo-cli)
