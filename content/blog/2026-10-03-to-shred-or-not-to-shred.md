---
title: To Shred or Not to Shred
description: On JSONBench, Opteryx queries raw NDJSON with no load step and ranks fourth of nine at 100 million documents. Here's what the engines above it do before the first query, and how we get close without it.
date: 2026-10-03
author: Justin Joyce
role: Opteryx Engineering
image: /blog/2026-10-03-to-shred-or-not-to-shred.png
tags:
  - performance
  - benchmarks
  - json
  - storage
---

# To Shred or Not to Shred

## TL;DR

* On [JSONBench](https://jsonbench.com) at 100 million documents, Opteryx reading the raw NDJSON files ranks **4th of 9 on hot queries**. It has no load step: no schema, no ingestion, no index.
* Every entry above us takes the JSON apart into columns at load time, sorted on exactly the fields the five benchmark queries use. Most entries below us do load-time work for those fields too.
* There are honest limits. Hot runs read from memory, cold runs are bound by the disk, and small inputs are weak. But the time to the *first* answer is where not shredding wins.

## How JSONBench is won

JSONBench is ClickHouse's benchmark for analytics over JSON: a billion Bluesky events, five queries, one fixed machine. ClickHouse tops it, and its launch material says it aggregates "2.54 billion JSON docs per second".

That's true, but look at how the table is defined ([clickhouse/ddl.sql](https://github.com/ClickHouse/JSONBench/tree/main/clickhouse)):

~~~sql
data JSON(
    max_dynamic_paths = 0,
    kind LowCardinality(String),
    commit.operation LowCardinality(String),
    commit.collection LowCardinality(String),
    did String,
    time_us UInt64) CODEC(ZSTD(1))
ORDER BY (data.kind, data.commit.operation, data.commit.collection, data.did, ...)
~~~

The five fields the five queries filter and group on are declared up front as typed columns. Every other path goes into a single shared blob (`max_dynamic_paths = 0`). The table is then sorted by those same five fields, so each column becomes long runs of identical values that compress to almost nothing.

This is **shredding**: taking each document apart into columns as it's loaded. Query 1 (count events by collection) then reads one sorted, dictionary-encoded column. No JSON is parsed at query time, which is why its peak memory is under a megabyte.

That's not cheating. It's the right design when you know your queries in advance. But the work has moved into the load, and JSONBench doesn't rank the load.

## Everyone else prepares too

ClickHouse isn't unusual. Every JSONBench entry except DuckDB transforms the data at load time, and six of the eight build that work around the exact fields the five queries use:

| Entry | What happens at load | Built around the queries' fields? |
| --- | --- | --- |
| [ClickHouse](https://github.com/ClickHouse/JSONBench/tree/main/clickhouse) | Shredded: the 5 query fields become typed columns; the table is sorted by them | Yes |
| [StarRocks](https://github.com/ClickHouse/JSONBench/tree/main/starrocks) | Shredded (FlatJSON); sorted by a key built from 4 query fields | Yes |
| [Apache Doris](https://github.com/ClickHouse/JSONBench/tree/main/doris) | Shredded (VARIANT subcolumns), plus generated columns for the 5 query fields as the table key | Yes |
| [Elasticsearch](https://github.com/ClickHouse/JSONBench/tree/main/elasticsearch) | Every field indexed; explicit mappings for the 5 query fields; index sorted by them | Yes |
| [SingleStore](https://github.com/ClickHouse/JSONBench/tree/main/singlestore) | Shredded automatically: [split into columns by key path](https://docs.singlestore.com/db/v8.9/create-a-database/columnstore/columnstore-seekability-using-json/) | No: no sort keys or indexes on JSON sub-columns |
| [PostgreSQL](https://github.com/ClickHouse/JSONBench/tree/main/postgresql) | Parsed into binary JSONB, plus an expression index on the 5 query fields | Yes |
| [MongoDB](https://github.com/ClickHouse/JSONBench/tree/main/mongodb) | Parsed into binary BSON, plus a compound index on the 5 query fields | Yes |
| [DuckDB](https://github.com/ClickHouse/JSONBench/tree/main/duckdb) | Stored as a JSON text column, parsed at query time | No |
| **Opteryx** | **Nothing. The raw NDJSON files are queried in place.** | **No** |

There are three strategies here. **Shredding** splits documents into columns. **Binary document encoding with indexes** stores each document pre-parsed (JSONB, BSON) and indexes chosen paths. **Text storage** keeps the JSON as text and parses it at query time. Opteryx skips the load entirely. That's often called *schema-on-read*: the shape of the data is worked out when a query runs, not before.

## How we do it without loading

No load step means every query reads raw JSON text. That only works if the reader does as little as possible per byte, on every core.

This is what happens to `bluesky/*.jsonl` on each query:

~~~sql
SELECT did, MIN(time_us) AS first_post
FROM READ_JSONL('bluesky/*.jsonl')
WHERE kind = 'commit'
  AND commit ->> 'operation' = 'create'
  AND commit ->> 'collection' = 'app.bsky.feed.post'
GROUP BY did
ORDER BY first_post
LIMIT 3
~~~

1. **The planner pushes JSON paths into the scan.** `commit ->> 'collection'` is rewritten into a column the reader extracts itself, one level into the object. The `commit` object is never handed over whole and then parsed again. The filters become plain column-against-value comparisons, which the scan can evaluate inline.
2. **Files are split across a decode pool.** Local files are memory-mapped. Each worker claims a chunk of a file, cut at a newline, and decodes it independently. Finished chunks go onto a queue that the engine's workers drain, so decoding overlaps execution. At most a few chunks are in flight, which bounds memory.
3. **Lines that can't match are skipped before parsing.** The reader samples the first megabyte to find the most selective equality filter, here `"app.bsky.feed.post"`. A Volnitsky substring search then jumps through the chunk, skipping roughly the needle's length on each miss, and only lines containing the needle are parsed. The prefilter switches itself off if more than 30% of lines match. It's safe: lines it lets through are still checked properly, a value that could be stored as a number is searched for unquoted, and any line with a `\u` escape is always parsed. Here it skips about 90% of the parsing.
4. **A SIMD pass finds the structure.** One AVX2 or NEON pass locates every structural byte (`{ } [ ] : , " \` and newline) without reading any values.
5. **A small state machine maps only what's needed.** Using those positions, it records where each wanted field's key and value sit. Only fields the query uses are mapped, matched by comparing bytes, with no hashing. Once a record's wanted fields are found, the rest of it is skipped (it's still checked to close correctly on its line).
6. **Filters run the moment their field is found.** A record that fails `kind = 'commit'` is dropped right there, before its other fields are even located.
7. **Only survivors are materialised.** Just the matching rows and the projected columns are parsed into typed vectors.

The whole data path is C++, with no Python per row or per chunk. On the benchmark machine, Query 1 at 100m reads, parses and aggregates 47.8 GB of raw JSON in 6.48 s, about 7.4 GB/s.

## How we tested

We used the published machine type, ran the other engines with their own JSONBench scripts, and timed Opteryx under the same protocol.

| | Setup |
| --- | --- |
| Machine | AWS m6i.8xlarge (32 vCPU, 128 GB RAM), Ubuntu 24.04 |
| Disk | gp3 at default settings (3,000 IOPS, 125 MB/s), as the leaderboard specifies |
| Data | Bluesky NDJSON: the first 1, 10 and 100 files (1m, 10m and 100m documents; 47.8 GB raw at 100m) |
| Opteryx | 0.9.150 from PyPI, `READ_JSONL` over the raw `.jsonl` files; no load, no schema |
| DuckDB | 1.5.6, unmodified `duckdb/` scripts from the JSONBench repo, at 1m and 10m |
| ClickHouse | 26.10, unmodified `clickhouse/` scripts from the JSONBench repo, at 1m, 10m and 100m |
| Protocol | Clear the OS page cache, then run each query three times: run 1 is **cold**, the best of runs 2–3 is **hot** |

Rankings use the leaderboard's own formula: per query, (time + 10 ms) divided by the fastest system's, then the geometric mean across the five queries. We place Opteryx among the eight systems the site shows by default.

## Results

On hot queries at 100m, Opteryx reading raw NDJSON scores ×42.2 of the best system's time. It's the fastest entry that doesn't shred at load, ahead of Elasticsearch, SingleStore, DuckDB, PostgreSQL and MongoDB.

![JSONBench relative time at 100m documents, hot queries, log scale. ClickHouse ×1, StarRocks ×1.7, Apache Doris ×2, Opteryx (raw NDJSON) ×42.2, Elasticsearch ×46.6, SingleStore ×64, DuckDB ×76.3, PostgreSQL ×359.6, MongoDB ×839.5. Each entry is labelled with what it does at load time.](/blog/2026-10-03-to-shred-or-not-to-shred.png)

*JSONBench published results (default "retains structure" view, 100m) plus our Opteryx 0.9.150 run on m6i.8xlarge, 2026-10-03. Load steps are from each entry's scripts in the JSONBench repo.*

The smaller sizes and the cold runs are less flattering:

| Size | Opteryx hot | DuckDB hot | Opteryx rank, hot | Opteryx cold | DuckDB cold | Opteryx rank, cold |
| --- | --- | --- | --- | --- | --- | --- |
| 100m | 28.7 s | 49.7 s (published) | 4th of 9 | 1,824 s | 1,838 s (published) | 7th of 9 |
| 10m | 4.33 s | 6.23 s | 6th of 9 | 184 s | 182 s | 8th of 9 |
| 1m | 1.98 s | 1.65 s | 8th of 9 | 16.2 s | 19.1 s | 8th of 9 |

Times are totals for all five queries. DuckDB's 1m and 10m numbers are from our run on the same box; at 100m we use its published entry. Results matched DuckDB's row for row on every query we compared.

## What loading costs

JSONBench ranks query time only. The page has a load-time column, but no published entry fills it in, so we measured the load ourselves on the same m6i.8xlarge, using each engine's own scripts.

| At 100m documents | Load | First answer (cold) | All five queries, cold | All five queries, hot |
| --- | --- | --- | --- | --- |
| ClickHouse 26.10 | 800 s | 800 s | 806 s | 801 s |
| Opteryx 0.9.150 | none | 365 s | 1,824 s | 28.7 s |

The ClickHouse times include its load. Its queries alone are fast: 1.04 s hot and 6.15 s cold for all five, close to its published 0.81 s and 5.83 s.

So ClickHouse's 13-minute load pays for itself after about **145 hot queries** (5.5 s saved per query) or **3 cold queries** (364 s saved per query). Until then, Opteryx answers first. On cold storage, its first answer arrives in about 6 minutes, before ClickHouse has finished loading. With the files in cache, it's under 7 seconds.

The pattern is the same at 10m. ClickHouse loads in 88 s and breaks even after about 107 hot queries or 3 cold ones. DuckDB's load took 98 s on one run and 231 s on another, and it never breaks even on hot queries at 10m, because Opteryx's hot queries (0.87 s each on average) are faster than DuckDB's (1.25 s).

## The honest trade-off

Fourth place is real, but only for hot queries at 100m. These limits matter just as much.

**Hot means the files are already in memory.** At 100m, the 47.8 GB of raw NDJSON fits in the machine's 128 GB of RAM, so hot runs read from the OS page cache. At the full billion documents, about 482 GB, it won't fit, and every query becomes a cold one.

**Cold queries are bound by the disk.** Reading 47.8 GB at gp3's default 125 MB/s takes about 365 s per query, however fast the parser is. ClickHouse reads a small compressed column instead. Reading zstd-compressed files cuts our cold time by 3.8× at 10m, but slows hot queries, because each compressed file decompresses as a single stream.

**Small inputs are weak.** At 1m, a single 480 MB file doesn't split into enough chunks to keep 32 cores busy, so we're 8th of 9.

**This isn't a published entry yet.** We ran the published protocol on the published machine type, and the entries we reran came close to their published query times (DuckDB within a few percent, ClickHouse within about 30%). But these numbers are ours until JSONBench accepts them, and we didn't run the 1-billion size.

## So: to shred or not to shred?

Shred when you know your queries and will run them many times. Don't shred when you need an answer from data you've just been handed, or will only look at a few times.

Shredding buys query speed with work done up front, around fields chosen up front. For a dashboard asking the same questions all day, that trade pays, and ClickHouse is the proof. But much of the JSON sitting in object storage is queried once, or now and then, by someone who doesn't know its shape yet. For that data, the fastest pipeline is the one with no load step.

I feel the result here is that you don't have to choose between the two to be competitive. A reader that only does the work a query needs, on every core, puts raw files alongside engines that spent minutes preparing.

Next, we'll submit Opteryx to JSONBench as a stateless entry with no load step. We'll also suggest a stateless filter, like the one ClickBench has, so readers can compare the two approaches directly.
