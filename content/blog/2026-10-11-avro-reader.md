---
title: Avro Deserves Better Than a Dict per Record
description: Avro is everywhere data moves - Iceberg manifests, Kafka sinks, event pipelines - yet Python's readers all hand it back one dictionary at a time. We wrote a native Avro reader for Rugo and Opteryx, starting with the very practical job of reading Iceberg manifests.
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

* [Avro](https://avro.apache.org/) is the format data *moves* in. Every [Iceberg](https://iceberg.apache.org/) table's manifest lists and manifests are Avro, and Kafka Connect sinks land events as Avro container files. Yet in Python every reader we found hands it back one dictionary (or one object) per record, and [PyArrow](https://arrow.apache.org/) has no Avro reader at all.
* [Rugo](https://rugo.dev) - [Opteryx](https://opteryx.app)'s file engine - now reads Avro natively: C++ end to end, a decode program compiled once per schema, values written straight into columns. Reading every field it's **~8× faster than fastavro and ~50× faster than the Apache reference reader**, and still ~4× faster than fastavro after converting its columns into Python values.
* The first job it does is Iceberg planning. `opteryx-iceberg` now decodes manifests with Rugo instead of PyIceberg: **4× to 7× faster** to build a snapshot's file list, with the same answers.
* Opteryx gets `READ_AVRO`, fully native. On ClickBench's 100 million rows written as Avro, Opteryx finishes the 43 queries in **150 s against ClickHouse's 590 s** on the same files. Avro is still a row format - the same data in Parquet runs ~26× faster - and I'll be straight about why.

## A format that's everywhere and nowhere

Avro is not glamorous. It's a row-oriented binary format with a JSON schema in the header: compact, self-describing, splittable, and designed for writing records quickly as they arrive. That's exactly why it ended up underneath so much infrastructure:

- **Iceberg manifests.** Before an engine reads a single row of an Iceberg table it reads the snapshot's manifest list and every manifest it points at. Those are Avro. Query planning on Iceberg *is* Avro decoding.
- **Event pipelines.** Kafka Connect sinks write Avro object container files to object storage. So do plenty of logging and CDC tools.

But look at what Python offers for reading it:

- **`avro`**, the Apache reference implementation - pure Python. Correct, complete, and slow.
- **`fastavro`** - Cython, and the de facto choice. Much faster, but it still returns a `dict` per record.
- **PyIceberg** carries *its own* Avro implementation for manifests - a Cython primitive decoder driving a Python reader object per field, building a `Record` per manifest entry.
- **PyArrow** has no Avro reader.

Every one of them produces Python objects, one record at a time. That's fine for an ETL script. It's the wrong shape for a columnar query engine, which wants a column of 65,536 `int64`s, not 65,536 dictionaries with an `int64` inside each.

## Why we didn't just wrap Apache Avro C++

The obvious move was the Apache project's C++ library (or ClickHouse's fork of it). We looked, and said no: it pulls in Boost.

Opteryx has a hard rule that the engine installs with zero dependencies - everything it needs is vendored, small, and agreed. Boost is none of those. And honestly, the parts of Avro an engine needs are not large: a container format, a varint encoding, four codecs and a schema language. The interesting work is in *how* you decode, and that's the part we wanted to own.

## What we built

**The schema becomes a program.** When a file is opened, its schema - plus the columns the query asked for - is compiled into a flat list of decode instructions: read a varint into column 3, read a nullable string into column 7, skip a record, skip three varints. A tight `switch` interpreter runs that program once per record. There's no per-value lookup of "what type is this field?" at run time; that question was answered once, when the program was built.

**Skipping is the fast path.** Most queries want a few columns of a wide record. Avro has no column offsets, so unselected fields still have to be stepped over - but stepping is cheap if you plan it. Strings and bytes skip with one length read and a jump. Runs of consecutive integer fields collapse into a single "skip N varints" instruction. Nullable values, arrays and maps of simple types get their own fused skips. That work alone took 15% off reads of a few columns from an uncompressed file.

**Values go straight into columns.** Decoded values are written into Draken column buffers - the same vectors the engine executes on. No Python object is ever created per value.

**Nested data follows the Parquet rules.** A whole record, map, or array of records comes back as JSON text, exactly as nested Parquet does in Opteryx, so `->>` works the same way on both. Ask for a dotted leaf like `data_file.file_path` and you get a plain typed column.

**Reader schemas, done properly.** Iceberg relies on schema evolution: fields matched by `field-id`, missing fields filled with defaults, `int` read as `long`. Rugo implements Avro's resolution rules, and a field the file lacks becomes a *constant* column - one value, with every row pointing at it - rather than a column filled with copies.

**It refuses what it can't do, by name.** Unions other than `["null", T]`, recursive types, `uuid`, `bzip2`/`xz` and a few logical types are rejected with an error that says which construct and where, never silently mis-read.

**Then we made it fast.** After the first release we swapped deflate from miniz to [libdeflate](https://github.com/ebiggers/libdeflate) (24-32% faster on compressed files), let one file's blocks decode across every core (9.8× on 18 threads for a 1M-row deflate file), and pre-sized buffers from the previous batch. The whole decoder is fuzzed under AddressSanitizer and UndefinedBehaviorSanitizer.

## How it compares

Decoding the same in-memory file on one thread - 200k rows, 20 fields, deflate, with an event-stream mix of scalars, nullable unions, enums, timestamps, decimals, and nested records, arrays and maps:

| Query shape | Rugo | Rugo → Python values | fastavro | avro (Apache) |
|---|---|---|---|---|
| Every field | ~116 ms | ~213 ms | ~912 ms | ~5.81 s |
| 3 of 20 fields | ~81 ms | ~88 ms | ~712 ms | ~3.48 s |

Rugo 0.5.0, fastavro 1.13.1, avro 1.12.2, best of five. The "Rugo → Python" column converts every column into Python values, so it's the like-for-like comparison if Python objects are what you want at the end - and it's still ~4× ahead of fastavro and ~27× ahead of `avro`.

On a larger, plainer file - a million rows of 20 columns - the gap is wider still:

| File (1M rows × 20 columns) | Columns | Rugo | fastavro | Apache `avro` |
|---|---|---|---|---|
| uncompressed | all | 0.28 s | 5.36 s | 35.6 s |
| uncompressed | 3 of 20 | 0.10 s | 4.05 s | 20.9 s |
| deflate | all | 0.46 s | 5.85 s | 36.3 s |
| zstandard | all | 0.47 s | 5.58 s | 37.2 s |

The deflate and zstandard rows use the libdeflate build, which lands in the next Rugo release.

The fair caveat: fastavro and `avro` are much smaller installs (3.1 MB and 0.5 MB against Rugo's 8.1 MB, which covers four formats). If you need to *write* Avro, Rugo doesn't - it's a reader.

## The first customer: Iceberg manifests

This is why the work happened when it did.

[`opteryx-iceberg`](https://github.com/mabel-dev/opteryx-iceberg) lets Opteryx query external Iceberg tables. To plan a query it needs the snapshot's live data files, with each file's per-column bounds turned into the ordinal keys Opteryx prunes with. Until now that came from PyIceberg's `plan_files()`, which reads every manifest through its own Avro reader into Python objects, and then each bound was decoded in Python too.

Now the backend reads the manifest list and the manifests with Rugo, decoding them on a thread pool, one manifest per thread. The bounds - which arrive as Iceberg's single-value binary encoding inside a map - are turned into ordinal keys in C++. PyIceberg is still the catalog client: it reads `metadata.json`, snapshots and schemas, which is the part it's genuinely good at.

Building the opteryx manifest for a snapshot, cold, from local disk:

| Table | PyIceberg | Rugo |
|---|---|---|
| 100 manifests, 300 data files | 56.6 ms | 14.0 ms |
| 1 manifest, 2,000 data files | 101.8 ms | 14.4 ms |

That's per snapshot, and it's in front of every first query against a table.

Speed was the easy part; *sameness* was the work. The new planner makes the decisions PyIceberg's planner makes: drop deleted entries and empty files, inherit sequence numbers from the manifest list, skip delete manifests older than the data, match position deletes to data files by path or partition. The tests compare it against PyIceberg's own planner file by file, across v1 tables, v2 tables, partitioned and unpartitioned ones, and a v1 table upgraded to v2 so one snapshot mixes both manifest versions.

PyIceberg can't write merge-on-read deletes, so the tests write delete manifests with PyIceberg's own manifest writer and commit them as real snapshots - then check the new planner refuses the table exactly when PyIceberg would attach a delete. Each planning rule was broken on purpose to prove a test catches it.

## READ_AVRO: Avro in the engine

Avro is like CSV and JSONL in Opteryx: something you read, not a format you store tables in. So it arrives as a table function:

~~~sql
SELECT Company, COUNT(*)
FROM READ_AVRO('launches/*.avro')
GROUP BY Company;
~~~

It runs natively from the first byte - the scan, the decode and the morsels are all C++, with no Python on the execution path. A glob reads every file with the first file's schema as its reader schema, so files whose schemas have drifted still line up. `COUNT(*)` never decodes a value: Avro block headers carry their row counts.

To see how it holds up, we wrote ClickBench's 100 million rows as 103 deflate-compressed Avro files (14 GB) and ran the 43 queries, against ClickHouse and DuckDB reading the same files:

| Engine | Time for the 43 queries |
|---|---|
| Opteryx | 150 s |
| ClickHouse (`clickhouse local`) | 590 s |
| DuckDB (Avro extension) | ~47-52 s *per query* - stopped after three |

ClickHouse sits at about 13 s on all but one query, including `COUNT(*)`, which we answer in 0.11 s from the block headers. Opteryx is ahead on every one of the 43 queries - 4× at the median - and the closest it came was `SELECT * ... WHERE URL LIKE '%google%'`, where decoding all 105 columns dominated.

So we fixed that one too. When a `WHERE` sits directly on `READ_AVRO`, the scan now decodes only the filter's columns first, runs the filter, and goes back for the other columns only for the rows that survive. That needs a second decompression of the blocks holding survivors, which is cheap when the filter is selective and ruinous when it isn't - so the scan watches how many blocks had survivors and picks two passes or one, batch by batch. That query went from **12.2 s to 3.8 s**; everything else stayed level.

## The honest part

Avro is not an analytics format, and no reader changes that.

The same ClickBench data as Parquet runs about 26× faster in Opteryx. Our Avro floor is about 3 seconds per query, and profiling says why: 61% of it is decompressing deflate blocks, and 35% is walking rows. Avro stores rows, so reading one column still means stepping over every other field of every record, and there are no statistics in the format to skip anything with - no min/max, no indexes. A filter on `CounterID = 62` reads every row in every file.

We tried to dig under that floor. Skipping runs of integers with NEON vector instructions came out 35% *slower* than the plain byte loop - Avro's integers are mostly one to three bytes, too short to amortise the setup - so we dropped it. Checking cheap filters like `SearchPhrase <> ''` mid-row couldn't help either: the rows those filters reject are empty strings, which cost almost nothing to copy anyway.

That's fine. Avro's job is to carry data reliably from the thing that produced it to the thing that stores it. Our job is to make sure that when you need to read it - to plan an Iceberg query, or to look at the events that landed in a bucket last night - it costs as little as the format allows, and doesn't arrive one dictionary at a time.

— Justin
