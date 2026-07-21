---
title: Using Rugo Standalone - Dependency-Free Parquet, CSV, JSONL I/O
description: Rugo is Opteryx's native file engine, available on its own. A fast, dependency-free reader and writer for Parquet, CSV, and JSONL without PyArrow or SQL.
---

# Using Rugo Standalone

[Rugo](https://rugo.dev) is the file engine inside Opteryx — the part that turns Parquet, CSV, and JSONL files into columns the engine computes over. It is also published on its own, as a plain reader/writer library with no SQL layer on top.

```bash
pip install rugo
```

This gets you Rugo and [Draken](/docs/reference/internals/rugo) (the columnar library it emits into) — and nothing else.

## Rugo vs. Opteryx

These are two different things worth keeping straight:

- **Rugo** reads and writes Parquet, CSV, and JSONL directly — you call its functions, get Draken morsels back, and work with them in Python. There is no SQL here.
- **Opteryx** is the SQL engine built on top of Rugo. Querying a dataset with SQL — `SELECT ... FROM data.table` — currently only works against **Parquet** data.

If you have CSV or JSONL you want to query with SQL, use Rugo to convert it to Parquet first (below), then query the Parquet with Opteryx.

## Reading Parquet Directly

```python
from rugo import parquet

with parquet.read_parquet(
    "space_missions.parquet",
    columns=["Company", "Location", "Price"],
    predicates=[("Company", "=", "SpaceX")],
) as reader:
    for morsel in reader:
        for row in morsel:
            print(row.Company, row.Location, row.Price)
```

`columns` and `predicates` are applied by the reader itself — only the columns and row groups that can match are decoded.

A single column comes back as a Draken vector, which converts to a plain Python list or an Arrow array:

```python
with parquet.read_parquet("space_missions.parquet") as reader:
    morsel = next(iter(reader))
    prices = morsel.column("Price")
    print(prices.to_pylist()[:10])
    print(prices.to_arrow()[:10])
```

## Writing Parquet

Rugo also writes Parquet — pass it a Draken morsel and get bytes back:

```python
from rugo import parquet

data = parquet.write_parquet(morsel, compression="zstd")
with open("out.parquet", "wb") as f:
    f.write(data)
```

For large datasets, `write_parquet` holds the whole file in memory before returning it. `open_parquet_writer` writes one row group per `write_row_group()` call instead, pushing each chunk of bytes to a sink as it's produced — memory stays roughly constant (~one row group) no matter how many batches you write:

```python
with open("out.parquet", "wb") as f:
    with parquet.open_parquet_writer(f.write) as writer:
        for batch in batches:
            writer.write_row_group(batch)
```

`sink` is any callable that takes bytes — a file's `.write`, or an adapter around a cloud upload API. Every batch passed to the same writer must share the same column schema.

## Writing CSV and JSONL

Rugo writes JSONL and CSV directly from a Draken morsel, without going through Python's own `json` or `csv` modules:

```python
from rugo import parquet
from rugo.jsonl import write_jsonl

with open("space_missions.jsonl", "wb") as out:
    with parquet.read_parquet("space_missions.parquet") as reader:
        for morsel in reader:
            out.write(write_jsonl(morsel))
```

`write_csv(morsel)` works the same way for CSV output.

## From the Command Line

Installing Rugo also puts a `rugo` command on your `PATH` — the same reader and writer, driven from the shell. It is the fastest way to look at a file, convert between formats, or drop Parquet/CSV/JSONL into a pipeline without writing any Python.

```bash
rugo info space_missions.parquet          # rows, columns, size, format
rugo schema space_missions.parquet        # column names, types, nullability
rugo preview -n 5 space_missions.parquet  # first rows as a table
rugo convert space_missions.parquet space_missions.jsonl   # format inferred from extensions
```

The most useful verbs:

| Verb | What it does |
|---|---|
| `info` | High-level metadata — rows, columns, size, format |
| `schema` / `columns` | Column names and types |
| `count` | Row count |
| `preview` / `head` | First N rows (`-n`, and `-c` to project columns) |
| `describe` / `stats` | Per-column null counts, min/max, distinct *(Parquet only)* |
| `inspect` | Low-level footer / row-group / encoding dump *(Parquet only)* |
| `diff` | Compare two files' schemas — columns added, removed, retyped |
| `convert` | Convert between Parquet, CSV, and JSONL |
| `merge` | Concatenate schema-identical files into one |
| `split` | Split a file into row-count-bounded chunks (`--rows`) |

Every verb takes `--json` for machine-readable output, so the CLI composes with tools like `jq`:

```bash
rugo count --json events.parquet | jq .num_rows
rugo describe --json events.parquet | jq '.columns[] | select(.null_count > 0)'
```

`describe`, `stats`, and `inspect` read statistics from the Parquet footer that CSV and JSONL don't carry, so they apply to Parquet only; `merge` requires identical schemas across its inputs and fails loud on a mismatch rather than coercing.

## Converting to Arrow

If your existing toolchain expects Arrow tables, a morsel converts directly:

```python
with parquet.read_parquet("space_missions.parquet") as reader:
    for morsel in reader:
        table = morsel.to_arrow()
```

## Why It Exists

If you want fast Parquet I/O but do not need SQL, PyArrow is the usual default — and it is large. Rugo is the opposite trade: a thin, native, dependency-free engine for the three formats Opteryx uses, built from the same source Opteryx ships.

| | Rugo | PyArrow |
|---|---|---|
| Installed size | ~17 MB | ~124 MB |
| Cold import | ~5 ms | ~29 ms |
| Dependencies | none (codecs vendored) | several |

Every Parquet file Rugo writes is readable by PyArrow, Spark, DuckDB, or anything else that reads Parquet — interoperability is the entire reason the format exists.

## The One Difference From Opteryx

The standalone `rugo` wheel is **local-filesystem only**. Opteryx's copy of Rugo can also read `gs://` and `http(s)://` paths because Opteryx needs remote I/O; the standalone wheel deliberately leaves that out to stay thin. A remote path fails immediately and loudly rather than returning nothing.

## Related

- [Rugo — the file engine](/docs/reference/internals/rugo)
- [Querying Local Data](/docs/guides/querying-local-data)
- [What is Opteryx](/docs/introduction/what-is-opteryx)
