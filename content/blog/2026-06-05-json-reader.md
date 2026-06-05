---
title: A JSONL Reader That Only Reads What You Ask For
description: How Opteryx's new JSONL reader pushes projections and filters into the document scan itself, and why that changes the cost profile for log queries.
date: 2026-06-05
author: Justin Joyce
role: Opteryx Engineering
tags:
  - performance
  - storage
  - json
  - execution-engine
---

# A JSONL Reader That Only Reads What You Ask For

## TL;DR

* Most readers parse every field of every row and hand you a table. Ours finds where values sit, applies your `WHERE` clause and column list whilst scanning, and only parses what survives.
* The gains grow with selectivity and table width: on wide tables, projections run 2–7× faster and tight filters up to ~7×. `SELECT *` is competitive too — ahead on narrow and very wide schemas.
* [JSONL](https://jsonlines.org/) isn't [Opteryx's](https://opteryx.app) primary format — [Parquet](https://parquet.apache.org/) is. This reader exists because structured logs and event streams arrive as JSONL, and those workloads are exactly where pushdown pays most.

## The problem with reading everything

JSONL is appealing. One JSON object per line, no schema negotiation, easy to produce.

The usual approach — like in [PyArrow's](https://arrow.apache.org/) `read_json` and most alternatives — is to parse every field of every row into a table, then filter it.

That's sensible for interchange. It's expensive for queries.

A typical log query doesn't want the whole document:

~~~sql
SELECT request_id, status_code
FROM logs
WHERE status_code >= 500
~~~

Here, parsing `user_agent`, `response_time`, `referrer`, and twenty other fields per row is pure waste. The query never sees them.

The more selective the filter, the worse that compounds.

## Why we built it

We've removed PyArrow from Opteryx entirely. I've written about this before — PyArrow was the right starting point, but it became a ceiling.

When it came time to replace the JSONL reader, we had a choice. We could build something that just worked, or we could build something that aligned to our specific situation where it counts.

I feel the right question wasn't "how do we replace PyArrow" — it was "what can we do that PyArrow structurally can't?"

The answer is pushdown. PyArrow's `read_json` always parses all columns of all rows. That's not a bug — it's a design choice optimised for general interchange, and to be fair - it's very good at that. But a query engine isn't doing general interchange. It's running selective queries, and it knows exactly which columns and rows it needs before it starts reading.

Build the reader around that, and the performance profile inverts.

## The design: positions first, values later

The reader works in three phases, and the expensive one is deliberately last.

**Structural scan.** A SIMD pass over the raw bytes locates every structural character — `{ } [ ] : , " \ \n`. No values are read. This pass is content-blind and crazy fast.

**Document map.** A small state machine over those positions builds a `FieldSpan` per field: the byte range of its **key** *and* the byte range of its **value**, plus where it sits in the record. Still no parsing — *"the key is at bytes A–B, its value at C–D."* Just coordinates. (Arrays and objects are kept whole here, tracking bracket depth so a comma inside `[1, 2, 3]` doesn't cut the value short.)

**Materialise.** For the rows and columns that survive projection and filtering, we now parse bytes into typed vectors.

Finding *where* a value sits is cheap. *Parsing* it is not.

So we defer parsing as long as possible.

## Pushdown into the scan

The structural edge over a conventional parser is that the query's projection and predicate go into the document-map phase — not after it.

For `SELECT a, b WHERE c > k`:

- **Only wanted columns are mapped.** Projected columns plus predicate columns. Everything else is ignored.
- **Skip-to-newline.** Once all wanted columns in a record are located, we jump straight to the next line rather than walking the rest of it.
- **Inline filter.** The predicate evaluates the moment the filter column is found. If a row fails, it's dropped right there — it never reaches its other columns.
- **Materialise survivors only.** Typed parsing runs only on rows that passed the filter.

PyArrow doesn't do any of this. We skip. That's why our advantage grows with selectivity — the more rows the filter rejects, the more work we never do.

## One trick

**Location prediction.** JSONL files are usually homogeneous — same keys, same order, same types across rows. The reader learns a file's structure and predicts each column's position in subsequent rows.

It jumps straight to the predicted offset, verifies with a `memcmp`, and falls back to a scan only on a miss.

Homogeneity means the prediction almost always hits.

## What the benchmarks show

Speedup vs PyArrow across table width and filter selectivity (>1× = faster):

| Query | Skinny (3 cols) | Medium (8 cols) | Wide (25 cols) | Wide (100 cols) |
|---|---|---|---|---|
| `SELECT *` | 1.2× | 1.0× | 0.8× | 1.5× |
| `SELECT first_col` | 1.4× | 1.5× | 1.9× | 6.8× |
| `SELECT last_col` | 0.9× | 0.9× | 1.3× | 4.9× |
| `WHERE id < 90%` | 0.7× | 0.5× | 0.5× | 0.6× |
| `WHERE id < 10%` | 1.2× | 1.0× | 0.7× | 0.6× |
| `WHERE id < 1%` | 1.3× | 1.5× | 2.0× | 2.7× |
| `WHERE id < 0.1%` | 1.3× | 1.6× | 2.3× | 7.3× |

The 100-column case is the one to watch: real log and event data is wide, and width is where this design pays off hardest.

**Projection scales with width.** Pull one column from a 3-column row and there's little to skip (~1.4×); pull one from a 100-column row and you skip the other 99 — ~7×. The wider the record, the more parsing we never do.

**Selective filters have to actually be selective.** At loose filters — 90%-pass, or 10%-pass on a wide table — most rows survive, there's little to skip, and we sit around parity or slightly behind. As the filter tightens the wins arrive and compound with width: by 1%-pass we're ahead everywhere, reaching ~7× at 0.1%-pass on wide tables. Two effects stack — fewer survivors to materialise, and more columns skipped per rejected row.

**`SELECT *` is now competitive.** This used to be a clean loss — bulk parsing is exactly what PyArrow is built for. Rebuilding the document map as one contiguous arena, instead of an allocation per row, closed the gap: we're now ahead on narrow and very wide schemas, at parity on medium, and only a little behind (~0.8×) in the 25-column middle. We don't *win* indiscriminate reads, but we no longer collapse on them.

## The honest trade-off

There's still a shape to where this wins.

A query that keeps most rows and reads most columns gives the reader nothing to skip — and skipping is the whole point. On indiscriminate reads we're roughly level with PyArrow: ahead on narrow and very wide schemas, a little behind at middle widths. PyArrow's bulk parser is genuinely excellent at that, and I'm not going to pretend we beat it by doing the same work differently.

But indiscriminate reads aren't what a query engine spends its time on. It runs selective filters and narrow projections, and it knows what it needs before it reads. The more selective the query — and the wider the table — the further ahead we pull, up to ~7× on the wide, tightly-filtered log queries this was built for.

The design decision was to optimise for that case from the start. Earlier, it came at a real `SELECT *` cost; closing that — without giving up any of the selective-query wins — came down to not allocating memory we never needed.

I feel that's the right trade-off — and the benchmarks bear it out.

Structured logs often land as JSONL and are queried with tight filters — error codes, time ranges, specific request IDs. That's exactly the workload this reader was built for.

## How it works under the hood

The reader is parallel and zero-copy. The file is read once into a shared, read-only buffer. That buffer is split into newline-aligned ranges, each scanned and mapped on a thread pool.

Because `FieldSpan` positions are absolute offsets into the shared buffer, no data is copied between threads. Records are merged in order, then columns are built in parallel.

The map itself is a single contiguous arena — every field of every record in one buffer, addressed by per-record offsets — not a separate allocation per row. On millions of narrow records that difference dominates the build, and it's what brought `SELECT *` back to parity.

Type parsing is speculative but safe: try int64, widen to float64, fall back to string. The prediction — both field location and type — is never load-bearing for correctness. A miss just means a bit more work, never a wrong answer.

The Python layer is orchestration only. The data path is C++/Cython end to end.

## The broader lesson

This is the same pattern that runs through the LIKE improvements, the aggregation work, and the Draken rewrite.

Do only the work the query requires. Defer the expensive step until you know it's necessary.

A format reader that parses everything is correct everywhere. One that pushes the query's constraints into the read path is correct everywhere *and* faster where it matters.

For JSONL log queries, that's the difference that counts.

— Justin
