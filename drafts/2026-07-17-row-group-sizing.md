---
title: We Converted Logs to Parquet and Point Lookups Got Slower — Here's Why
description: Converting JSONL logs to Parquet should make point lookups faster. Ours got 6x slower, until we found the one write-time setting that mattered — row group size.
date: 2026-07-17
author: Justin Joyce
role: Opteryx Engineering
tags:
      - rugo
      - performance
      - parquet
      - jsonl
      - logging
---

# We Converted Logs to Parquet and Point Lookups Got Slower — Here's Why

## TL;DR

Following up on [our JSONL log analytics post](/blog/2026-07-10-log-analytics-with-rugo), the obvious next question was: if scanning JSONL is already fast with Rugo, does converting to Parquet make repeat point lookups faster still? We ran it — 500,000 log rows, converted once, then looked up 20 random `request_id`s by exact match.

The first result was a regression, not a win:

| Format | Row groups | Avg lookup |
|---|---|---|
| JSONL (original) | — | 5.5 ms |
| Parquet, default row group size | 2 | 32.8 ms |
| Parquet, 10,000 rows/group | 50 | 1.7 ms |
| Parquet, 2,000 rows/group | 250 | 1.3 ms |

Same file, same data, same query — a **25x** difference in lookup time depending entirely on one write-time parameter. The default is tuned for scan-heavy analytical workloads, not point lookups, and it shows.

## The Setup

500,000 synthetic request log rows, generated locally and written as JSONL:

```json
{"request_id": "req-000123456", "service": "svc-017", "status": 200, "latency_ms": 84.31, "bytes_out": 12983}
```

55.2 MB on disk. The query throughout is the same shape as any log-search tool would run — find the one row matching a specific `request_id`:

```python
from rugo import parquet

with parquet.read_parquet(
    "logs.parquet",
    columns=["request_id", "service", "status", "latency_ms"],
    predicates=[("request_id", "==", "req-000123456")],
) as reader:
    for morsel in reader:
        ...
```

## Converting Once

[Rugo](https://rugo.dev)'s Parquet writer takes a Draken morsel and gives back bytes:

```python
import rugo.jsonl as rj
from rugo.parquet import write_parquet

with rj.read_jsonl("logs.jsonl") as reader:
    morsel = next(iter(reader))

with open("logs.parquet", "wb") as out:
    out.write(write_parquet(morsel, bloom_filters=True))
```

Default settings, one call. The result is a 4.8 MB file — about a tenth the size of the source JSONL, from dictionary encoding and zStandard compression. Every column carries a bloom filter, ready for equality pruning. On paper this should be strictly better for a point lookup: smaller file, purpose-built statistics, [the exact pruning path we described the internals of](/blog/2026-07-03-rugo-parquet) doing the work.

It was 6x slower.

## Why: Two Row Groups Isn't Enough Row Groups

`write_parquet` defaults to `max_rows_per_row_group=262144` — about a quarter million rows. For 500,000 rows, that's **two row groups**. Rugo's row-group pruning — checking a group's min/max statistics and bloom filter before deciding whether to decode it — can only ever skip one of those two groups. Best case, a lookup still decodes 250,000 rows' worth of a column to find one match. That's not pruning, that's a coin flip.

JSONL, by contrast, has no row groups to prune between — but it also has no per-row-group overhead to pay, and Rugo's SIMD structural scan is fast enough on a straight linear pass that at 500K rows it beat a two-row-group Parquet file outright.

## The Fix Is a Write-Time Decision

`write_parquet` takes `max_rows_per_row_group` directly:

```python
out.write(write_parquet(morsel, bloom_filters=True, max_rows_per_row_group=10_000))
```

That one change — 262,144 down to 10,000 — turns 2 row groups into 50, and average lookup time drops from 32.8 ms to 1.7 ms. Tightening further to 2,000 rows per group (250 groups) gets to 1.3 ms — now faster than the original JSONL scan, because pruning is doing real work: reject 249 groups by statistics, decode the one that matters.

The file grows slightly as groups get smaller — 4.8 MB at the default, 5.8 MB at 2,000 rows per group — because more, smaller dictionaries and more bloom filters cost a little space. For a point-lookup workload, that's the right trade every time.

## The Actual Lesson

More row groups is not free — a scan that reads every row still has to open and check every group's metadata, so shrinking row groups without bound would eventually cost a full-scan query something. But for a workload built around _finding_ rows rather than _summing_ them, row group size is the single highest-leverage setting available, and it isn't automatic. Rugo's default is a reasonable general-purpose choice; it is not tuned for your workload, because it can't be.

If your Parquet files are converted once and queried by key many times — exactly the log-search case — check `max_rows_per_row_group` before you conclude Parquet isn't paying off. It's very likely the only thing standing between you and the pruning you expected.

## Reproducing This

Same shape as the [previous post](/blog/2026-07-10-log-analytics-with-rugo): generate the JSONL, convert with a few different `max_rows_per_row_group` values, and time 20 random-key lookups against each with the file's page cache already warm, so the numbers reflect Rugo's own work rather than disk I/O.

— Justin
