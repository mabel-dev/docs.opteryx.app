---
title: Monitoring opteryx.app — A Faster Way to Search Web Traffic Logs
description: We needed to calculate rolling response times for opteryx.app from 1 GB of JSONL logs. Rugo did it in 1 second where pandas took 13 and grep couldn't do the stats at all.
date: 2026-07-10
author: Justin Joyce
role: Opteryx Engineering
image: /blog/2026-07-10-rugo.png
canonical: https://rugo.dev/blog/jsonl-logs-grep-vs-pandas-vs-rugo.html
tags:
      - rugo
      - performance
      - monitoring
      - jsonl
      - logging
---

# Monitoring opteryx.app — A Faster Way to Search Web Traffic Logs

> A version of this write-up for Python developers with log files — same
> benchmark, less Opteryx context — is on the Rugo blog as
> [Analysing 1 GB of JSONL logs in Python: grep vs pandas vs rugo](https://rugo.dev/blog/jsonl-logs-grep-vs-pandas-vs-rugo.html).

## TL;DR

We needed to calculate rolling 1-hour average response times for the `/api/data` endpoint from 1 GB of JSONL traffic logs on a M3 MacBook. Three approaches:

| Method | Time | Memory (Peak) | Matching |
|---|---|---|---|
| grep + Python | 6.98s | ~42 MB | 899,041 rows |
| pandas | 13.37s | ~2,500 MB | 899,041 rows |
| **Rugo** | **1.23s** | **~5 MB** | **899,041 rows** |

All three returned the same result (within 0.01 ms). Rugo is faster because it combines column projection and predicate pushdown — data you don't need is never parsed.

The `grep + Python` split matters: `grep` is blazing fast at filtering (~0.4s), but the subsequent Python JSON parsing adds ~6.5s. The full pipeline (grep + parse) takes longer than Rugo alone.

## The Problem

opteryx.app generates web traffic logs in JSONL format. Each line looks like:

~~~json
{"timestamp": "2026-06-15T14:32:11", "url": "/api/data", "method": "GET", "status": 200, "response_ms": 142.3, "user_agent": "Mozilla/...", "bytes_sent": 12450}
~~~

After 30 days, a single log file is over 1 GB with roughly 6 million entries.

We want to monitor the health of `/api/data` — the primary data query endpoint. Specifically: **rolling 1-hour average response times**. This tells us if latency is trending up, not just what the average is overall.

This is a task where the tool you choose matters.

## Approach 1: grep + Python

grep is the obvious first move for searching logs:

~~~python
import subprocess
import json

result = subprocess.run(
      ["grep", "/api/data", "logs.jsonl"],
    capture_output=True, text=True,
)

entries = []
for line in result.stdout.split("\n"):
    if line:
        entry = json.loads(line)
        if entry["url"] == "/api/data":
            entries.append(entry)
~~~

This split actually matters for the numbers. `grep` does its filtering in about 0.4 seconds, blazingly fast at text matching. But then you have to parse each matched line as JSON in Python — that's where it costs ~6.5 seconds of extra time.

grep gets the initial filtering done fast. But calculating rolling window statistics requires parsing every matched line into Python objects, then doing the aggregation yourself.

**7 seconds total**. And that's before you even write the rolling average calculation. The grep part is great at finding lines, but JSON parsing in pure Python is slow without vectorized libraries.

## Approach 2: pandas

pandas is the standard answer for time-series analysis:

~~~python
import pandas as pd

df = pd.read_json("logs.jsonl", lines=True)
df = df[df["url"] == "/api/data"]
df = df.sort_values("timestamp")

df["ts"] = pd.to_datetime(df["timestamp"])
df = df.set_index("ts")
df["rolling_avg"] = df["response_ms"].rolling("1h").mean()
~~~

It works, and it's expressive. But `read_json` parses every column for every row. The 1 GB file loads entirely into memory before any filtering happens.

**13 seconds.** And the memory footprint for a 1 GB file is several gigabytes of RAM — we measured ~2,500 MB peak. That's why serverless and low-memory environments struggle with pandas on large files.

## Approach 3: Rugo

[Rugo](https://rugo.dev) is designed around a different principle: **read less data in the first place.**

~~~python
from rugo import jsonl

timestamps = []
values = []

with jsonl.read_jsonl(
      "logs.jsonl",
    columns=["url", "response_ms", "timestamp"],
    predicates=[("url", "==", "/api/data")],
) as reader:
    for morsel in reader:
        timestamps.extend(morsel.column("timestamp").to_pylist())
        values.extend(morsel.column("response_ms").to_pylist())
~~~

Two things happen before any data is parsed:

1. **Column projection** — only 3 of the 8 columns are read. The other 5 columns (`method`, `status`, `user_agent`, `bytes_sent`) are never parsed.
2. **Predicate pushdown** — only rows where `url == "/api/data"` are parsed. At ~15% of traffic, that's 85% of the data that never touches a Python object.

Rugo yields results as Morsels — batches of rows streamed from the file. Memory stays bounded because you never hold the whole file. We measured ~5 MB peak RAM for this approach on our test data.

**1 second.** Same result, different approach.

## The Numbers

| Method | Time | Entries | Avg Response (ms) | Peak Memory |
|---|---|---|---|---|
| grep + Python | 6.98s | 899,041 | 1,488.77 | ~42 MB |
| pandas | 13.37s | 899,041 | 1,488.78 | ~2,500 MB |
| Rugo | 1.23s | 899,041 | 1,488.77 | ~5 MB |

All three agree within 0.01 ms for the overall average response time.

The file: 1.05 GB, 6 million log entries, 15% matching `/api/data`.

## Why Rugo is Faster

It's not that Rugo parses JSON faster than pandas. It's that Rugo parses **less** JSON.

When your log file has 8 columns and you only need 3, pandas still reads and parses all 8. Rugo skips the other 5 at the parse level — they're never turned into Python objects.

When only 15% of rows match your filter, pandas loads 100% of them first. Rugo's predicate pushdown means 85% of the data is never parsed.

The more selective your query — fewer columns, fewer matching rows — the bigger Rugo's advantage becomes. That's the design: **the library gets faster the more selective you are.**

## When to Use What

**grep** when you just need to find lines matching a pattern and read them as plain text. It's still fastest for that, but remember: grep itself is fast (0.4s), but adding Python JSON parsing makes it slower than Rugo.

**pandas** when you need to load and transform everything — the full DataFrame with all columns, no filtering, lots of operations on every row.

**Rugo** when you need to extract specific columns from specific rows in large files. It's the bridge between "grep is fast but dumb" and "pandas is powerful but heavy."

## The Point

Rugo was built as the file layer for [Opteryx](https://opteryx.app). The principle — push column projection and predicate filtering ahead of decode — makes sense inside a SQL engine and outside one too.

`pip install rugo` gets you the same reader Opteryx uses, with zero runtime dependencies. 11.6 MB installed, 30 ms cold import (linux x86_64, CPython 3.12 — see the [footprint comparison](https://rugo.dev/#hero) for how that is measured and how it compares to PyArrow, DuckDB, Polars and fastparquet). No PyArrow, no Pandas, no NumPy.

The [full API](https://rugo.dev) covers Parquet, CSV, and JSONL — same shape, same principle.

The [benchmark script](https://gist.github.com/joocer/b0a69f57a94f24e1e912ee19ccb0665c) is available to reproduce these numbers.

— Justin
