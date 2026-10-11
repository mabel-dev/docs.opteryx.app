---
title: Avro Deserves Better Than a Dict per Record
description: Avro is everywhere data moves - Iceberg manifests, Kafka sinks, event pipelines - yet Python's readers all hand it back one dictionary at a time. Here's what Rugo and Opteryx's new Avro reader means if you use Iceberg, keep Avro files in a bucket, or just read Avro in Python.
date: 2026-10-11
author: Justin Joyce
role: Opteryx Engineering
tags:
  - avro
  - rugo
  - iceberg
  - performance
  - storage
---

# Avro Deserves Better Than a Dict per Record

## TL;DR

* [Avro](https://avro.apache.org/) is the format data *moves* in: every [Iceberg](https://iceberg.apache.org/) table's manifests are Avro, and Kafka Connect sinks land events as Avro files. Yet every Python reader we tried hands it back one dictionary at a time, and [PyArrow](https://arrow.apache.org/) doesn't read it at all.
* **Using Iceberg with [Opteryx](https://opteryx.app)?** Your queries get to work sooner. Working out which files a snapshot holds - the step before planning even starts - is now **4× to 7× faster**.
* **Got Avro files in a bucket?** Query them with SQL: `SELECT ... FROM READ_AVRO('events/*.avro')`. Over ClickBench's 100 million rows stored as Avro, Opteryx answers the 43 queries in **150 s, against ClickHouse's 590 s** on the same files.
* **Reading Avro in Python?** [Rugo](https://rugo.dev) gives you columns instead of dictionaries: **~8× faster than fastavro and ~50× faster than the Apache reader**, and still ~4× faster than fastavro once every value is a Python object again.

## Avro is everywhere you aren't looking

Avro is not glamorous. It's a row-oriented binary format with its schema in the header: compact, self-describing, and built for writing records quickly as they arrive. That's exactly why so much infrastructure is built on it:

- **Iceberg.** Before an engine reads a single row of an Iceberg table, it reads the snapshot's manifest list and every manifest that points at. Those are Avro. Every Iceberg query starts with Avro.
- **Event pipelines.** Kafka Connect sinks write Avro files to object storage, as do plenty of logging and change-capture tools.

Now look at what Python gives you to read it with:

- **`avro`**, the Apache reference implementation: pure Python, correct, complete - and slow.
- **`fastavro`**: much faster, and the default choice, but it still returns a `dict` per record.
- **PyIceberg** brings *its own* Avro reader for manifests, building a Python object per manifest entry.
- **PyArrow** doesn't read Avro.

Every one of them gives you Python objects, one record at a time. That's fine for a script that copies records from A to B. It's the wrong shape for analysis, which wants a column of numbers you can sum, not a list of dictionaries with a number inside each.

So we built a reader that gives you columns, and put it to work in three places.

## If you use Iceberg: your queries get started sooner

This is why the work happened when it did.

[`opteryx-iceberg`](https://github.com/mabel-dev/opteryx-iceberg) lets Opteryx query external Iceberg tables. Before it can plan a query against a snapshot, it needs the snapshot's file list: every live data file, with each column's min/max bounds so the planner can skip files that can't match. Building that list means reading the snapshot's manifests - and until now that went through PyIceberg, one Python object per entry.

It now reads them with Rugo:

<figure class="doc-figure"><svg viewBox="0 0 680 166" width="100%" role="img" aria-labelledby="avro-manifests-title avro-manifests-desc" style="font-family: var(--font-body);"><title id="avro-manifests-title">Time to build an Iceberg snapshot's file list</title><desc id="avro-manifests-desc">100 manifests and 300 data files: PyIceberg 56.6 ms, Rugo 14.0 ms. One manifest and 2,000 data files: PyIceberg 101.8 ms, Rugo 14.4 ms.</desc><style>.avx-ours{fill:#008d82}.avx-them{fill:#fe7701}.avx-est{fill:none;stroke:#fe7701;stroke-width:1.5;stroke-dasharray:5 4}:root[data-theme="dark"] .avx-ours{fill:#2aa9a6}:root[data-theme="dark"] .avx-them{fill:#e0731a}:root[data-theme="dark"] .avx-est{stroke:#e0731a}.avx-label{fill:var(--text-deep);font-size:12.5px;font-family:var(--font-body)}.avx-value{fill:var(--text-deep);font-size:12.5px;font-weight:600;font-family:var(--font-body)}.avx-note{fill:var(--muted);font-size:11.5px;font-family:var(--font-body)}.avx-axis{stroke:var(--border-2);stroke-width:1}</style><rect x="190" y="8" width="12" height="12" rx="2" class="avx-ours"/><text x="208" y="18" class="avx-label">Rugo</text><rect x="264" y="8" width="12" height="12" rx="2" class="avx-them"/><text x="282" y="18" class="avx-label">PyIceberg</text><line x1="190" y1="34" x2="190" y2="160" class="avx-axis"/><path d="M190.0,40.0 h224.0 a4.0,4.0 0 0 1 4.0,4.0 v12.0 a4.0,4.0 0 0 1 -4.0,4.0 h-224.0 z" class="avx-them"><title>300 data files, PyIceberg: 56.6 ms</title></path><text x="426.0" y="54.5" class="avx-value">56.6 ms</text><path d="M190.0,64.0 h52.4 a4.0,4.0 0 0 1 4.0,4.0 v12.0 a4.0,4.0 0 0 1 -4.0,4.0 h-52.4 z" class="avx-ours"><title>300 data files, Rugo: 14.0 ms</title></path><text x="254.4" y="78.5" class="avx-value">14.0 ms</text><text x="180" y="57" text-anchor="end" class="avx-label">300 data files</text><text x="180" y="73" text-anchor="end" class="avx-note">100 manifests</text><path d="M190.0,110.0 h406.0 a4.0,4.0 0 0 1 4.0,4.0 v12.0 a4.0,4.0 0 0 1 -4.0,4.0 h-406.0 z" class="avx-them"><title>2,000 data files, PyIceberg: 101.8 ms</title></path><text x="608.0" y="124.5" class="avx-value">101.8 ms</text><path d="M190.0,134.0 h54.0 a4.0,4.0 0 0 1 4.0,4.0 v12.0 a4.0,4.0 0 0 1 -4.0,4.0 h-54.0 z" class="avx-ours"><title>2,000 data files, Rugo: 14.4 ms</title></path><text x="256.0" y="148.5" class="avx-value">14.4 ms</text><text x="180" y="127" text-anchor="end" class="avx-label">2,000 data files</text><text x="180" y="143" text-anchor="end" class="avx-note">1 manifest</text></svg><figcaption>Building a snapshot's file list from its manifests. Cold, local disk.</figcaption></figure>

To be clear about what's being timed: this is the toll paid *before* the query is planned and before a single byte of the table's data is read. It sits in front of the first query against every snapshot, and on a table with many manifests it's the difference between noticing it and not.

It shows up end to end, too. Our local Iceberg benchmarks exist mainly to test compatibility rather than speed, but with manifests now read by Rugo the suite runs **25% faster**.

The other thing you get is the same answer. The new code makes exactly the decisions PyIceberg's planner makes - which entries are live, which sequence numbers apply, which delete files touch which data files - and it's tested file by file against PyIceberg's own planner across v1 tables, v2 tables, partitioned and unpartitioned tables, and a v1 table upgraded to v2. Tables with merge-on-read deletes are still refused, exactly when PyIceberg would attach a delete, rather than read without them. PyIceberg is still the catalog client - it reads `metadata.json`, snapshots and schemas, which it's genuinely good at.

## If you have Avro files: query them with SQL

Avro is like CSV and JSONL in Opteryx: something you read, not a format you store tables in. So it arrives as a table function, and a glob reads a whole folder:

~~~sql
SELECT status, COUNT(*)
FROM READ_AVRO('gs://my-bucket/events/2026-10-*.avro')
GROUP BY status;
~~~

Files written months apart with slightly different schemas still line up - each is read as the first file's schema, with missing fields filled with their defaults. Nested records, maps and arrays come back as JSON, so `->>` pulls fields out of them the same way it does for nested Parquet. And `COUNT(*)` over a folder of Avro files is close to free: every Avro block records how many rows it holds.

To see how it holds up, we wrote ClickBench's 100 million rows as 103 Avro files (14 GB, deflate) and ran its 43 queries against Opteryx, ClickHouse and DuckDB, all reading the same files:

<figure class="doc-figure"><svg viewBox="0 0 680 144" width="100%" role="img" aria-labelledby="avro-clickbench-title avro-clickbench-desc" style="font-family: var(--font-body);"><title id="avro-clickbench-title">ClickBench's 43 queries over 100 million rows stored as Avro</title><desc id="avro-clickbench-desc">Opteryx 150 seconds; ClickHouse local 590 seconds; DuckDB with its Avro extension took about 50 seconds per query, an estimated 36 minutes for all 43, so the run was stopped after three.</desc><style>.avx-ours{fill:#008d82}.avx-them{fill:#fe7701}.avx-est{fill:none;stroke:#fe7701;stroke-width:1.5;stroke-dasharray:5 4}:root[data-theme="dark"] .avx-ours{fill:#2aa9a6}:root[data-theme="dark"] .avx-them{fill:#e0731a}:root[data-theme="dark"] .avx-est{stroke:#e0731a}.avx-label{fill:var(--text-deep);font-size:12.5px;font-family:var(--font-body)}.avx-value{fill:var(--text-deep);font-size:12.5px;font-weight:600;font-family:var(--font-body)}.avx-note{fill:var(--muted);font-size:11.5px;font-family:var(--font-body)}.avx-axis{stroke:var(--border-2);stroke-width:1}</style><rect x="190" y="8" width="12" height="12" rx="2" class="avx-ours"/><text x="208" y="18" class="avx-label">Opteryx</text><rect x="288" y="8" width="12" height="12" rx="2" class="avx-them"/><text x="306" y="18" class="avx-label">Other engines</text><line x1="190" y1="32" x2="190" y2="134" class="avx-axis"/><text x="180" y="53.5" text-anchor="end" class="avx-label">Opteryx</text><path d="M190.0,38.0 h24.6 a4.0,4.0 0 0 1 4.0,4.0 v14.0 a4.0,4.0 0 0 1 -4.0,4.0 h-24.6 z" class="avx-ours"><title>Opteryx: 150 s for all 43 queries</title></path><text x="226.6" y="53.5" class="avx-value">150 s</text><text x="180" y="87.5" text-anchor="end" class="avx-label">ClickHouse</text><path d="M190.0,72.0 h108.5 a4.0,4.0 0 0 1 4.0,4.0 v14.0 a4.0,4.0 0 0 1 -4.0,4.0 h-108.5 z" class="avx-them"><title>ClickHouse: 590 s for all 43 queries</title></path><text x="310.5" y="87.5" class="avx-value">590 s</text><text x="180" y="121.5" text-anchor="end" class="avx-label">DuckDB</text><rect x="190.0" y="106.8" width="409.2" height="20.5" rx="4" class="avx-est"><title>DuckDB: about 50 s per query; 43 queries would take about 36 minutes</title></rect><text x="202" y="121.5" class="avx-value">~36 min (we stopped waiting)</text></svg><figcaption>Total time for ClickBench's 43 queries over the same 103 deflate Avro files (14 GB). The DuckDB bar is 43 × its ~50 s per query; we stopped after three.</figcaption></figure>

ClickHouse takes about 13 seconds on nearly every query, `COUNT(*)` included - we answer that one in 0.11 s. Opteryx is ahead on all 43 queries, 4× at the median. DuckDB's Avro extension took 47-52 seconds *per query*; at that pace the full run is over half an hour, and after three queries we decided we had better things to do with the afternoon.

Filters on wide files are where Avro usually hurts most, so we made them cheap too. When a query filters an Avro file, Opteryx decodes just the columns the filter needs, throws away the rows that fail, and only then goes back for the rest of the row. ClickBench's `SELECT * ... WHERE URL LIKE '%google%'` - every one of 105 columns, for the roughly 16,000 rows that match - went from **12.2 s to 3.8 s**. Queries with filters that keep most rows don't pay for the trick: Opteryx notices, and reads them the plain way.

## If you read Avro in Python: take columns, not dictionaries

You don't need a query engine for any of this. `pip install rugo` and:

~~~python
from rugo import avro

with avro.read_avro("events.avro", columns=["user_id", "status"]) as reader:
    for batch in reader:
        statuses = batch.column("status").to_pylist()
~~~

Ask for the columns you need and only those are decoded. Here's the same file read by each library:

<figure class="doc-figure"><svg viewBox="0 0 680 178" width="100%" role="img" aria-labelledby="avro-readers-title avro-readers-desc" style="font-family: var(--font-body);"><title id="avro-readers-title">Time to read 200,000 Avro records, every field</title><desc id="avro-readers-desc">Rugo 116 ms; Rugo including conversion to Python values 213 ms; fastavro 912 ms; the Apache avro package 5.81 s. Single thread, deflate, 20 fields.</desc><style>.avx-ours{fill:#008d82}.avx-them{fill:#fe7701}.avx-est{fill:none;stroke:#fe7701;stroke-width:1.5;stroke-dasharray:5 4}:root[data-theme="dark"] .avx-ours{fill:#2aa9a6}:root[data-theme="dark"] .avx-them{fill:#e0731a}:root[data-theme="dark"] .avx-est{stroke:#e0731a}.avx-label{fill:var(--text-deep);font-size:12.5px;font-family:var(--font-body)}.avx-value{fill:var(--text-deep);font-size:12.5px;font-weight:600;font-family:var(--font-body)}.avx-note{fill:var(--muted);font-size:11.5px;font-family:var(--font-body)}.avx-axis{stroke:var(--border-2);stroke-width:1}</style><rect x="190" y="8" width="12" height="12" rx="2" class="avx-ours"/><text x="208" y="18" class="avx-label">Rugo</text><rect x="264" y="8" width="12" height="12" rx="2" class="avx-them"/><text x="282" y="18" class="avx-label">Python's Avro readers</text><line x1="190" y1="32" x2="190" y2="168" class="avx-axis"/><text x="180" y="53.5" text-anchor="end" class="avx-label">Rugo</text><path d="M190.0,38.0 h4.2 a4.0,4.0 0 0 1 4.0,4.0 v14.0 a4.0,4.0 0 0 1 -4.0,4.0 h-4.2 z" class="avx-ours"><title>Rugo: ~116 ms</title></path><text x="206.2" y="53.5" class="avx-value">~116 ms</text><text x="180" y="87.5" text-anchor="end" class="avx-label">Rugo → Python values</text><path d="M190.0,72.0 h11.0 a4.0,4.0 0 0 1 4.0,4.0 v14.0 a4.0,4.0 0 0 1 -4.0,4.0 h-11.0 z" class="avx-ours"><title>Rugo → Python values: ~213 ms</title></path><text x="213.0" y="87.5" class="avx-value">~213 ms</text><text x="180" y="121.5" text-anchor="end" class="avx-label">fastavro</text><path d="M190.0,106.0 h60.4 a4.0,4.0 0 0 1 4.0,4.0 v14.0 a4.0,4.0 0 0 1 -4.0,4.0 h-60.4 z" class="avx-them"><title>fastavro: ~912 ms</title></path><text x="262.4" y="121.5" class="avx-value">~912 ms</text><text x="180" y="155.5" text-anchor="end" class="avx-label">avro (Apache)</text><path d="M190.0,140.0 h406.0 a4.0,4.0 0 0 1 4.0,4.0 v14.0 a4.0,4.0 0 0 1 -4.0,4.0 h-406.0 z" class="avx-them"><title>avro (Apache): ~5.81 s</title></path><text x="608.0" y="155.5" class="avx-value">~5.81 s</text></svg><figcaption>Reading 200k records × 20 fields (deflate), every field, one thread. Best of five.</figcaption></figure>

| Query shape | Rugo | Rugo → Python values | fastavro | avro (Apache) |
|---|---|---|---|---|
| Every field | ~116 ms | ~213 ms | ~912 ms | ~5.81 s |
| 3 of 20 fields | ~81 ms | ~88 ms | ~712 ms | ~3.48 s |

That's 200k records of 20 fields with deflate compression, a mix of what event streams actually carry: numbers, strings, nullable fields, enums, timestamps, decimals, and nested records, arrays and maps. Rugo 0.5.0, fastavro 1.13.1, avro 1.12.2, one thread, best of five. The "Rugo → Python values" column converts every column into Python objects, so it's the fair comparison if Python objects are what you want at the end.

On a bigger, plainer file - a million rows of 20 columns - the gap is wider still:

| File (1M rows × 20 columns) | Columns | Rugo | fastavro | Apache `avro` |
|---|---|---|---|---|
| uncompressed | all | 0.28 s | 5.36 s | 35.6 s |
| uncompressed | 3 of 20 | 0.10 s | 4.05 s | 20.9 s |
| deflate | all | 0.46 s | 5.85 s | 36.3 s |
| zstandard | all | 0.47 s | 5.58 s | 37.2 s |

The fair caveats: fastavro and `avro` are smaller installs (3.1 MB and 0.5 MB, against Rugo's 8.1 MB, which also covers Parquet, CSV and JSONL), and they write Avro. Rugo only reads it, for now - a writer is on the way.

## Why it's quick

Briefly, because the *what* matters more than the *how*:

- **The schema is worked out once per file**, not once per value. Opening a file turns its schema and your column list into a short list of steps, and every record just follows the steps.
- **What you didn't ask for is skipped, not read.** Unwanted strings are jumped over in one step, and runs of unwanted numbers in one more.
- **No Python object is created per value.** Values land straight in columns.
- **Every core helps with one big file**, and compressed files decompress with [libdeflate](https://github.com/ebiggers/libdeflate), one of the fastest deflate decoders there is.

We also didn't take the shortcut of wrapping the Apache project's C++ library, because it drags in Boost - and Opteryx and Rugo install with no dependencies at all. The reader is fuzzed with sanitizers on, and anything it can't read correctly (a handful of rarely-used Avro features) it refuses by name rather than guessing.

## It's new, and it will have rough edges

As at October 2026, Avro support in Rugo and Opteryx is new. It's tested against fastavro and the Apache reader, checked against PyIceberg's planner, and fuzzed - but Avro files in the wild come from a lot of different writers, and some of them will find corners we haven't. Expect rough edges.

We're going to keep battering the reader, and we're adding a writer, and we'll work through what turns up as we go. If you point Rugo or `READ_AVRO` at your own files - especially the odd ones - we'd love to hear how it went, good or bad. [Open an issue](https://github.com/mabel-dev/opteryx-core/issues) and tell us what you were reading and what happened.

## The honest part

Avro is not an analytics format, and no reader changes that.

The same ClickBench data stored as Parquet runs about 26× faster in Opteryx. Our Avro floor is about 3 seconds a query, and profiling says why: 61% of it is decompressing the file, and 35% is walking through rows. Avro stores whole rows, so reading one column still means stepping past every other field of every record - and there are no statistics in the format to skip anything with. A filter on `CounterID = 62` reads every row of every file.

We tried to dig under that floor. Skipping runs of numbers with vector instructions came out 35% *slower* than the plain loop - Avro's numbers are mostly one to three bytes, too short for the trick to pay - so we dropped it.

And that's fine. Avro's job is to carry data reliably from the thing that made it to the thing that stores it. Ours is to make sure that when you need to read it - to start an Iceberg query, to dig through last night's events in a bucket, or to load a file in a notebook - it costs as little as the format allows, and doesn't arrive one dictionary at a time.

— Justin
