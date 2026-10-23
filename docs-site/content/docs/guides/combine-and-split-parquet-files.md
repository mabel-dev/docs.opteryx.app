---
title: Combine and Split Parquet Files - the rugo Command
description: Merge many Parquet files into one, or split one into row-bounded parts, with the rugo command. Covers the schema rule for merging, how parts are named, and when not to merge.
---

# Combine and Split Parquet Files

Parquet data tends to arrive in the wrong number of files. A job writes one file per hour and you want a day. An export is one 40 GB file and the tool you're sending it to wants pieces. [Rugo](/docs/guides/rugo-standalone) has a verb for each direction: `merge` and `split`.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- merge several Parquet files into one
- split one Parquet file into parts of a fixed number of rows
- know why a merge was refused
- decide whether merging is a good idea

## Split One File into Parts

```bash
pip install rugo
rugo split space_missions.parquet --rows 2000
```

```text
space_missions.part0000.parquet  (2000 rows)
space_missions.part0001.parquet  (2000 rows)
space_missions.part0002.parquet  (630 rows)
```

The example file is `space_missions.parquet`, 4,630 orbital launch attempts. [Download it](https://raw.githubusercontent.com/mabel-dev/opteryx-core/main/testdata/missions/space_missions.parquet) from the Opteryx repository.

Parts are named from the input's name with a zero-padded part number, and land beside it. The padding means a shell wildcard lists them in order. Every part except the last holds exactly `--rows` rows.

`split` cuts by row count and nothing else. It doesn't group rows by a column's value, so it isn't a way to partition data by date or customer. For that, use SQL.

`--format` writes the parts in a different format from the input, for example `--format csv`.

## Merge Files into One

The last name on the line is the output; everything before it is an input:

```bash
rugo merge space_missions.part000*.parquet space_missions_all.parquet
```

```text
merged 3 files (4630 rows) -> space_missions_all.parquet
```

Check the count against what you expect:

```bash
rugo count space_missions_all.parquet
```

```text
4630
```

Rows come out in the order the files were given, so the shell's sorted wildcard keeps them in sequence.

## The Schema Rule

Every file in a merge must have the same column names, in the same order, with the same types. If not, nothing is written:

```text
rugo: error: schema mismatch: 'space_missions.parquet' has [('Company', 'varchar'), ... ('Lauched_at', 'timestamp[us]'), ...], 'other.parquet' has [('Company', 'varchar'), ... ('Lauched_at', 'varchar'), ...] — merge requires identical column names, order, and types
```

It refuses rather than coercing or filling gaps with nulls. To see which columns differ before you merge, compare two files with [`rugo diff`](/docs/guides/rugo-cli#comparing-schemas), which exits `1` when they don't match, so it works as a guard in a script:

```bash
rugo diff expected.parquet incoming.parquet || echo "schema drift - not merging"
```

## Should You Merge?

Fewer, larger files mean less per-file overhead when reading a folder. But merging has a cost in how much a query can skip. The engine skips data a row group at a time, using each row group's statistics, so a file holding many row groups sorted on the column you filter by can be pruned very precisely.

In the example, the three parts each held their own rows, and the merged file is one row group of 4,630 rows. You can see the layout with `rugo inspect`, and it's worth looking before merging files that are large or carefully ordered:

```bash
rugo inspect space_missions_all.parquet
```

Merge small files into bigger ones to cut overhead; think twice before merging large, well-ordered ones into one slab.

## Large Files

`merge` and `split` build the whole result in memory before writing it, so they suit files that fit in RAM. For larger files, stream with `open_parquet_writer` from the Python API — see [Using Rugo Standalone](/docs/guides/rugo-standalone).

## Local Files Only

The standalone `rugo` command reads and writes the local filesystem. Copy files down first for remote data.

## Related

- [The Rugo Command Line](/docs/guides/rugo-cli)
- [How to Read a Parquet File with Python](/docs/guides/read-a-parquet-file-with-python)
- [Combine and split CSV files](/docs/guides/combine-and-split-csv-files)
- [Combine and split Avro files](/docs/guides/combine-and-split-avro-files)
