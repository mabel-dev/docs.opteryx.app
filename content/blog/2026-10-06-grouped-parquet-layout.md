---
title: One Number, Two Jobs
description: Row-group size in Parquet was doing two jobs for Opteryx - setting how many requests we make to object storage, and setting the size of every morsel the engine works on. We changed the file layout so the two can be set separately.
date: 2026-10-06
author: Justin Joyce
role: Opteryx Engineering
tags:
  - performance
  - storage
  - parquet
  - rugo
---

# One Number, Two Jobs

## TL;DR

* Opteryx used to write [Parquet](https://parquet.apache.org/) row groups of about 256k rows. That size was picked so reads from object storage needed fewer range requests. It also set the morsel size, the unit of work the engine handles, and on TPC-H, 256k is not the best morsel size.
* Writing smaller row groups the normal way makes remote reads worse. Every projected column costs one range GET per row group, so 64k row groups mean about **3.6× the requests**.
* We changed how [Rugo](https://rugo.dev) lays files out. Row groups are now 64k rows, written in **blocks of four**. Inside a block, each column's four chunks sit next to each other, so the reader fetches 256k rows of a column in one range. On the ClickBench query set that's **5.8% fewer GETs than before**, and the morsels are a quarter of the size.
* The files are still standard Parquet. PyArrow, DuckDB, Polars, Rugo and Opteryx all read them and return the same values.

## The number that was doing two jobs

In a Parquet file, the row group is the basic unit. Each column in a row group is stored as one contiguous **column chunk**. The footer records min/max statistics for every chunk, and the reader uses those to decide whether it needs the chunk at all.

In Opteryx, the row group is also the **morsel**: the batch of rows that a worker picks up, decodes and pushes through the query plan. One row group turns into one morsel.

So one write-time setting controlled two separate things:

1. **The IO cost.** The remote reader turns each row group into one work item and merges range requests only *within* that row group. Bigger row groups mean fewer, larger GETs against GCS or S3.
2. **The engine cost.** A row group's size is the morsel's size. That decides how well the working set fits in CPU cache, how often we pay per-morsel dispatch overhead, and how evenly work spreads across workers.

We'd set it to 256k for the first reason. Back in July, Rugo's default was 262,144 rows. That's a good size for object storage, but we didn't know whether it was a good size for the engine.

## What size does the engine want?

We measured it. We rewrote TPC-H SF1 and SF10 at 8k, 16k, 32k, 64k and 256k rows per row group and kept the source file boundaries. Then we ran all 22 queries with the arms interleaved and their order rotated each round. Results were identical across every size.

<figure class="doc-figure">
<svg viewBox="0 0 680 258" width="100%" role="img" aria-labelledby="morsel-size-title morsel-size-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="morsel-size-title">TPC-H wall time by row-group size, relative to 64k</title>
<desc id="morsel-size-desc">Line chart of TPC-H wall time with 14 workers, as percent slower than 64k-row row groups, for row-group sizes 8k, 16k, 32k, 64k and 256k. SF1: 58.1%, 18.5%, 4.6%, 0 (715 ms), 4.7%. SF10: 101.1%, 33.4%, 7.6%, 0 (4,726 ms), 0.3%. Both curves bottom out at 64k.</desc>
<line x1="60" y1="214.0" x2="600" y2="214.0" style="stroke: var(--border); stroke-width: 1;"/>
<text x="52.0" y="218.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">0</text>
<line x1="60" y1="170.8" x2="600" y2="170.8" style="stroke: var(--border); stroke-width: 1;"/>
<text x="52.0" y="174.8" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">+25%</text>
<line x1="60" y1="127.6" x2="600" y2="127.6" style="stroke: var(--border); stroke-width: 1;"/>
<text x="52.0" y="131.6" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">+50%</text>
<line x1="60" y1="84.5" x2="600" y2="84.5" style="stroke: var(--border); stroke-width: 1;"/>
<text x="52.0" y="88.5" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">+75%</text>
<line x1="60" y1="41.3" x2="600" y2="41.3" style="stroke: var(--border); stroke-width: 1;"/>
<text x="52.0" y="45.3" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">+100%</text>
<line x1="60" y1="214" x2="600" y2="214" style="stroke: var(--border-2); stroke-width: 1;"/>
<text x="60.0" y="238.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">8k</text>
<text x="195.0" y="238.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">16k</text>
<text x="330.0" y="238.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">32k</text>
<text x="465.0" y="238.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 11px; font-weight: 600; font-family: var(--font-body);">64k</text>
<text x="600.0" y="238.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">256k</text>
<text x="330.0" y="256.0" text-anchor="middle" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">rows per row group (= morsel size)</text>
<polyline points="60.0,39.4 195.0,156.3 330.0,200.9 465.0,214.0 600.0,213.5" style="fill: none; stroke: var(--opteryx-navy); stroke-width: 2.25;"/>
<circle cx="60.0" cy="39.4" r="3.5" style="fill: var(--opteryx-navy); stroke: var(--bg); stroke-width: 1.5;"/>
<circle cx="195.0" cy="156.3" r="3.5" style="fill: var(--opteryx-navy); stroke: var(--bg); stroke-width: 1.5;"/>
<circle cx="330.0" cy="200.9" r="3.5" style="fill: var(--opteryx-navy); stroke: var(--bg); stroke-width: 1.5;"/>
<circle cx="465.0" cy="214.0" r="3.5" style="fill: var(--opteryx-navy); stroke: var(--bg); stroke-width: 1.5;"/>
<circle cx="600.0" cy="213.5" r="3.5" style="fill: var(--opteryx-navy); stroke: var(--bg); stroke-width: 1.5;"/>
<polyline points="60.0,113.6 195.0,182.0 330.0,206.1 465.0,214.0 600.0,205.9" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 2.25;"/>
<circle cx="60.0" cy="113.6" r="3.5" style="fill: var(--opteryx-teal); stroke: var(--bg); stroke-width: 1.5;"/>
<circle cx="195.0" cy="182.0" r="3.5" style="fill: var(--opteryx-teal); stroke: var(--bg); stroke-width: 1.5;"/>
<circle cx="330.0" cy="206.1" r="3.5" style="fill: var(--opteryx-teal); stroke: var(--bg); stroke-width: 1.5;"/>
<circle cx="465.0" cy="214.0" r="3.5" style="fill: var(--opteryx-teal); stroke: var(--bg); stroke-width: 1.5;"/>
<circle cx="600.0" cy="205.9" r="3.5" style="fill: var(--opteryx-teal); stroke: var(--bg); stroke-width: 1.5;"/>
<text x="70.0" y="33.4" text-anchor="start" style="fill: var(--opteryx-navy); font-size: 11px; font-weight: 600; font-family: var(--font-body);">+101%</text>
<text x="203.0" y="148.3" text-anchor="start" style="fill: var(--opteryx-navy); font-size: 11px; font-weight: 600; font-family: var(--font-body);">+33%</text>
<text x="330.0" y="190.9" text-anchor="middle" style="fill: var(--opteryx-navy); font-size: 11px; font-weight: 600; font-family: var(--font-body);">+8%</text>
<text x="610.0" y="223.5" text-anchor="start" style="fill: var(--opteryx-navy); font-size: 11px; font-weight: 600; font-family: var(--font-body);">+0.3%</text>
<text x="70.0" y="117.6" text-anchor="start" style="fill: var(--opteryx-teal); font-size: 11px; font-weight: 600; font-family: var(--font-body);">+58%</text>
<text x="203.0" y="194.0" text-anchor="start" style="fill: var(--opteryx-teal); font-size: 11px; font-weight: 600; font-family: var(--font-body);">+19%</text>
<text x="322.0" y="222.1" text-anchor="end" style="fill: var(--opteryx-teal); font-size: 11px; font-weight: 600; font-family: var(--font-body);">+5%</text>
<text x="610.0" y="201.9" text-anchor="start" style="fill: var(--opteryx-teal); font-size: 11px; font-weight: 600; font-family: var(--font-body);">+4.7%</text>
<text x="124.0" y="59.4" text-anchor="start" style="fill: var(--opteryx-navy); font-size: 12px; font-weight: 700; font-family: var(--font-body);">SF10</text>
<text x="106.0" y="131.6" text-anchor="start" style="fill: var(--opteryx-teal); font-size: 12px; font-weight: 700; font-family: var(--font-body);">SF1</text>
<circle cx="465.0" cy="214" r="6" style="fill: none; stroke: var(--text-deep); stroke-width: 1.5;"/>
<text x="465.0" y="200.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">fastest</text>
</svg>
<figcaption>TPC-H wall time with 14 workers, sum over the 22 queries of each query's fastest run, relative to 64k (715 ms at SF1, 4,726 ms at SF10). The sizes double each step except the last, which is four times 64k.</figcaption>
</figure>

64k was fastest in every round of every run. Below 32k, per-morsel overhead dominates. The extra dispatching costs more than the better cache use saves. At 256k we lose a few percent on SF1 and break even on SF10.

The per-operator breakdown explains it. Aggregation is fastest at 32k on both scales and 3–8% slower at 256k, which is a cache effect. Scans are fastest at 64k. Inner joins are the one operator that likes big morsels: at SF10 on a single worker, joins ran 9% faster at 256k. The total still favours 64k.

So the engine wants 64k and object storage wants 256k.

## Smaller row groups, done the obvious way

The obvious fix is to write 64k row groups and accept the cost. The cost is large.

A normal Parquet file is laid out **row-major by row group**. All of row group 1's column chunks come first, then all of row group 2's, and so on (the top half of the figure below).

If you're reading just `c1`, its chunks are spread through the file with other columns in between. Each one is a separate range request. Cutting row groups to a quarter of the size gives you four times as many chunks and roughly four times as many GETs.

We measured this by serving all 99 ClickBench `hits` files (99 million rows) over a local HTTP server that counts every range request. We then ran the 43 ClickBench statements through the native scan path with production settings:

| Layout | Range GETs | GiB read |
|---|---|---|
| 256k row groups (before) | 26,692 | 15.68 |
| 64k row groups, row-major | 95,048 (**3.56×**) | 17.22 |

On GCS, each request costs over 100 ms of round-trip time. Spending 3.5× the requests to get 4% faster on CPU is a bad deal.

## Moving the chunks, not the boundaries

The solution is to stop requiring that a row group's chunks be stored together.

The Parquet spec doesn't require that. The footer records a byte offset and length for every column chunk separately. A row group is a logical grouping, and its chunks can be anywhere in the file. So Rugo now writes row groups in **blocks** of four (256k rows). Inside a block, each column's chunks are placed **next to each other**:

<figure class="doc-figure">
<svg viewBox="0 0 680 236" width="100%" role="img" aria-labelledby="grouped-layout-title grouped-layout-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="grouped-layout-title">Reading one column: row-major versus grouped</title>
<desc id="grouped-layout-desc">Two strips showing the byte order of a Parquet file with four row groups and three columns. Row-major: each row group's three column chunks sit together, so the chunks of column c1 are separated by other columns and reading c1 takes four range GETs. Grouped: the four row groups are written as one block, with each column's four chunks next to each other, so reading c1 takes one range GET. Bloom filters and the footer follow the last block.</desc>
<text x="0.0" y="20.0" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Row-major (before)</text>
<text x="680.0" y="20.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">each row group's chunks together</text>
<rect x="0.0" y="34" width="46" height="34" rx="4" style="fill: var(--opteryx-teal); stroke: none;"/>
<text x="23.0" y="55.0" text-anchor="middle" style="fill: var(--on-accent); font-size: 10.5px; font-weight: 600; font-family: var(--font-mono);">rg1.c1</text>
<rect x="49.0" y="34" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="72.0" y="55.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg1.c2</text>
<rect x="98.0" y="34" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="121.0" y="55.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg1.c3</text>
<rect x="147.0" y="34" width="46" height="34" rx="4" style="fill: var(--opteryx-teal); stroke: none;"/>
<text x="170.0" y="55.0" text-anchor="middle" style="fill: var(--on-accent); font-size: 10.5px; font-weight: 600; font-family: var(--font-mono);">rg2.c1</text>
<rect x="196.0" y="34" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="219.0" y="55.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg2.c2</text>
<rect x="245.0" y="34" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="268.0" y="55.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg2.c3</text>
<rect x="294.0" y="34" width="46" height="34" rx="4" style="fill: var(--opteryx-teal); stroke: none;"/>
<text x="317.0" y="55.0" text-anchor="middle" style="fill: var(--on-accent); font-size: 10.5px; font-weight: 600; font-family: var(--font-mono);">rg3.c1</text>
<rect x="343.0" y="34" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="366.0" y="55.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg3.c2</text>
<rect x="392.0" y="34" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="415.0" y="55.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg3.c3</text>
<rect x="441.0" y="34" width="46" height="34" rx="4" style="fill: var(--opteryx-teal); stroke: none;"/>
<text x="464.0" y="55.0" text-anchor="middle" style="fill: var(--on-accent); font-size: 10.5px; font-weight: 600; font-family: var(--font-mono);">rg4.c1</text>
<rect x="490.0" y="34" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="513.0" y="55.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg4.c2</text>
<rect x="539.0" y="34" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="562.0" y="55.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg4.c3</text>
<rect x="588.0" y="34" width="92.0" height="34" rx="4" style="fill: var(--surface); stroke: var(--border); stroke-width: 1; stroke-dasharray: 3 3;"/>
<text x="634.0" y="55.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-body);">footer</text>
<path d="M2.0,74 L2.0,80 L44.0,80 L44.0,74" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.75;"/>
<path d="M149.0,74 L149.0,80 L191.0,80 L191.0,74" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.75;"/>
<path d="M296.0,74 L296.0,80 L338.0,80 L338.0,74" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.75;"/>
<path d="M443.0,74 L443.0,80 L485.0,80 L485.0,74" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.75;"/>
<text x="0.0" y="100.0" style="fill: var(--orange-ink); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">4 range GETs to read c1</text>
<text x="0.0" y="142.0" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Grouped (now): one block of 4 row groups</text>
<text x="680.0" y="142.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">each column's chunks together</text>
<rect x="0.0" y="156" width="46" height="34" rx="4" style="fill: var(--opteryx-teal); stroke: none;"/>
<text x="23.0" y="177.0" text-anchor="middle" style="fill: var(--on-accent); font-size: 10.5px; font-weight: 600; font-family: var(--font-mono);">rg1.c1</text>
<rect x="49.0" y="156" width="46" height="34" rx="4" style="fill: var(--opteryx-teal); stroke: none;"/>
<text x="72.0" y="177.0" text-anchor="middle" style="fill: var(--on-accent); font-size: 10.5px; font-weight: 600; font-family: var(--font-mono);">rg2.c1</text>
<rect x="98.0" y="156" width="46" height="34" rx="4" style="fill: var(--opteryx-teal); stroke: none;"/>
<text x="121.0" y="177.0" text-anchor="middle" style="fill: var(--on-accent); font-size: 10.5px; font-weight: 600; font-family: var(--font-mono);">rg3.c1</text>
<rect x="147.0" y="156" width="46" height="34" rx="4" style="fill: var(--opteryx-teal); stroke: none;"/>
<text x="170.0" y="177.0" text-anchor="middle" style="fill: var(--on-accent); font-size: 10.5px; font-weight: 600; font-family: var(--font-mono);">rg4.c1</text>
<rect x="196.0" y="156" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="219.0" y="177.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg1.c2</text>
<rect x="245.0" y="156" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="268.0" y="177.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg2.c2</text>
<rect x="294.0" y="156" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="317.0" y="177.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg3.c2</text>
<rect x="343.0" y="156" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="366.0" y="177.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg4.c2</text>
<rect x="392.0" y="156" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="415.0" y="177.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg1.c3</text>
<rect x="441.0" y="156" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="464.0" y="177.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg2.c3</text>
<rect x="490.0" y="156" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="513.0" y="177.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg3.c3</text>
<rect x="539.0" y="156" width="46" height="34" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="562.0" y="177.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-mono);">rg4.c3</text>
<rect x="588.0" y="156" width="92.0" height="34" rx="4" style="fill: var(--surface); stroke: var(--border); stroke-width: 1; stroke-dasharray: 3 3;"/>
<text x="634.0" y="177.0" text-anchor="middle" style="fill: var(--muted); font-size: 10.5px; font-family: var(--font-body);">blooms · footer</text>
<path d="M2.0,196 L2.0,202 L191.0,202 L191.0,196" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.75;"/>
<text x="0.0" y="222.0" style="fill: var(--orange-ink); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">1 range GET to read c1 — still decoded as four 64k-row morsels</text>
</svg>
<figcaption>Byte order of a file with four row groups and three columns. Reading <code>c1</code> takes four ranges row-major, one grouped. The row groups themselves don't change.</figcaption>
</figure>

To read `c1` across the block, you need one range instead of four. The row group stays exactly what it was before: the unit for decoding, statistics, pruning and morsels. The only change is where the bytes are, which changes how many requests it takes to fetch them.

On the reader side, a remote read is now a **fetch block**: the row groups that survived pruning in one block. They're planned together through the existing range coalescer and fetched as one batch. Then they're decoded and handed to the engine one row group at a time. Workers still get 64k-row morsels, but the network sees requests for 256k rows.

Same benchmark, same counting server:

<figure class="doc-figure">
<svg viewBox="0 0 680 154" width="100%" role="img" aria-labelledby="grouped-gets-title grouped-gets-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="grouped-gets-title">Range GETs for the 43 ClickBench statements</title>
<desc id="grouped-gets-desc">Horizontal bar chart of range GETs to read the 99 ClickBench hits files for the 43 benchmark statements. 256k row groups (before): 26,692 GETs, 15.68 GiB. 64k row groups in the row-major layout: 95,048 GETs, 17.22 GiB, 3.56 times as many. 64k row groups in blocks of 4: 25,150 GETs, 17.22 GiB, 5.8% fewer than before.</desc>
<line x1="200.0" y1="18.0" x2="200.0" y2="148.0" style="stroke: var(--border); stroke-width: 1; stroke-dasharray: 2 3;"/>
<text x="200.0" y="14.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">0</text>
<line x1="295.0" y1="18.0" x2="295.0" y2="148.0" style="stroke: var(--border); stroke-width: 1; stroke-dasharray: 2 3;"/>
<text x="295.0" y="14.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">25,000</text>
<line x1="390.0" y1="18.0" x2="390.0" y2="148.0" style="stroke: var(--border); stroke-width: 1; stroke-dasharray: 2 3;"/>
<text x="390.0" y="14.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">50,000</text>
<line x1="485.0" y1="18.0" x2="485.0" y2="148.0" style="stroke: var(--border); stroke-width: 1; stroke-dasharray: 2 3;"/>
<text x="485.0" y="14.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">75,000</text>
<line x1="580.0" y1="18.0" x2="580.0" y2="148.0" style="stroke: var(--border); stroke-width: 1; stroke-dasharray: 2 3;"/>
<text x="580.0" y="14.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">100,000</text>
<text x="188.0" y="41.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">256k row groups</text>
<text x="188.0" y="56.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">before</text>
<rect x="200.0" y="34.0" width="101.4" height="20.0" rx="3" style="fill: var(--muted-2); stroke: none; stroke-width: 1; fill-opacity: 0.45;"/>
<text x="309.4" y="49.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-body);">26,692 · 15.68 GiB</text>
<text x="188.0" y="81.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">64k, row-major</text>
<text x="188.0" y="96.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">smaller row groups, old layout</text>
<rect x="200.0" y="74.0" width="361.2" height="20.0" rx="3" style="fill: var(--muted-2); stroke: none; stroke-width: 1; fill-opacity: 0.45;"/>
<text x="569.2" y="89.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-body);">95,048 · 17.22 GiB</text>
<text x="188.0" y="121.0" text-anchor="end" style="fill: var(--opteryx-teal); font-size: 12.5px; font-weight: 700; font-family: var(--font-body);">64k, blocks of 4</text>
<text x="188.0" y="136.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">the grouped layout</text>
<rect x="200.0" y="114.0" width="95.6" height="20.0" rx="3" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1;"/>
<text x="303.6" y="129.0" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">25,150 · 17.22 GiB</text>
</svg>
<figcaption>Range GETs and bytes read for the 43 ClickBench statements over all 99 <code>hits</code> files, counted by a local HTTP server. The grouped layout makes 5.8% fewer requests than before and reads 9.8% more bytes.</figcaption>
</figure>

The grouped layout uses slightly *fewer* requests than the old 256k files. We modelled this before writing any code, and the model's request counts came within 5% of the measured ones on all three layouts.

## Finer pruning

Smaller row groups also mean finer statistics. A 256k row group with one matching row has to be read in full. At 64k, the three quarters of the block without a match can be skipped.

Q20 on ClickBench is a point lookup on a scattered `UserID`. It dropped from 592 GETs and 199 MB to 348 GETs and 133 MB. When a block is partly pruned, the reader fetches only the surviving row groups, still as one range when they're next to each other.

## The reader works it out from offsets

We didn't add any new metadata. The reader works out blocks from the footer: two neighbouring row groups belong to the same block when every projected column's chunk in the second one **starts exactly where its chunk in the first one ends**.

That means:

* Files from other writers, and Rugo files written before this change, read the same way as before: one block per row group, with no special case.
* Blocks are decided per query, from the projected columns, so there's no flag that can disagree with the actual bytes.
* Footer fields stay accurate. `RowGroup.file_offset` is the start of the row group's earliest chunk, and `total_compressed_size` is the sum of its chunks.

The rule we set for [the writer](/blog/2026-06-25-parquet-writer) still applies: a file only Opteryx can read is a defect. The test suite writes grouped files with nine column types, including nulls, decimals, dictionary and plain strings, and with a page index. It reads them back through **PyArrow, DuckDB, Polars, Rugo and Opteryx**, full, projected and filtered, and compares the values.

## What it cost us

**Bloom filters moved to the end of the file.** Before, a column's bloom filter sat right next to its chunk, so it came along in the same GET, and we probed it to skip *decoding* chunks with no match. In the grouped layout, blooms placed between chunks would break the adjacency, and blocks would stop merging across columns. With blooms at the tail, the model gave 23,943 GETs. With blooms in front of each block, it gave 28,589. So blooms now go after the last block, and we removed the remote bloom decode-skip. It only ever saved CPU, never bytes, and fetching blooms from the tail would add requests. Plan-time bloom pruning on cached footers is unchanged, and so is the dictionary decode-skip.

**Files are about 6% bigger.** Smaller row groups mean more dictionaries, more statistics and more blooms. On `hits`, 64k files average 95 bytes per row, compared with 89.5 at 256k. Long strings like `URL` and `Title` grow the most. That accounts for the +9.8% bytes above.

**Footers are about 3.5× bigger.** Footer size grows with the number of row groups, and the layout doesn't change that: about 6.2 MiB per 4 GiB file at 64k, against 1.8 MiB at 256k. Footers are read at plan time and cached, so this shows up as cache pressure rather than as requests.

**Local disk got slightly slower on ClickBench.** Reading from local disk doesn't use range GETs, so the layout has no effect there. Grouped and row-major 64k files ran within 0.2% of each other on TPC-H. Row-group size still matters on local disk, though. On TPC-H, 64k is about 4% faster than 256k at SF1. On ClickBench's 105-column, string-heavy table it's **3.8% slower** (13.01 s vs 12.53 s): four times the morsels means four times the dispatch overhead across a lot of sub-200 ms queries. The best morsel size depends on the workload. We picked 64k knowing that this is the cost to weigh against it.

## Two regressions we found on the way

Smaller row groups exposed two problems in the reader. Both are fixed:

* **Too many wake-ups.** The new block reader woke *every* waiting worker for each row group it published, where the old pipeline woke one. On a local scan, which publishes one row group at a time, that meant waking all the workers on every submission. Now one item wakes one waiter.
* **Plan build grew with row groups × columns.** Building the scan plan matched projected column names against every chunk of every kept row group, and created a Python object per chunk. With 1,584 row groups × 105 columns, that took 28.2 ms per query. We now resolve the projected chunks once per file, which takes 7.4 ms.

Together these fixes took local ClickBench from 14.36 s back to 13.01 s on the new layout.

## Where this lands

The defaults have changed in Rugo and Opteryx: `max_rows_per_row_group` is 65,536 and `row_groups_per_block` is 4. Every path that writes Parquet (`INSERT`, `CREATE TABLE AS`, `MERGE`, `OPTIMIZE` and the catalog's compaction) streams through the same writer, so new data uses the grouped layout automatically. Existing tables switch over as they're compacted.

If you write Parquet with Rugo yourself, the settings are:

~~~python
from rugo.parquet import write_parquet

data = write_parquet(morsel, max_rows_per_row_group=65_536, row_groups_per_block=4)
~~~

`row_groups_per_block=1` gives you a plain row-major file.

There are some things we haven't measured yet:

* **Wall time against real GCS.** The request counts are real, but they come from a loopback server. The latency saved in production is a modelled estimate (≈130 ms RTT, 32 concurrent GETs), not a measurement.
* **The column patcher.** `ALTER TABLE ADD/DROP COLUMN` patches files in place and currently writes them back row-major. They're still correct, and they get the grouping back the next time they're compacted.

## The broader lesson

When one setting is doing two jobs, the default is a compromise between them. We first asked "what's the right row-group size?", and there wasn't a right answer, because the size was answering two questions. Once the layout separated how much the engine works on at a time from how much we fetch at a time, each could be set on its own evidence: 64k for the engine, 256k for the network.

Parquet already allowed this. The footer has always pointed at every chunk separately, and putting a row group's chunks together was only a convention. Owning [the writer](/blog/2026-06-25-parquet-writer) and the reader is what let us change it.

— Justin
