---
title: Why Opteryx Is Fast - How the Engine Avoids Work
description: How Opteryx reads less data, keeps columns compact, compiles expressions once and stays native while it runs, with published ClickBench, JSONBench and release-over-release benchmark results.
---

# Why Opteryx Is Fast

Opteryx doesn't get its speed from one big trick. It comes from a single habit applied at every layer of the engine: **don't do work the query doesn't need**. Don't read columns nobody asked for. Don't decode row groups that can't match. Don't compare a string 100 million times when it has 200 distinct values. Don't make the same decision once per row when it can be made once per query.

This page walks through where that habit shows up, then gives the published numbers, with the machine, version and date for each. It ends with where Opteryx *isn't* the fastest option, because that's worth knowing too.

## Read Less

The cheapest byte is the one you never read. Before anything is decoded, Opteryx narrows a scan down in stages. Each stage is described in [Rugo](/docs/reference/internals/rugo), the engine's native file reader:

<figure class="doc-figure">
<svg viewBox="0 0 680 270" width="100%" role="img" aria-labelledby="read-less-title read-less-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="read-less-title">How a scan narrows before decoding</title>
<desc id="read-less-desc">Five stages, each narrower than the last: the dataset on storage; only the columns the query names; only row groups whose statistics could match; only pages whose dictionary holds a match; and finally only the surviving rows, decoded into typed values.</desc>
<rect x="0" y="6" width="680" height="40" rx="5" style="fill: var(--panel-2); stroke: var(--border-2);"/>
<text x="14" y="31" style="fill: var(--text-deep); font-weight: 600;">Dataset on storage</text>
<text x="666" y="31" text-anchor="end" style="fill: var(--muted);">every column, every row group</text>
<rect x="0" y="58" width="500" height="40" rx="5" style="fill: var(--accent-soft); stroke: var(--accent-soft-3);"/>
<text x="14" y="83" style="fill: var(--text-deep); font-weight: 600;">Projection</text>
<text x="486" y="83" text-anchor="end" style="fill: var(--muted);">only the columns the query names</text>
<rect x="0" y="110" width="360" height="40" rx="5" style="fill: var(--accent-soft-2); stroke: var(--accent-soft-3);"/>
<text x="14" y="135" style="fill: var(--text-deep); font-weight: 600;">Row-group pruning</text>
<text x="346" y="135" text-anchor="end" style="fill: var(--muted);">min/max, bloom filters</text>
<rect x="0" y="162" width="250" height="40" rx="5" style="fill: var(--accent-soft-3); stroke: var(--accent-soft-3);"/>
<text x="14" y="187" style="fill: var(--text-deep); font-weight: 600;">Dictionary skipping</text>
<rect x="0" y="214" width="150" height="40" rx="5" style="fill: var(--opteryx-teal);"/>
<text x="14" y="239" style="fill: var(--on-accent); font-weight: 600;">Decode survivors</text>
<text x="166" y="239" style="fill: var(--muted);">typed values built last, for what's left</text>
</svg>
<figcaption>Each stage only reads what the previous one couldn't rule out. The widths are illustrative; how much each stage removes depends on the query and the data.</figcaption>
</figure>

- **Projection.** Only the columns a query references are decoded. The others are never read from disk.
- **Row-group pruning.** Parquet keeps min/max statistics for every row group. If a row group's range proves it holds no matching row, it's skipped without decoding a single value. For `=` and `IN`, which min/max handles poorly, Rugo also checks bloom filters where the file has them. Pruning fails open: if a statistic is missing, the row group is read rather than wrongly skipped.
- **Dictionary skipping.** A dictionary-encoded column carries a small table of its distinct values. Rugo tests the predicate against that table first. If no entry matches, the column's data pages are never decoded.
- **Materialise last.** Projection and filtering happen *before* bytes are turned into typed values. The expensive step runs on the smallest amount of data the query allows.

The optimizer feeds all of this. Predicate and projection pushdown move filters and column lists as close to the scan as they'll go, so the reader knows exactly what it may skip. See [How Opteryx Plans and Runs a Query](/docs/reference/internals/engine-overview#optimizer).

## Keep Data Compact

