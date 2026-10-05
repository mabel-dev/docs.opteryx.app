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

<figure class="doc-figure">
<svg viewBox="0 0 680 390" width="100%" role="img" aria-labelledby="shred-ranking-title shred-ranking-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="shred-ranking-title">At 100m documents, Opteryx is 4th of 9 on hot queries</title>
<desc id="shred-ranking-desc">Horizontal bar chart on a log scale of JSONBench relative time at 100 million documents, hot queries, where ×1 is the best system. ClickHouse ×1 (shredded, sorted on query fields), 0.81 s for all five queries; StarRocks ×1.7 (shredded, sorted on query fields), 1.59 s for all five queries; Apache Doris ×2 (shredded, keyed on query fields), 1.45 s for all five queries; Opteryx (raw NDJSON) ×42.2 (no load: raw files in place), 28.71 s for all five queries; Elasticsearch ×46.6 (all fields indexed, sorted), 43.87 s for all five queries; SingleStore ×64 (shredded by key path), 51.32 s for all five queries; DuckDB ×76.3 (JSON text column), 49.71 s for all five queries; PostgreSQL ×359.6 (JSONB + index on query fields), 1,536.68 s for all five queries; MongoDB ×839.5 (BSON + index on query fields), 1,833.2 s for all five queries.</desc>
<line x1="200.0" y1="18.0" x2="200.0" y2="384.0" style="stroke: var(--border); stroke-width: 1; stroke-dasharray: 2 3;"/>
<text x="200.0" y="14.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">×1</text>
<line x1="313.3" y1="18.0" x2="313.3" y2="384.0" style="stroke: var(--border); stroke-width: 1; stroke-dasharray: 2 3;"/>
<text x="313.3" y="14.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">×10</text>
<line x1="426.7" y1="18.0" x2="426.7" y2="384.0" style="stroke: var(--border); stroke-width: 1; stroke-dasharray: 2 3;"/>
<text x="426.7" y="14.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">×100</text>
<line x1="540.0" y1="18.0" x2="540.0" y2="384.0" style="stroke: var(--border); stroke-width: 1; stroke-dasharray: 2 3;"/>
<text x="540.0" y="14.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">×1,000</text>
<text x="188.0" y="41.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">ClickHouse</text>
<text x="188.0" y="56.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">shredded, sorted on query fields</text>
<rect x="200.0" y="34.0" width="3.0" height="20.0" rx="3" style="fill: var(--muted-2); stroke: none; stroke-width: 1; fill-opacity: 0.45;"/>
<text x="211.0" y="49.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-body);">×1 · 0.81 s</text>
<text x="188.0" y="81.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">StarRocks</text>
<text x="188.0" y="96.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">shredded, sorted on query fields</text>
<rect x="200.0" y="74.0" width="26.1" height="20.0" rx="3" style="fill: var(--muted-2); stroke: none; stroke-width: 1; fill-opacity: 0.45;"/>
<text x="234.1" y="89.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-body);">×1.7 · 1.59 s</text>
<text x="188.0" y="121.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">Apache Doris</text>
<text x="188.0" y="136.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">shredded, keyed on query fields</text>
<rect x="200.0" y="114.0" width="34.1" height="20.0" rx="3" style="fill: var(--muted-2); stroke: none; stroke-width: 1; fill-opacity: 0.45;"/>
<text x="242.1" y="129.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-body);">×2 · 1.45 s</text>
<text x="188.0" y="161.0" text-anchor="end" style="fill: var(--opteryx-teal); font-size: 12.5px; font-weight: 700; font-family: var(--font-body);">Opteryx (raw NDJSON)</text>
<text x="188.0" y="176.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">no load: raw files in place</text>
<rect x="200.0" y="154.0" width="184.2" height="20.0" rx="3" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1;"/>
<text x="392.2" y="169.0" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">×42.2 · 28.71 s</text>
<text x="188.0" y="201.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">Elasticsearch</text>
<text x="188.0" y="216.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">all fields indexed, sorted</text>
<rect x="200.0" y="194.0" width="189.1" height="20.0" rx="3" style="fill: var(--muted-2); stroke: none; stroke-width: 1; fill-opacity: 0.45;"/>
<text x="397.1" y="209.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-body);">×46.6 · 43.87 s</text>
<text x="188.0" y="241.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">SingleStore</text>
<text x="188.0" y="256.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">shredded by key path</text>
<rect x="200.0" y="234.0" width="204.7" height="20.0" rx="3" style="fill: var(--muted-2); stroke: none; stroke-width: 1; fill-opacity: 0.45;"/>
<text x="412.7" y="249.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-body);">×64 · 51.32 s</text>
<text x="188.0" y="281.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">DuckDB</text>
<text x="188.0" y="296.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">JSON text column</text>
<rect x="200.0" y="274.0" width="213.4" height="20.0" rx="3" style="fill: var(--muted-2); stroke: none; stroke-width: 1; fill-opacity: 0.45;"/>
<text x="421.4" y="289.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-body);">×76.3 · 49.71 s</text>
<text x="188.0" y="321.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">PostgreSQL</text>
<text x="188.0" y="336.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">JSONB + index on query fields</text>
<rect x="200.0" y="314.0" width="289.7" height="20.0" rx="3" style="fill: var(--muted-2); stroke: none; stroke-width: 1; fill-opacity: 0.45;"/>
<text x="497.7" y="329.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-body);">×359.6 · 1,536.68 s</text>
<text x="188.0" y="361.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">MongoDB</text>
<text x="188.0" y="376.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">BSON + index on query fields</text>
<rect x="200.0" y="354.0" width="331.4" height="20.0" rx="3" style="fill: var(--muted-2); stroke: none; stroke-width: 1; fill-opacity: 0.45;"/>
<text x="539.4" y="369.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-body);">×839.5 · 1,833.2 s</text>
</svg>
<figcaption>JSONBench relative time, log scale. The rank is the geometric mean of per-query ratios, so it doesn't always follow the five-query totals.</figcaption>
</figure>

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

