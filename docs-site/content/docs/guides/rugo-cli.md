---
title: The Rugo Command Line - Inspect and Convert Parquet, CSV and JSONL
description: Inspect, preview, convert, merge and split Parquet, CSV and JSONL files from the shell with the rugo command. JSON output throughout for scripting.
---

# The Rugo Command Line

Installing [Rugo](/docs/guides/rugo-standalone) puts a `rugo` command on your `PATH` — the same reader and writer the engine uses, driven from the shell. It answers the questions you have about a file before you query it: what's in it, how big is it, what do the first rows look like — and converts between Parquet, CSV and JSONL without any Python in between.

```bash
pip install rugo
```

There is no SQL here. For SQL over a folder of Parquet, that's [the Opteryx command line](/docs/guides/opteryx-cli).

## Looking at a File

`info` is the first thing to reach for — format, size, and shape in four lines:

```bash
rugo info space_missions.parquet
```

```
path        : space_missions.parquet
format      : parquet
size_bytes  : 111529
num_rows    : 4630
num_columns : 8
```

`schema` gives the columns with their types and nullability, `columns` gives just the names (one per line, ready to pipe), and `count` prints the row count alone:

```bash
rugo schema space_missions.parquet
```

```
name            type           nullable
--------------  -------------  --------
Company         varchar        True
Location        varchar        True
Price           float64        True
Lauched_at      timestamp[us]  True
Rocket          varchar        True
Rocket_Status   varchar        True
Mission         varchar        True
Mission_Status  varchar        True
```

The format is detected from the file, so all of these work equally on `.csv` and `.jsonl`. CSV and JSONL carry no type information, so every column in those comes back as `string`.

## Previewing Rows

`preview` (or `head`, the same command under a Unix-shaped name) shows the first rows. `-n` sets how many, `-c` projects a subset of columns — and the projection is pushed into the reader, so unrequested columns are never decoded:

```bash
rugo preview -n 3 -c Company,Rocket,Price space_missions.parquet
```

```
Company    Rocket          Price
---------  --------------  -----
RVSN USSR  Sputnik 8K71PS
RVSN USSR  Sputnik 8K71PS
US Navy    Vanguard
```

## Column Statistics

`describe` (aliased as `stats`) reads the per-column statistics out of the Parquet footer — null counts, min and max, and distinct counts where the writer recorded them:

```bash
rugo describe space_missions.parquet
```

```
name            type           null_count  min        max       distinct_count
--------------  -------------  ----------  ---------  --------  --------------
Company         varchar        0           AEB        i-Space
Location        varchar        0           Blue Or…   Xichang…
Price           float64        3380        2.5        450.0
Rocket          varchar        0           ASLV       Zoljanah
Mission_Status  varchar        0           Failure    Success
```

This is metadata, not a scan — it is as fast on a large file as a small one, which makes it a cheap way to find the columns that are mostly null before you plan a query around them. Values fold across row groups: null counts are summed, min and max are the extremes across the whole file.

`inspect` goes a level lower for debugging, dumping the footer row group by row group with each column's physical and logical type and whether it carries a bloom filter or min/max statistics:

```bash
rugo inspect space_missions.parquet
```

```
row group 0  (rows=4630):
name            physical_type  logical_type   null_count  distinct_count  bloom  min/max
--------------  -------------  -------------  ----------  --------------  -----  -------
Company         byte_array     varchar        0                           False  True
Price           float64        float64        3380                        False  True
Lauched_at      int64          timestamp[us]  127                         False  True
```

Row group count and size is what determines how much of a file the engine can skip; if a filter isn't pruning as much as you expected, this is where to look.

`describe`, `stats` and `inspect` are Parquet-only — they read the footer, and CSV and JSONL don't have one. Pointed at anything else they fail with a clear message rather than returning empty results.

## Comparing Schemas

`diff` compares two files' schemas and reports what changed:

```bash
rugo diff yesterday.parquet today.parquet
```

```
+ added:   region
- removed: legacy_id
~ changed:
name    left_type  right_type  left_nullable  right_nullable
------  ---------  ----------  -------------  --------------
amount  int64      float64     True           True
```

It exits `0` when the schemas are identical and `1` when they differ, so it drops straight into a pipeline guard:

```bash
rugo diff expected_schema.parquet incoming.parquet || echo "schema drift — stopping"
```

This is metadata only. It tells you the shape changed, not that the rows did.

## Converting, Merging and Splitting

`convert` moves a file between formats, inferring both ends from the extensions:

```bash
rugo convert space_missions.parquet space_missions.jsonl
```

```
space_missions.parquet (parquet, 4630 rows) -> space_missions.jsonl (jsonl)
```

Going to CSV or JSONL loses the type information Parquet carries — a `float64` column read back out of JSONL is a string. Converting *to* Parquet is the direction that gains you something, and it's how you get CSV or JSONL data into a shape Opteryx can query.

`merge` concatenates files into one. Schemas have to match on column names, order and types; a mismatch fails loudly rather than coercing or filling with nulls:

```bash
rugo merge day1.parquet day2.parquet day3.parquet month.parquet
```

`split` goes the other way, breaking a file into row-bounded chunks:

```bash
rugo split space_missions.parquet --rows 2000
```

```
space_missions.part0000.parquet  (2000 rows)
space_missions.part0001.parquet  (2000 rows)
space_missions.part0002.parquet  (630 rows)
```

Outputs are named from the input's stem with a zero-padded part number, and land beside it. `--format` writes the parts in a different format than the input.

## JSON Output

Every verb takes `--json`, which swaps the text table for machine-readable JSON:

```bash
rugo count --json events.parquet | jq .num_rows
rugo describe --json events.parquet | jq '.columns[] | select(.null_count > 0) | .name'
rugo schema --json events.parquet | jq -r '.columns[] | "\(.name)\t\(.type)"'
```

This is the form to script against — the text tables are laid out for reading and their column widths shift with the data.

## The Verbs

| Verb | What it does |
|---|---|
| `info` | High-level metadata — rows, columns, size, format |
| `schema` | Column names, types and nullability |
| `columns` | Column names, one per line |
| `count` | Row count |
| `preview` / `head` | First N rows (`-n`), optionally projected (`-c`) |
| `describe` / `stats` | Per-column nulls, min/max, distinct *(Parquet only)* |
| `inspect` | Footer, row group and encoding dump *(Parquet only)* |
| `diff` | Compare two schemas; exits `1` when they differ |
| `convert` | Convert between Parquet, CSV and JSONL |
| `merge` | Concatenate schema-identical files into one |
| `split` | Split into row-count-bounded parts (`--rows`, `--format`) |

## Local Files Only

The standalone `rugo` wheel reads and writes the local filesystem and nothing else. Opteryx's own copy of Rugo also handles `gs://` and `http(s)://` because the engine needs remote I/O; the standalone wheel leaves that out to stay thin. A remote path fails immediately rather than returning nothing.

`convert`, `merge` and `split` build the whole result in memory before writing it, so they are sized for files that fit in RAM. For streaming output at scale, use `open_parquet_writer` from the Python API instead — see [Using Rugo Standalone](/docs/guides/rugo-standalone).

## Related

- [Using Rugo Standalone](/docs/guides/rugo-standalone)
- [The Opteryx Command Line](/docs/guides/opteryx-cli)
- [Rugo — the file engine](/docs/reference/internals/rugo)