Once data is in memory, Opteryx keeps the structure the file already had instead of flattening it. Columns live in [Draken](/docs/reference/internals/draken) vectors, which come in three shapes: dense, dictionary and constant.

A dictionary column stores each distinct value once, plus a small integer code per row. That saves memory, but it saves even more *work*:

<figure class="doc-figure">
<svg viewBox="0 0 680 200" width="100%" role="img" aria-labelledby="dict-title dict-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="dict-title">Evaluating country = 'AU' on a dictionary column</title>
<desc id="dict-desc">The predicate is tested once against each of four dictionary entries, numbered 0 to 3: AU, GB, NZ and US, producing a four-entry match table: yes, no, no, no. Each row stores only a code, and that code is looked up in the table, and rows with code 0 match. The per-row work is a table lookup, not a string comparison.</desc>
<text x="0" y="16" style="fill: var(--muted); font-size: 12px;">1. Test each distinct value once</text>
<g style="font-family: var(--font-mono);">
<rect x="0" y="28" width="56" height="30" rx="4" style="fill: var(--accent-soft-2); stroke: var(--opteryx-teal);"/><text x="28" y="48" text-anchor="middle" style="fill: var(--text-deep);"><tspan style="fill: var(--muted); font-size: 11px;">0 </tspan>AU</text>
<rect x="62" y="28" width="56" height="30" rx="4" style="fill: var(--panel-2); stroke: var(--border-2);"/><text x="90" y="48" text-anchor="middle" style="fill: var(--text);"><tspan style="fill: var(--muted); font-size: 11px;">1 </tspan>GB</text>
<rect x="124" y="28" width="56" height="30" rx="4" style="fill: var(--panel-2); stroke: var(--border-2);"/><text x="152" y="48" text-anchor="middle" style="fill: var(--text);"><tspan style="fill: var(--muted); font-size: 11px;">2 </tspan>NZ</text>
<rect x="186" y="28" width="56" height="30" rx="4" style="fill: var(--panel-2); stroke: var(--border-2);"/><text x="214" y="48" text-anchor="middle" style="fill: var(--text);"><tspan style="fill: var(--muted); font-size: 11px;">3 </tspan>US</text>
<text x="28" y="78" text-anchor="middle" style="fill: var(--opteryx-teal); font-weight: 700;">✓</text>
<text x="90" y="78" text-anchor="middle" style="fill: var(--muted-2);">✗</text>
<text x="152" y="78" text-anchor="middle" style="fill: var(--muted-2);">✗</text>
<text x="214" y="78" text-anchor="middle" style="fill: var(--muted-2);">✗</text>
</g>
<text x="270" y="16" style="fill: var(--muted); font-size: 12px;">2. Each row is a lookup into that table, not a string compare</text>
<g style="font-family: var(--font-mono);">
<text x="270" y="48" style="fill: var(--muted);">code</text>
<text x="270" y="78" style="fill: var(--muted);">match</text>
<text x="330" y="48" text-anchor="middle" style="fill: var(--text);">2</text>
<text x="330" y="78" text-anchor="middle" style="fill: var(--muted-2);">✗</text>
<text x="360" y="48" text-anchor="middle" style="fill: var(--text);">0</text>
<text x="360" y="78" text-anchor="middle" style="fill: var(--opteryx-teal); font-weight: 700;">✓</text>
<text x="390" y="48" text-anchor="middle" style="fill: var(--text);">3</text>
<text x="390" y="78" text-anchor="middle" style="fill: var(--muted-2);">✗</text>
<text x="420" y="48" text-anchor="middle" style="fill: var(--text);">0</text>
<text x="420" y="78" text-anchor="middle" style="fill: var(--opteryx-teal); font-weight: 700;">✓</text>
<text x="450" y="48" text-anchor="middle" style="fill: var(--text);">1</text>
<text x="450" y="78" text-anchor="middle" style="fill: var(--muted-2);">✗</text>
<text x="480" y="48" text-anchor="middle" style="fill: var(--text);">0</text>
<text x="480" y="78" text-anchor="middle" style="fill: var(--opteryx-teal); font-weight: 700;">✓</text>
<text x="510" y="48" text-anchor="middle" style="fill: var(--text);">0</text>
<text x="510" y="78" text-anchor="middle" style="fill: var(--opteryx-teal); font-weight: 700;">✓</text>
<text x="540" y="48" text-anchor="middle" style="fill: var(--text);">2</text>
<text x="540" y="78" text-anchor="middle" style="fill: var(--muted-2);">✗</text>
<text x="570" y="48" text-anchor="middle" style="fill: var(--text);">3</text>
<text x="570" y="78" text-anchor="middle" style="fill: var(--muted-2);">✗</text>
<text x="600" y="48" text-anchor="middle" style="fill: var(--text);">1</text>
<text x="600" y="78" text-anchor="middle" style="fill: var(--muted-2);">✗</text>
<text x="630" y="48" text-anchor="middle" style="fill: var(--muted);">…</text>
</g>
<line x1="0" y1="110" x2="680" y2="110" style="stroke: var(--border);"/>
<text x="0" y="140" style="fill: var(--text-deep); font-weight: 600;">Work scales with distinct values, not rows.</text>
<text x="0" y="164" style="fill: var(--muted);">100 million rows with 200 countries: 200 string comparisons, then 100 million table lookups.</text>
<text x="0" y="186" style="fill: var(--muted);">Parquet's dictionary pages map straight onto this shape, so nothing is expanded on read.</text>
</svg>
<figcaption>A predicate on a dictionary column, after <a href="/docs/reference/internals/draken-vector-encoding">How Draken Stores Column Data</a>.</figcaption>
</figure>