<figure class="doc-figure">
<svg viewBox="0 0 680 270" width="100%" role="img" aria-labelledby="shred-breakeven-title shred-breakeven-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="shred-breakeven-title">When ClickHouse&#x27;s load pays for itself</title>
<desc id="shred-breakeven-desc">Two line charts of cumulative seconds against queries run, at 100 million documents. Hot: ClickHouse starts at 800 seconds of load and adds 0.21 seconds per query; Opteryx starts at zero and adds 5.74 seconds per query. The lines cross at about 145 queries. Cold: ClickHouse adds 1.23 seconds per query after its load; Opteryx adds 365 seconds per query. The lines cross at about 2.2 queries, so ClickHouse is ahead from the third.</desc>
<text x="0.0" y="16.0" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Files in cache (hot)</text>
<line x1="46.0" y1="210.0" x2="318.0" y2="210.0" style="stroke: var(--border); stroke-width: 1;"/>
<text x="40.0" y="214.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">0</text>
<line x1="46.0" y1="153.3" x2="318.0" y2="153.3" style="stroke: var(--border); stroke-width: 1;"/>
<text x="40.0" y="157.3" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">400</text>
<line x1="46.0" y1="96.7" x2="318.0" y2="96.7" style="stroke: var(--border); stroke-width: 1;"/>
<text x="40.0" y="100.7" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">800</text>
<line x1="46.0" y1="40.0" x2="318.0" y2="40.0" style="stroke: var(--border); stroke-width: 1;"/>
<text x="40.0" y="44.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">1,200</text>
<text x="46.0" y="226.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">0</text>
<text x="114.0" y="226.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">50</text>
<text x="182.0" y="226.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">100</text>
<text x="250.0" y="226.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">150</text>
<text x="318.0" y="226.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">200</text>
<line x1="46.0" y1="210.0" x2="318.0" y2="210.0" style="stroke: var(--border-2); stroke-width: 1;"/>
<text x="182.0" y="244.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">queries run</text>
<polyline points="46.0,96.7 51.4,96.5 56.9,96.4 62.3,96.3 67.8,96.2 73.2,96.1 78.6,96.0 84.1,95.8 89.5,95.7 95.0,95.6 100.4,95.5 105.8,95.4 111.3,95.3 116.7,95.1 122.2,95.0 127.6,94.9 133.0,94.8 138.5,94.7 143.9,94.5 149.4,94.4 154.8,94.3 160.2,94.2 165.7,94.1 171.1,94.0 176.6,93.8 182.0,93.7 187.4,93.6 192.9,93.5 198.3,93.4 203.8,93.2 209.2,93.1 214.6,93.0 220.1,92.9 225.5,92.8 231.0,92.7 236.4,92.5 241.8,92.4 247.3,92.3 252.7,92.2 258.2,92.1 263.6,92.0 269.0,91.8 274.5,91.7 279.9,91.6 285.4,91.5 290.8,91.4 296.2,91.2 301.7,91.1 307.1,91.0 312.6,90.9 318.0,90.8" style="fill: none; stroke: var(--opteryx-navy); stroke-width: 2.25;"/>
<polyline points="46.0,210.0 51.4,206.7 56.9,203.5 62.3,200.2 67.8,197.0 73.2,193.7 78.6,190.5 84.1,187.2 89.5,184.0 95.0,180.7 100.4,177.5 105.8,174.2 111.3,171.0 116.7,167.7 122.2,164.5 127.6,161.2 133.0,158.0 138.5,154.7 143.9,151.5 149.4,148.2 154.8,144.9 160.2,141.7 165.7,138.4 171.1,135.2 176.6,131.9 182.0,128.7 187.4,125.4 192.9,122.2 198.3,118.9 203.8,115.7 209.2,112.4 214.6,109.2 220.1,105.9 225.5,102.7 231.0,99.4 236.4,96.2 241.8,92.9 247.3,89.7 252.7,86.4 258.2,83.1 263.6,79.9 269.0,76.6 274.5,73.4 279.9,70.1 285.4,66.9 290.8,63.6 296.2,60.4 301.7,57.1 307.1,53.9 312.6,50.6 318.0,47.4" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 2.25;"/>
<line x1="242.7" y1="92.4" x2="242.7" y2="210.0" style="stroke: var(--muted-2); stroke-width: 1; stroke-dasharray: 3 3;"/>
<circle cx="242.7" cy="92.4" r="4" style="fill: var(--bg); stroke: var(--text-deep); stroke-width: 1.5;"/>
<text x="234.7" y="80.4" text-anchor="end" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">even at ≈145</text>
<text x="318.0" y="39.4" text-anchor="end" style="fill: var(--opteryx-teal); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">Opteryx</text>
<text x="318.0" y="106.8" text-anchor="end" style="fill: var(--opteryx-navy); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">ClickHouse</text>
<text x="352.0" y="16.0" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Cold storage</text>
<line x1="398.0" y1="210.0" x2="670.0" y2="210.0" style="stroke: var(--border); stroke-width: 1;"/>
<text x="392.0" y="214.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">0</text>
<line x1="398.0" y1="125.0" x2="670.0" y2="125.0" style="stroke: var(--border); stroke-width: 1;"/>
<text x="392.0" y="129.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">1,000</text>
<line x1="398.0" y1="40.0" x2="670.0" y2="40.0" style="stroke: var(--border); stroke-width: 1;"/>
<text x="392.0" y="44.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">2,000</text>
<text x="398.0" y="226.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">0</text>
<text x="452.4" y="226.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">1</text>
<text x="506.8" y="226.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">2</text>
<text x="561.2" y="226.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">3</text>
<text x="615.6" y="226.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">4</text>
<text x="670.0" y="226.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">5</text>
<line x1="398.0" y1="210.0" x2="670.0" y2="210.0" style="stroke: var(--border-2); stroke-width: 1;"/>
<text x="534.0" y="244.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">queries run</text>
<polyline points="398.0,142.0 403.4,142.0 408.9,142.0 414.3,142.0 419.8,142.0 425.2,141.9 430.6,141.9 436.1,141.9 441.5,141.9 447.0,141.9 452.4,141.9 457.8,141.9 463.3,141.9 468.7,141.9 474.2,141.9 479.6,141.8 485.0,141.8 490.5,141.8 495.9,141.8 501.4,141.8 506.8,141.8 512.2,141.8 517.7,141.8 523.1,141.8 528.6,141.7 534.0,141.7 539.4,141.7 544.9,141.7 550.3,141.7 555.8,141.7 561.2,141.7 566.6,141.7 572.1,141.7 577.5,141.7 583.0,141.6 588.4,141.6 593.8,141.6 599.3,141.6 604.7,141.6 610.2,141.6 615.6,141.6 621.0,141.6 626.5,141.6 631.9,141.6 637.4,141.5 642.8,141.5 648.2,141.5 653.7,141.5 659.1,141.5 664.6,141.5 670.0,141.5" style="fill: none; stroke: var(--opteryx-navy); stroke-width: 2.25;"/>
<polyline points="398.0,210.0 403.4,206.9 408.9,203.8 414.3,200.7 419.8,197.6 425.2,194.5 430.6,191.4 436.1,188.3 441.5,185.2 447.0,182.1 452.4,179.0 457.8,175.9 463.3,172.8 468.7,169.7 474.2,166.6 479.6,163.5 485.0,160.4 490.5,157.3 495.9,154.2 501.4,151.1 506.8,148.0 512.2,144.9 517.7,141.8 523.1,138.7 528.6,135.6 534.0,132.5 539.4,129.4 544.9,126.3 550.3,123.2 555.8,120.1 561.2,117.0 566.6,113.9 572.1,110.8 577.5,107.7 583.0,104.6 588.4,101.5 593.8,98.4 599.3,95.3 604.7,92.2 610.2,89.1 615.6,86.0 621.0,82.9 626.5,79.8 631.9,76.7 637.4,73.6 642.8,70.5 648.2,67.4 653.7,64.3 659.1,61.2 664.6,58.1 670.0,55.0" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 2.25;"/>
<line x1="517.7" y1="141.8" x2="517.7" y2="210.0" style="stroke: var(--muted-2); stroke-width: 1; stroke-dasharray: 3 3;"/>
<circle cx="517.7" cy="141.8" r="4" style="fill: var(--bg); stroke: var(--text-deep); stroke-width: 1.5;"/>
<text x="509.7" y="129.8" text-anchor="end" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">even at ≈2.2</text>
<text x="670.0" y="47.0" text-anchor="end" style="fill: var(--opteryx-teal); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">Opteryx</text>
<text x="670.0" y="157.5" text-anchor="end" style="fill: var(--opteryx-navy); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">ClickHouse</text>
<text x="46.0" y="262.0" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">Cumulative seconds, ClickHouse including its 800 s load.</text>
</svg>
<figcaption>Until the lines cross, Opteryx has answered more queries in less total time. Per-query costs are the five-query totals above divided by five.</figcaption>
</figure>

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
