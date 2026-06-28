---
title: The Last Place Arrow Lived
description: Opteryx now writes Parquet, CSV and JSONL entirely on its own. Removing the final PyArrow dependency wasn't about cleanliness — it was about owning the part of a query engine that decides how fast tomorrow's reads will be.
date: 2026-06-26
author: Justin Joyce
role: Opteryx Engineering
tags:
  - performance
  - storage
  - parquet
  - execution-engine
---

# The Last Place Arrow Lived

## TL;DR

* [Opteryx](https://opteryx.app) no longer calls [PyArrow](https://arrow.apache.org/docs/python/) to write [Parquet](https://parquet.apache.org/). We now write Parquet, CSV and JSONL natively, and a guard test fails the build if PyArrow ever creeps back.
* This wasn't just dependency hygiene. The writer is the first optimiser — the encodings, statistics and filters you write today are the read speed you get tomorrow.
* Owning the write path removed an extra copy and reshaping step. [Dictionary-encoded](https://en.wikipedia.org/wiki/Dictionary_coder) columns flow from memory to disk unchanged. In our validation dataset files shrank to ~85% of their original size; [ZSTD](https://github.com/facebook/zstd) gives ~12× on highly compressible columns.

## The last tenant

Most of Opteryx had been Arrow-free for a long time. Reading, filtering, aggregation and joins all run on our Cython/C++ stack. But writing Parquet was the one place we still called out to PyArrow — a single `write_table` at the end of a query.

It was easy to justify: just one function, one sanctioned exception. But to hand data to PyArrow we had to reshape our native columnar layout into Arrow, and then let Arrow reshape that into Parquet — two translations and an extra copy for data we already held in a good columnar form.

So we built a writer.

## Why we built it

Opteryx's rule is zero installed dependencies — we vendor capability deliberately, and PyArrow is explicitly banned. Keeping it for writes meant we weren't actually living by that rule. But the dependency story was the smaller problem.

The bigger one was control.

A writer isn't a passive serialiser. It is where read performance is decided — which encodings you use, what statistics you record, whether you write [bloom filters](https://en.wikipedia.org/wiki/Bloom_filter), how you lay out pages and row groups. These are knobs between bytes-on-disk and milliseconds-at-query-time. A general-purpose writer gives sensible, interchange-friendly defaults. What it won't give you is a writer designed with your reader, by the same people, for the same workloads.

I feel the right question wasn't "how do we replace PyArrow?" It was: what can we do at write-time that a general-purpose writer structurally won't?

## What we built

We added a Parquet writer to [Rugo](https://rugo.dev) — Opteryx's purpose-built reader/writer for columnar files. It reads our internal column format directly and emits Parquet bytes in a single pass, with no intermediate Arrow table and no extra copy.

One rule governed the whole effort: every file we write must be readable by PyArrow, [Spark](https://spark.apache.org/), [DuckDB](https://duckdb.org/) — anything that reads Parquet. A file only Opteryx could read would be a defect, not a feature. Interoperability is the entire reason the format exists.

Today the writer covers:

* The full type surface: integers, floats, booleans, strings, dates, timestamps, decimals up to 128-bit, intervals, and nested list columns (including lists-of-lists), with nulls correct at every level.
* ZSTD compression as the default — we vendored zstd so the codec is ours, on our terms.
* Column statistics: min, max and null counts written with the exact ordering semantics a reader needs to trust them for skipping.
* Dictionary encoding — the part where owning the format pays off most.
* Bloom filters — laid out so a value written by us probes correctly in any reader.

The [same core](https://docs.opteryx.app/blog/2026-06-05-json-reader) also gave us native CSV and JSONL writers. All three formats now have Arrow-free readers and writers on both sides.

## Where it pays off: writing what we already have

The clearest payoff is dictionary encoding.

Columns with lots of repetition — a country code, a status flag, a category — are wasteful to store as raw values. Parquet's answer is a dictionary: store each distinct value once, then store a small code per row.

During execution, Opteryx already holds many columns in exactly that shape. [Draken (our columnar vector library)](https://docs.opteryx.app/blog/2026-04-17-memory-model) carries dictionary-encoded columns natively — the distinct values are already deduplicated in memory. A general writer doesn't know that. It takes the fully-expanded column, re-hashes every value to rebuild a dictionary, and compresses the result.

Our writer skips all of that. When a column arrives already dictionary-shaped, we write the dictionary straight through — zero re-hashing, because the dedup work was done long ago. For plain columns it can build a dictionary on the fly when the data is repetitive enough and fall back to plain storage when it isn't.

The on-disk format and the in-flight format finally agree, and the conversion tax disappears.

## Two more pieces: bloom filters and sorted dictionaries

Owning the write path also let us close two loops we'd left open.

**Bloom filter pruning at read time.** The writer records bloom filters per column and the scanner now probes them before decoding pages — skipping row groups before any bytes are deserialised. For selective point lookups and high-cardinality equality filters, this means more queries never touch the bytes they would have read previously.

**Sorted dictionary keys, propagated through the engine.** We now sort dictionary keys deterministically and propagate that ordering through Draken into the reader and planner. When key order corresponds to value order, range searches become integer range checks over dictionary codes — and min/max statistics can answer some predicates outright, without decoding a single value. What was a full-value decode pass becomes a cheap integer-range scan, or sometimes no scan at all.

Both changes compound the benefit of writing dictionary-shaped data unchanged. Less decode, less IO, less CPU — and the costs fall at read time, where they matter most.

## What the numbers show

We validated the writer on a real dataset: ~9.67M tweet rows across 49 files (two schema variants). Every file we wrote was checked value-for-value against what PyArrow reads — identical, nulls and all.

A few things stood out:

* Smaller files, for free. Rewritten through our writer, the dataset came out at ~85% of its original size. That's dictionary encoding firing automatically on low-cardinality columns the original files had stored less efficiently.
* ZSTD earns its place. On compressible columns we see ~12× compression.
* No correctness cost. Across all 49 files, every value round-tripped exactly.

I'm deliberately not quoting a single headline speedup number. The real win isn't in the write itself — it's downstream, at read time: files that are cheaper to scan and skip.

## What it unlocks

The immediate result is the one we set out for: Arrow is out of the engine. The dependency story is honest rather than nearly-honest, and there's no longer a format boundary forcing a copy on every write.

The structural result is bigger. We now control what gets written, and that controls how fast it reads back:

* Files that are cheap to filter, by construction. The statistics and bloom filters we write are exactly the metadata the scanner uses to skip whole row groups. Now the writer and the reader's skipping logic are designed together, by us.
* Encoding that matches how we execute. Dictionary-encoded columns in memory stay dictionary-shaped on disk.
* A foundation for moving work to ingest-time. Materialised views, pre-aggregated rollups, repartitioned datasets — anything that does the expensive work once at write so reads stay cheap — needs a writer you trust and can tune. We have one now.

## The broader lesson

It's the same pattern that runs through the [JSONL reader](../blog/2026-06-05-json-reader), the [LIKE work](../blog/2026-04-10-like-improvements) and the Draken rewrite: do only the work the query requires, and decide deliberately where that work happens.

A writer that just serialises is correct everywhere. A writer designed alongside the reader that will later query its output is correct everywhere *and* makes those queries faster. For a long time we let someone else decide what our files looked like. The files were fine. But "fine" was a decision we'd outsourced — and in a query engine, the shape of your files is too close to the shape of your performance to hand away.

— Justin