A **constant** shape goes further: a literal in `WHERE region = 'APAC'`, or a page where every value is the same, is stored once with a row count. Reading it costs the same for any number of rows.

Strings get their own layout. Every value takes a fixed 16-byte slot. Strings of 12 bytes or fewer, which covers most identifiers, codes and categories, sit entirely inside the slot. Longer strings keep their length and first four bytes there. Equality is usually settled by a single 64-bit compare, and ordering by a 4-byte prefix compare, without touching the string bytes at all. See [How Draken Stores Strings](/docs/reference/internals/draken-german-strings).

## Decide Once, Then Run

Expressions such as `price * quantity`, `a > 10 AND b LIKE 'x%'` or a `CASE` are compiled by the [bytecode engine](/docs/reference/internals/bytecode-engine) **once, while the query is planned**, not per row and not per batch:

- Each literal becomes a constant vector once, rather than a value created per row.
- Each operation is bound to a native function pointer up front, so running it is a direct call rather than a name lookup.
- Temporary results come from a per-batch memory arena that's freed in one go, so there are no per-row objects to clean up.

By the time data flows, every decision has already been made. The data path just runs.

## Stay Native While It Runs

Planning is Python; execution is native. The handover happens once, when the physical plan is built, and the executor never calls back into Python to decide anything. Data moves through the operators in **morsels**, batches of columnar vectors, so each operator handles a batch in one pass instead of once per row.

The native scheduler runs operators across worker threads **with Python's interpreter lock released**, so execution isn't held up by Python. Reading is part of the same pipeline: Rugo fetches byte ranges on worker threads while other threads decode, so waiting for one row group overlaps with work on another. See [Execution Model](/docs/core-concepts/execution-model).

## Start Instantly

Speed also means not having to wait before the first query.

