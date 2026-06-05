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
* The gains grow with selectivity: ~1.5× faster at 10%-pass filters, up to ~4.6× at 0.1%-pass.
* JSONL isn't Opteryx's primary format — Parquet is. This reader exists because structured logs and event streams arrive as JSONL, and those workloads are exactly where pushdown pays most.

---

## The problem with reading everything

JSONL is appealing. One JSON object per line, no schema negotiation, easy to produce.

The usual approach — like in PyArrow's `read_json` and most alternatives — is to parse every field of every row into a table, then filter it.

That's sensible for interchange. It's expensive for queries.

A typical log query doesn't want the whole document:

~~~sql
SELECT request_id, status_code
FROM logs
WHERE status_code >= 500
~~~

Here, parsing `user_agent`, `response_time`, `referrer`, and twenty other fields per row is pure waste. The query never sees them.

The more selective the filter, the worse that compounds.

---

## Why we built it

We've removed PyArrow from Opteryx entirely. I've written about this before — PyArrow was the right starting point, but it became a ceiling.

When it came time to replace the JSONL reader, we had a choice. We could build something that just worked performance, or we could build something that aligned to our specific situation where it counts.

I feel the right question wasn't "how do we replace PyArrow" — it was "what can we do that PyArrow structurally can't?"

The answer is pushdown. PyArrow's `read_json` always parses all columns of all rows. That's not a bug — it's a design choice optimised for general interchange, and to be fair - it's very good at that. But a query engine isn't doing general interchange. It's running selective queries, and it knows exactly which columns and rows it needs before it starts reading.

Build the reader around that, and the performance profile inverts.

---

## The design: positions first, values later

The reader works in three phases, and the expensive one is deliberately last.

**Structural scan.** A SIMD pass over the raw bytes locates every structural character — `{ } : , " \n`. No values are read. This pass is content-blind and crazy fast.

**Document map.** A small state machine over those positions builds `FieldSpans` — byte ranges: *"column X lives from offset A to B."* Still no parsing. Just coordinates.

**Materialise.** For the rows and columns that survive projection and filtering, we now parse bytes into typed vectors.

Finding *where* a value sits is cheap. *Parsing* it is not.

So we defer parsing as long as possible.

---

## Pushdown into the scan

The structural edge over a conventional parser is that the query's projection and predicate go into the document-map phase — not after it.

For `SELECT a, b WHERE c > k`:

- **Only wanted columns are mapped.** Projected columns plus predicate columns. Everything else is ignored.
- **Skip-to-newline.** Once all wanted columns in a record are located, we jump straight to the next line rather than walking the rest of it.
- **Inline filter.** The predicate evaluates the moment the filter column is found. If a row fails, it's dropped right there — it never reaches its other columns.
- **Materialise survivors only.** Typed parsing runs only on rows that passed the filter.

PyArrow doesn't do any of this. We skip. That's why our advantage grows with selectivity — the more rows the filter rejects, the more work we never do.

---

## One trick

**Location prediction.** JSONL files are usually homogeneous — same keys, same order, same types across rows. The reader learns a file's structure and predicts each column's position in subsequent rows.

It jumps straight to the predicted offset, verifies with a `memcmp`, and falls back to a scan only on a miss.

Homogeneity means the prediction almost always hits.

---

## What the benchmarks show

Speedup vs PyArrow across table width and filter selectivity:

| Query | Skinny (3 cols) | Medium (8 cols) | Wide (25 cols) |
|---|---|---|---|
| `SELECT *` | 0.61× | 0.76× | 0.49× |
| `SELECT first_col` | 0.93× | 1.38× | 1.33× |
| `SELECT last_col` | 0.69× | 1.21× | 1.21× |
| `WHERE id < 90%` | 0.59× | 1.20× | 1.35× |
| `WHERE id < 10%` | 1.53× | 2.46× | 2.87× |
| `WHERE id < 1%` | 3.68× | 4.25× | 4.32× |
| `WHERE id < 0.1%` | 4.24× | 4.60× | 4.37× |

Two clean stories, and they point in opposite directions.

**`SELECT *` — we lose, and worse as tables widen.** 0.49× on 25 columns. This is PyArrow's home turf. Bulk parsing is what it's optimised for, and our per-column materialise pass compounds with width. That's the next thing to fix.

**Selective filters — the win scales cleanly and holds across width.** From near break-even at 90%-pass to ~4.3–4.6× at 0.1%-pass. The absolute time for highly selective queries is nearly flat — around 7–13 ms regardless of how many rows pass — because we materialise only survivors. The floor is the scan, not the data volume.

**Projection alone is width-dependent.** On a skinny table there's little to skip. On medium and wide tables, 1.2–1.4× is consistent.

---

## The honest trade-off

`SELECT *` on wide tables is slower. About 0.5× on 25 columns. I'm not going to pretend otherwise.

If you're dumping full documents with no filtering, this isn't the right tool for that.

But that's not what a query engine does. Full-document reads are the exception. Selective queries are the rule.

The design decision was deliberate: build pushdown in from the start, accept the `SELECT *` cost, and be significantly faster on everything a query engine actually runs.

I feel that's the right trade-off — and the benchmarks bear it out.

Structured logs often land as JSONL and are queried with tight filters — error codes, time ranges, specific request IDs. That's exactly the workload this reader was built for.

---

## How it works under the hood

The reader is parallel and zero-copy. The file is read once into a shared, read-only buffer. That buffer is split into newline-aligned ranges, each scanned and mapped on a thread pool.

Because `FieldSpan` positions are absolute offsets into the shared buffer, no data is copied between threads. Records are merged in order, then columns are built in parallel.

Type parsing is speculative but safe: try int64, widen to float64, fall back to string. The prediction — both field location and type — is never load-bearing for correctness. A miss just means a bit more work, never a wrong answer.

The Python layer is orchestration only. The data path is C++/Cython end to end.

---

## The broader lesson

This is the same pattern that runs through the LIKE improvements, the aggregation work, and the Draken rewrite.

Do only the work the query requires. Defer the expensive step until you know it's necessary.

A format reader that parses everything is correct everywhere. One that pushes the query's constraints into the read path is correct everywhere *and* faster where it matters.

For JSONL log queries, that's the difference that counts.

— Justin
