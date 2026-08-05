---
title: The Opteryx Command Line - Run SQL Without Writing Python
description: Query Parquet datasets from your shell with the Opteryx CLI. One-shot SQL, an interactive REPL, JSONL and Markdown output, and a built-in benchmarking mode.
---

# The Opteryx Command Line

Opteryx Core ships a command-line interface alongside the library. It is the same engine, driven from the shell — useful for checking a dataset without opening a notebook, for wiring a query into a shell script, and for timing a query while you tune it.

```bash
pip install opteryx-core
```

The CLI runs as a module:

```bash
python -m opteryx "SELECT name, gravity FROM \$planets ORDER BY mass DESC"
```

```
┌───┬─────────┬───────────────┐
│   │   name  │    gravity    │
│   │ VARCHAR │ DECIMAL(3, 1) │
╞═══╪═════════╪═══════════════╡
│ 1 │ Jupiter │          23.1 │
│ 2 │ Saturn  │           9.0 │
│ 3 │ Neptune │          11.0 │
│ 4 │ Uranus  │           8.7 │
└───┴─────────┴───────────────┘
[ 4 rows x 2 columns ] ( 0.94 seconds )
```

Virtual dataset names start with `$`, which most shells will try to expand. Wrap the statement in single quotes — `'SELECT ... FROM $planets'` — or escape the `$` as above.

## Querying Your Own Data

The CLI has no way to call `register_workspace()`, so it falls back to reading the local filesystem relative to your current directory. A dot-separated dataset name maps to a folder of Parquet files:

```bash
cd ~/warehouse
python -m opteryx 'SELECT Company, COUNT(*) FROM data.missions GROUP BY Company'
```

`data.missions` reads `./data/missions/` — the folder, not a single file. This is the same resolution the library uses when no workspace is registered; see [Querying Local Data](/docs/guides/querying-local-data) for the details, and [Connectors](/docs/guides/connectors) for reaching anything that isn't local disk, which needs Python.

## The Interactive Session

Run it with no SQL argument and you get a REPL:

```bash
python -m opteryx
```

```
Opteryx version 0.9.55
  Enter '.help' for usage hints
  Enter '.exit' to exit this program

opteryx>
```

Each statement runs as you enter it, with a row count and elapsed time printed underneath. Two dot commands are recognised — `.help` for the usage hints and `.exit` (or `.quit`) to leave. Errors are reported and the session continues, so a typo doesn't cost you the session.

## Writing Results to a File

By default results are rendered as a table on the console. `--o` writes them to a file instead, choosing the format from the extension:

```bash
python -m opteryx --o results.jsonl "SELECT * FROM data.missions WHERE Company = 'SpaceX'"
python -m opteryx --o summary.md "SELECT Company, COUNT(*) FROM data.missions GROUP BY Company"
```

Only `.jsonl` and `.md` are supported — anything else is rejected rather than guessed at. JSONL is the one to pipe onward; Markdown is for pasting a result into a document or an issue. `--o` is not accepted in REPL mode, since there is no single result to write.

## Controlling the Display

Console output is coloured and width-limited by default, which is what you want at a terminal and not what you want in a log file or a pipe:

```bash
python -m opteryx --no-color --no-stats 'SELECT * FROM $planets'
```

`--no-color` drops the ANSI codes, and `--no-stats` suppresses the trailing `[ n rows x n columns ]` line. `--max_col_width` sets where long values are truncated, defaulting to 64 characters — raise it when a column you care about is being cut off.

## Timing a Query

`--cycles` runs the same statement repeatedly and reports each run's wall time instead of its results:

```bash
python -m opteryx --cycles 5 'SELECT Company, COUNT(*) FROM data.missions GROUP BY Company'
```

```
[1.284,0.671,0.658,0.662,0.655]
```

Each cycle opens its own session and drains the result to morsels without rendering anything, so the numbers reflect the engine rather than the table formatter. The first is normally the slowest — caches are cold and the file footers have not been read yet. This is the quickest way to see whether a rewrite or a config change actually moved the needle; for *why* a query is slow, `EXPLAIN` and [Troubleshooting Queries](/docs/guides/troubleshooting) will tell you more than a timing will.

## Options

| Option | What it does |
|---|---|
| `sql` | The statement to run. Omit it for the REPL |
| `--o` | Write results to a file — `.jsonl` or `.md` (console output when unset) |
| `--color` / `--no-color` | Colourised table output (on by default) |
| `--no-stats` | Suppress the row/column/timing line |
| `--max_col_width` | Truncate column values beyond this width (default 64) |
| `--cycles` | Run the statement N times and report timings instead of results |

Comments are stripped from the statement before it is planned, so a query pasted out of a `.sql` file runs as-is.

## Related

- [Querying Local Data](/docs/guides/querying-local-data)
- [Rugo from the Command Line](/docs/guides/rugo-cli)
- [Troubleshooting Queries](/docs/guides/troubleshooting)