- **No load step.** Opteryx queries Parquet, JSONL and CSV where they already are. Its ClickBench entry records a load time of zero, and its JSONBench entry reads the published files directly with no schema and no index.
- **No cluster.** It's one process. Embedded, that process is yours. Hosted at [opteryx.app](https://opteryx.app), there's nothing to provision or size.
- **A small footprint.** Rugo, the file reader underneath, installs at 11.6 MB with no dependencies and imports in 30 ms. PyArrow is 153.7 MB and 88 ms, Polars 213.8 MB and 186 ms ([rugo.dev](https://rugo.dev), Debian 12 x86_64, CPython 3.12, measured 14 August 2026).

## Reading Less Costs Less

On the hosted service, the **data queried** part of the bill is the data a query actually reads ([Cost Model](/docs/core-concepts/cost-model)). Each technique under *Read Less* that skips a column, row group or page therefore lowers what that query costs as well as how long it takes. Studio shows the bytes scanned under each result, so you can see the effect query by query.

## The Numbers

Benchmarks deserve scepticism, including ours. [Benchmarking](/docs/reference/internals/benchmarking) explains what we run, how it's measured, and what the numbers don't tell you. Every figure below links to its source, so you can check it and rerun it.

### ClickBench

[ClickBench](https://benchmark.clickhouse.com/) runs 43 analytical queries over a 100-million-row web-analytics table. The Opteryx entry is in the [ClickBench repository](https://github.com/ClickHouse/ClickBench/tree/main/opteryx) and reads the partitioned Parquet files directly. On ClickBench's reference machine:

| Measure | Opteryx 0.9.155, c6a.4xlarge, 4 October 2026 |
| --- | --- |
| Queries completed | 43 of 43 |
| Load time | 0 s (queries the Parquet files where they are) |
| Total, first run of each query (cold) | 144.1 s |
| Total, best warm run of each query | 41.3 s |

"Cold" here is strict. Before the first run of every query, the harness restarts the process and drops the operating system's page cache.

**Opteryx isn't the fastest entry.** On the same machine, ClickHouse, DuckDB and DataFusion reading the same Parquet files are faster on warm runs, and DuckDB is faster cold. Use [the live comparison](https://benchmark.clickhouse.com/) to see where Opteryx lands for the machine and engines you care about.

### Release Over Release

[Wrenchy Bench](https://mabel-dev.github.io/wrenchy-bench/) reruns the suites release over release, on AWS Graviton4 with 16 CPUs, to catch regressions and track progress. As of engine 0.9.155 on 4 October 2026, across 48 recorded runs:

| Suite | Slowest recorded run | Latest run |
| --- | --- | --- |
| ClickBench (Parquet) | 29.44 s | 15.41 s |
| JOB, 113 join-heavy queries | 23.02 s | 16.30 s |
| TPC-H SF10 | 9.12 s | 4.69 s |
| TPC-H SF100 | 67.30 s | 48.09 s |
| Whole suite | 183.68 s | 121.69 s |

The same harness also runs ClickBench against [Skene](/docs/reference/internals/skene), the engine's own file format, in 10.89 s. Skene is still a draft format, so treat that figure as a preview.

### JSONBench

[JSONBench](https://github.com/ClickHouse/JSONBench) queries Bluesky event data stored as JSON. Opteryx reads the NDJSON files directly, with no load step, schema or index. The entry is [awaiting review](https://github.com/ClickHouse/JSONBench/pull/135); these figures are from that submission (opteryx-core 0.9.153, m6i.8xlarge):

| Documents | Warm, sum of 5 queries | Cold, sum of 5 queries |
| --- | --- | --- |
| 1 million | 1.38 s | 15.8 s |
| 10 million | 2.50 s | 183.0 s |
| 100 million | 13.76 s | 1,822.7 s |

The cold runs are limited by the benchmark's disk (a default gp3 volume, 125 MB/s), not by the engine. Nothing is loaded or cached ahead of time, so a cold query reads every byte from storage.

## Where It Isn't Fast

Knowing the limits matters as much as the numbers:

- **One machine.** Opteryx scales up, not out. There's no distributed execution, so a working set bigger than one machine can handle needs a different engine. See [Known Limits](/docs/roadmap-guarantees/known-limits).
- **Cold reads are bound by storage.** Because there's no load step, the first query over files on slow storage runs at the speed of that storage. Pruning helps exactly as much as the files' statistics allow.
- **Files without statistics or dictionaries prune less.** Row-group and dictionary skipping depend on what the writer put in the file. A Parquet file with no min/max statistics, or a CSV, has to be read in full.

[When to Use Opteryx](when-to-use) covers where it fits, and where something else will serve you better.

## Related

- [How Opteryx Plans and Runs a Query](/docs/reference/internals/engine-overview)
- [Rugo: the file engine](/docs/reference/internals/rugo)
- [Draken: the vector library](/docs/reference/internals/draken)
- [The bytecode expression engine](/docs/reference/internals/bytecode-engine)
- [Benchmarking](/docs/reference/internals/benchmarking)
