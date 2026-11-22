---
title: We Wrote the Table, Then Ran the Fastest Hot Queries on It
description: ClickBench now has an Iceberg cohort, where each engine writes the table and then queries it. Opteryx is first of ten on hot runs, second on combined and third on cold. Here's what that view measures, where we win and lose against ClickHouse, and why our cold runs are slow.
date: 2026-11-22
author: Justin Joyce
role: Opteryx Engineering
tags:
  - performance
  - benchmarks
  - clickbench
  - iceberg
  - rugo
---

# We Wrote the Table, Then Ran the Fastest Hot Queries on It

## TL;DR

* ClickBench has a new storage filter, Iceberg. Each engine creates an [Apache Iceberg](https://iceberg.apache.org/) table through a REST catalog, writes the 100-million-row dataset into it with one `INSERT ... SELECT` on default settings, then runs the 43 queries against the table it wrote.
* On ClickBench's reference machine, [`c6a.4xlarge`](https://benchmark.clickhouse.com/#system=-&type=-&machine=-6t|ae-|ca2|6ax|cgle|gel|6ale|3al&cluster_size=-&opensource=-&hardware=+c&tuned=+n&storage=+ee&category=-nu|j&metric=hot&best=no&queries=-), [Opteryx](https://opteryx.app) is **first of ten on hot runs** (×1.24, ahead of ClickHouse at ×1.58), second on combined and third on cold (22 November 2026).
* Opteryx wrote every file of that table: the Parquet data files, and the Avro manifests and manifest lists. [Rugo](https://rugo.dev) did all of it. PyIceberg is only the REST client.
* Cold runs are our weak spot. Every cold query pays a floor of about 0.65 seconds, even `SELECT COUNT(*)`, which ClickHouse answers cold in 26 ms. We'd like those 0.65 seconds back.

## The Iceberg cohort

ClickBench is ClickHouse's benchmark. ClickHouse is, unsurprisingly, very good at it. So when the first results came in for the new Iceberg view and an engine with a Python planner was at the top of the hot-run column, we checked the URL twice.

Most of ClickBench's storage filters are about *reading*. The Parquet entries all read the same files, the ones ClickBench ships. The Iceberg entries are different. [The rules](https://github.com/ClickHouse/ClickBench/blob/main/lib/iceberg/README.md) make each engine write the table itself:

* The table is created through an Iceberg REST catalog, **unpartitioned, unsorted, with default table properties**.
* The data goes in with **one `INSERT ... SELECT`** from the downloaded Parquet files. Settings that change how the data is written aren't allowed: no file sizes, row-group sizes, compression, sort order or number of writers.
* **No maintenance afterwards.** No compaction, no `OPTIMIZE`, no sorting after the load.
* Each cold run restarts the engine and drops its caches. The storage isn't restarted.

In their words, the result shows "how good a system is both as a writer and as a reader of Iceberg". The layout, file sizes, encodings and statistics an engine picks by default all end up in the score.

It's an open-book exam where you also had to write the book. There's nothing to tune, and nothing to explain away. Our [Parquet entry](/blog/2026-10-24-python-top-of-clickbench) came first on `c6a.large`, with a footnote: its load step sorted the data first. This one has no footnote. It doesn't sort anything. It's `CREATE TABLE`, then `INSERT ... SELECT`, with Opteryx 0.10.2 and its defaults.

The storage is [SeaweedFS](https://github.com/seaweedfs/seaweedfs) on the same machine, serving both the S3 API and the REST catalog. That matters for reading the cold numbers: every byte goes through an S3 API, but there's no real network in the way.

## Where Opteryx ranks

<figure class="doc-figure">
<svg viewBox="0 0 680 172" width="100%" role="img" aria-labelledby="icb-hot-title icb-hot-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="icb-hot-title">ClickBench hot-run scores for Iceberg entries on c6a.4xlarge</title>
<desc id="icb-hot-desc">Lower is better. Opteryx ×1.24, ClickHouse ×1.58, DuckDB ×3.00, StarRocks ×3.68, Doris ×3.78, Databend ×5.93.</desc>
<line x1="150" y1="4" x2="150" y2="168" style="stroke: var(--border-2); stroke-width: 1;"/>
<text x="140" y="23.5" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Opteryx</text>
<rect x="150" y="10" width="90.9" height="18" rx="3" style="fill: var(--opteryx-teal); fill-opacity: 0.85;"><title>Opteryx (Iceberg): ×1.24</title></rect>
<text x="248.9" y="23.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">×1.24</text>
<text x="140" y="49.5" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">ClickHouse</text>
<rect x="150" y="36" width="115.9" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>ClickHouse (Iceberg): ×1.58</title></rect>
<text x="273.9" y="49.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">×1.58</text>
<text x="140" y="75.5" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">DuckDB</text>
<rect x="150" y="62" width="220.0" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>DuckDB (Iceberg): ×3.00</title></rect>
<text x="378.0" y="75.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">×3.00</text>
<text x="140" y="101.5" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">StarRocks</text>
<rect x="150" y="88" width="269.9" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>StarRocks (Iceberg): ×3.68</title></rect>
<text x="427.9" y="101.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">×3.68</text>
<text x="140" y="127.5" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Doris</text>
<rect x="150" y="114" width="277.2" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>Doris (Iceberg): ×3.78</title></rect>
<text x="435.2" y="127.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">×3.78</text>
<text x="140" y="153.5" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Databend</text>
<rect x="150" y="140" width="434.9" height="18" rx="3" style="fill: var(--opteryx-orange); fill-opacity: 0.85;"><title>Databend (Iceberg): ×5.93</title></rect>
<text x="592.9" y="153.5" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">×5.93</text>
</svg>
<figcaption>ClickBench hot-run score, storage filter Iceberg, <code>c6a.4xlarge</code>, captured 22 November 2026. Lower is better. Not shown: Trino ×10.94, DataFusion ×19.33, Presto ×21.63, Spark ×45.03.</figcaption>
</figure>

All ten entries run on `c6a.4xlarge` (16 vCPU, 32 GB). Here's the full picture:

| Metric | Opteryx | Position | Ahead of us |
| --- | --- | --- | --- |
| [Hot](https://benchmark.clickhouse.com/#system=-&type=-&machine=-6t|ae-|ca2|6ax|cgle|gel|6ale|3al&cluster_size=-&opensource=-&hardware=+c&tuned=+n&storage=+ee&category=-nu|j&metric=hot&best=no&queries=-) | ×1.24 | **1st** of 10 | none |
| [Combined](https://benchmark.clickhouse.com/#system=-&type=-&machine=-6t|ae-|ca2|6ax|cgle|gel|6ale|3al&cluster_size=-&opensource=-&hardware=+c&tuned=+n&storage=+ee&category=-nu|j&metric=combined&best=no&queries=-) | ×1.57 | 2nd | ClickHouse ×1.43 |
| [Cold](https://benchmark.clickhouse.com/#system=-&type=-&machine=-6t|ae-|ca2|6ax|cgle|gel|6ale|3al&cluster_size=-&opensource=-&hardware=+c&tuned=+n&storage=+ee&category=-nu|j&metric=cold&best=no&queries=-) | ×2.53 | 3rd | ClickHouse ×1.31, DuckDB ×1.95 |
| Load time | 228 s | 7th | DataFusion 75 s, DuckDB 85 s, ClickHouse 90 s, and three more |
| Table size | 12.18 GB | 7th | DataFusion 9.89 GB is the smallest |

Some context for those numbers:

* **The score is a geometric mean of per-query ratios.** It rewards being fast on many queries more than it punishes being slow on a few. Add up the hot times and Opteryx and ClickHouse are almost level: 21.6 seconds against 22.7.
* **Results are snapshots.** Most entries were last run between 8 and 14 November. ClickHouse refreshes its numbers every day. These positions will move.
* **It's the reference machine.** ClickBench's canonical setup is `c6a.4xlarge`, so that's the view this post reports. The Iceberg entries run on other machines too, and the order isn't the same on all of them.
* **Our load is slow.** 228 seconds is two and a half times ClickHouse's 90. It counts toward the combined score but not the hot or cold ones. We're quick readers and slow writers, like most of us.

## We wrote the table

The fun part of this cohort is that the engine's writer gets graded as well as its reader.

Our relationship with Iceberg has had its ups and downs. In October we [wrote about](/blog/2026-10-17-iceberg-redux) how Opteryx's catalog started out as an Iceberg catalog, left the format within a month, and came back to Iceberg as a reader. That post ended with Rugo learning to write Avro. Since then `opteryx-iceberg` has learned to write whole tables. For this entry, everything in the table came from Opteryx:

* **The data files are Parquet written by Rugo,** with Iceberg field ids in their schema. They carry Rugo's defaults, including an exact sum for every integer column chunk (more on that below).
* **The manifests and manifest lists are Avro written by Rugo.**
* **PyIceberg is only the REST catalog client.** It makes the calls that create the table and commit the snapshot. It doesn't write any files.

So the reader is reading files its own writer laid out. The writer gets to leave the reader some helpful notes, and every engine in the cohort has the same chance to. That's the point of this view, and it's where a lot of our hot-run lead comes from.

## Where we win, and where ClickHouse does

Hot-run time per query, Opteryx against ClickHouse, both on the Iceberg table each wrote. Opteryx is faster on 27 of 43 queries and the fastest of all ten engines on 25.

| Queries | What they do | Opteryx | ClickHouse |
| --- | --- | --- | --- |
| Q36–Q42 | Filters on `CounterID = 62` and a date range, small `GROUP BY` | **0.24 s** | 0.65 s |
| Q20–Q22 | `LIKE '%google%'` on `URL` and `Title` | **2.28 s** | 4.19 s |
| Q0, Q2, Q3, Q6, Q29 | Ungrouped `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` | **0.06 s** | 0.39 s |
| Q17 | `GROUP BY UserID, SearchPhrase LIMIT 10`, no `ORDER BY` | **0.019 s** | 0.356 s |
| Q4, Q5, Q13, Q15, Q16, Q18, Q32, Q35 | `GROUP BY` or `COUNT(DISTINCT)` on high-cardinality keys | 7.96 s | **4.26 s** |

**Filtered queries.** The last seven queries each touch a small slice of the table. Opteryx runs them in 20 to 75 ms each. ClickHouse takes 55 to 176 ms. The data isn't sorted, so none of this comes from a helpful sort order.

**`LIKE`.** Q20 counts URLs containing `google`. Opteryx takes 0.31 seconds and ClickHouse 1.18. We've put a slightly unreasonable amount of work into [`LIKE`](/blog/2026-04-10-like-performance), and it's nice to see it pay off.

**Aggregates answered from statistics.** This is the part where a careful reader squints. Summing 100 million integers in 10 ms isn't a fast scan. It's no scan at all.

Q0 (`COUNT(*)`) and Q6 (`MIN`/`MAX` of `EventDate`) come straight from Iceberg's own metadata: row counts and column bounds. Q2, Q3 and Q29 sum integer columns, and Iceberg doesn't store sums. Rugo does. When it writes a Parquet file, it puts the exact sum of each integer column chunk in that chunk's `key_value_metadata`, under `rugo.sum`. That's the slot the Parquet spec gives for extra facts about a chunk. A reader that trusts it, which Opteryx does only for files Rugo wrote, can answer `SUM(AdvEngineID)` or `AVG(UserID)` from the footers without decoding a value. Q29 sums `ResolutionWidth + k` for 90 values of `k`. The planner folds that into one `SUM` and one `COUNT`, then answers both from statistics, in 26 ms.

This is within the rules, because nothing was configured: Rugo writes the sums by default. It's also exactly the kind of thing this cohort was designed to measure. Even so, it's worth saying plainly that these few queries are fast because of what Opteryx wrote, not because of how fast it scans.

**`LIMIT` without `ORDER BY`.** Q17 groups by `UserID` and `SearchPhrase` and asks for any 10 groups. It doesn't say which 10. Opteryx takes it at its word, stops when it has 10, and finishes in 19 ms. ClickHouse takes 356 ms.

**High-cardinality `GROUP BY`.** This is where ClickHouse reminds us whose benchmark it is. Counting distinct `UserID`s (Q4) takes it 0.16 seconds, against our 0.35. Grouping by `WatchID, ClientIP` over all 100 million rows (Q32) takes it 1.33 seconds, against our 2.26. Q35, which groups on `ClientIP` and three expressions of it, is our worst ratio at 2.8 times slower. Across these eight queries ClickHouse needs 4.3 seconds and we need 8.0. That's the same gap we found on bigger machines with Parquet, and it's the next thing we're working on.

## Why cold runs are slow

Now the part we're less proud of. On cold runs we come third, and the reason shows up on the very first query.

`SELECT COUNT(*) FROM hits` reads no data at all. It's answered from metadata. Hot, Opteryx takes 7 ms and ClickHouse 8 ms. Cold, ClickHouse takes **26 ms** and Opteryx **713 ms**. That's most of a second to report a number already written down in the metadata.

That gap isn't a one-off. Opteryx's fastest cold query of the 43 takes 647 ms. ClickHouse's median cold query is 631 ms. The median gap between our cold and hot time is 1.07 seconds. ClickHouse's is 0.39.

The process start and Python's imports aren't in that number. The benchmark starts our query server and checks it's alive before the clock starts, and the clock only times the query. So the floor is something the first query in a fresh process pays. We haven't broken it down yet. The suspects are loading the table from the REST catalog, reading `metadata.json`, the manifest list and the manifests, and whatever the engine sets up the first time it runs.

If every query pays at least 0.65 seconds, that's about 28 seconds of our 112-second cold total. It's the biggest single thing standing between us and ClickHouse on cold runs. It's also probably the easiest to fix, which is the best kind of embarrassing.

## What's left

* **The cold-process floor.** Find out where 650 ms goes on a query that reads no data, and get rid of most of it.
* **High-cardinality `GROUP BY`.** Distinct counts and wide group keys are where ClickHouse is twice as fast.
* **Load time.** Writing the table takes 228 seconds. DataFusion, DuckDB and ClickHouse all do it in under 90.

## Engineering takeaways

* **If you write the files, you decide what the reader knows.** A sum in each chunk's metadata costs a few bytes, and it turns a scan into a footer read.
* **Use the slot the format gives you.** Parquet has `key_value_metadata` on every column chunk. Any other reader can ignore `rugo.sum` and still read the file.
* **Benchmarks that grade the writer are more honest.** No engine here can pick a flattering layout by hand. They all live with their defaults.
* **Look at the smallest query first.** A 0.7-second `COUNT(*)` tells you more about cold-run cost than any average does.
* **Name the view, and show the queries you lose.**

ClickHouse re-runs its entry every day, so this may not last. We'll enjoy it while it does.

— Justin
