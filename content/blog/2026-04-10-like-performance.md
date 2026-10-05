---
title: Making LIKE Faster: From 93 Seconds to Single Digits
description: How optimising the LIKE operator — turned a 93-second query into sub-10-second execution through algorithmic improvements and GIL-aware design.
date: 2026-04-10
author: Justin Joyce
role: Opteryx Engineering
image: /blog/2026-04-10-like-improvements.png
tags:
  - performance
  - operators
  - string-search
  - algorithms
---

# Making LIKE Faster: From 93 Seconds to Single Digits

## TL;DR

The LIKE operator, particularly the `'%needle%'` pattern (substring search), went from 93 seconds in [Opteryx](https://opteryx.app/) 0.19.0 to 7.46 seconds in 0.26.2. The improvement came in stages: fixing the IO stack, recognising that `'%needle%'` is really a CONTAINS check (not a regex), direct buffer access, and adopting the Volnitsky algorithm with a sieve prefilter. We're now at ~2x overhead compared to single-threaded C++ engines, and we're pushing further by removing Arrow and eliminating GIL overhead in the search path.

## The Problem

Substring search in SQL is ubiquitous: filtering user IDs, matching partial text, finding patterns in logs. The LIKE operator handles this, but implementation details matter enormously.

Our reference point is **[ClickBench](https://benchmark.clickhouse.com/) query 20**, an example workload scanning ~100 million rows on Parquet data.

January 2025, Opteryx 0.19.0:

> 93.27 seconds

That's unacceptable. For comparison, C++/Rust engines like DuckDB and Clickhouse doing the same work were completing in under 4 seconds.

Profiling showed a large part of the problem wasn't algorithmic — it was fundamental. The IO stack was stalling execution. Improving string search was pointless if the data wasn't arriving.

## Stage 1: IO Stack Fix (0.19.0 → 0.20.0)

The first 30 seconds of that 93-second runtime was the IO bottleneck. Rewriting the IO stack to use fine-grained byte-range reads cut this down dramatically.

By 0.20.0, roughly one month later:

> 56.82 seconds

Better, but still nowhere near 4 seconds. The string search itself was still slow.

## Stage 2: Recognising LIKE '%needle%' is CONTAINS (0.20.0 → 0.22.0)

Here's where the insight mattered.

SQL has a LIKE operator that's technically a regex with wildcards:
- `LIKE 'needle'` = exact match
- `LIKE 'needle%'` = prefix match
- `LIKE '%needle'` = suffix match
- `LIKE '%needle%'` = substring match (CONTAINS)

Our original implementation was treating all LIKE patterns as full regular expressions, delegating to Arrow's regex engine. This works, but it's expensive.

The key observation: **most LIKE queries in practice use the `'%needle%'` form**, which is really just a substring search, overkill for a regex.

We added a new operator, INSTR, and new strategy in the optimizer:

~~~python
if pattern matches '%NEEDLE%':
  return INSTR(column, needle) != -1
~~~

Instead of a full regex evaluation, we now do a direct substring check. This was a dramatic win:

0.22.0:

> 17.57 seconds

A 3.2x improvement over the previous version. Still not 4 seconds, but progress.

## Stage 3: Direct Buffer Access & Boyer-Moore-Horspool (0.22.0 → 0.26.2)

The next optimisation recognised that we were still going through Arrow's abstraction layers for INSTR checks.

We moved to direct buffer access:

- Read the raw Arrow buffer pointers
- Skip Arrow's helper functions
- Implement string search in compiled code

This allowed us to use a more sophisticated algorithm: **[Boyer-Moore-Horspool](https://en.wikipedia.org/wiki/Boyer%E2%80%93Moore%E2%80%93Horspool_algorithm) (BMH)**, a linear-time substring search that skips characters when mismatches occur.

We also added a **sieve prefilter**: before running the full search, we check if the needle's characters appear at all in the haystack. If the needle contains a rare character (say `'z'`), a quick scan can reject rows cheaply.

Results, 0.26.2:

> 7.46 seconds

Now we're only 1.8x slower than the C++ engines. We were pleased with this given at its heart, Opteryx is mostly written in Python.

## Stage 4: Volnitsky & Removing Arrow (Current Work)

We're currently deep in an engine refactor:

1. **Removing Arrow as the internal representation** unlocks faster processing of dictionary-encoded arrays (common in real datasets). Columns like "country" or "status" are often dictionary-encoded; Arrow's generic abstraction didn't let us specialise on this.

2. **Pushing code off the Python interpreter** to reduce GIL contention. String search loops are candidates for this — they're tight loops over uniform data.

We've adopted the **[Volnitsky algorithm](https://github.com/ox/Volnitsky-ruby)** which builds on BMH with multi-byte searches:

- Faster in practice on real strings
- Better prefilter (sieve) integration
- Clearer separation between "find first candidate" and "verify match"

Early results suggest we can hit the 4 second bar set by other engines, and as all things go in circles, 2.8s of our current 3.8s lab benchmark is IO again.

## The Lesson

<figure class="doc-figure">
<svg viewBox="0 0 680 262" width="100%" role="img" aria-labelledby="like-progression-title like-progression-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="like-progression-title">LIKE &#x27;%needle%&#x27; from 93 seconds to 3.8</title>
<desc id="like-progression-desc">Bar chart of the LIKE &#x27;%needle%&#x27; benchmark by version: 0.19.0 93.27 s, of which about 30 s was I/O; 0.20.0 56.82 s after the I/O stack rewrite; 0.22.0 17.57 s after treating &#x27;%needle%&#x27; as CONTAINS; 0.26.2 7.46 s with direct buffers, Boyer-Moore-Horspool and a sieve; and a lab build at 3.8 s with Volnitsky and Arrow removed, of which 2.8 s is I/O. A dashed line marks DuckDB and ClickHouse at under 4 seconds.</desc>
<line x1="176.0" y1="26.0" x2="176.0" y2="220.0" style="stroke: var(--border); stroke-width: 1;"/>
<text x="176.0" y="234.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">0 s</text>
<line x1="282.0" y1="26.0" x2="282.0" y2="220.0" style="stroke: var(--border); stroke-width: 1;"/>
<text x="282.0" y="234.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">25 s</text>
<line x1="388.0" y1="26.0" x2="388.0" y2="220.0" style="stroke: var(--border); stroke-width: 1;"/>
<text x="388.0" y="234.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">50 s</text>
<line x1="494.0" y1="26.0" x2="494.0" y2="220.0" style="stroke: var(--border); stroke-width: 1;"/>
<text x="494.0" y="234.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">75 s</text>
<line x1="600.0" y1="26.0" x2="600.0" y2="220.0" style="stroke: var(--border); stroke-width: 1;"/>
<text x="600.0" y="234.0" text-anchor="middle" style="fill: var(--muted-2); font-size: 10.5px; font-family: var(--font-body);">100 s</text>
<line x1="193.0" y1="16.0" x2="193.0" y2="220.0" style="stroke: var(--opteryx-orange); stroke-width: 1.25; stroke-dasharray: 4 3;"/>
<text x="198.0" y="14.0" style="fill: var(--opteryx-orange); font-size: 11px; font-weight: 600; font-family: var(--font-body);">DuckDB, ClickHouse: under 4 s</text>
<text x="164.0" y="45.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">0.19.0</text>
<text x="164.0" y="60.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">baseline</text>
<rect x="176.0" y="38.0" width="127.2" height="20.0" rx="3" style="fill: var(--muted-2); stroke: none; stroke-width: 1; fill-opacity: 0.6;"/>
<rect x="303.2" y="38.0" width="268.3" height="20.0" rx="3" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.9;"/>
<text x="579.5" y="53.0" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">93.27 s</text>
<text x="164.0" y="83.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">0.20.0</text>
<text x="164.0" y="98.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">I/O stack rewrite</text>
<rect x="176.0" y="76.0" width="240.9" height="20.0" rx="3" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.55;"/>
<text x="424.9" y="91.0" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">56.82 s</text>
<text x="164.0" y="121.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">0.22.0</text>
<text x="164.0" y="136.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">&#x27;%needle%&#x27; as CONTAINS</text>
<rect x="176.0" y="114.0" width="74.5" height="20.0" rx="3" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.55;"/>
<text x="258.5" y="129.0" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">17.57 s</text>
<text x="164.0" y="159.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">0.26.2</text>
<text x="164.0" y="174.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">direct buffers, BMH, sieve</text>
<rect x="176.0" y="152.0" width="31.6" height="20.0" rx="3" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.55;"/>
<text x="215.6" y="167.0" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">7.46 s</text>
<text x="164.0" y="197.0" text-anchor="end" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">lab</text>
<text x="164.0" y="212.0" text-anchor="end" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">Volnitsky, Arrow removed</text>
<rect x="176.0" y="190.0" width="11.9" height="20.0" rx="3" style="fill: var(--muted-2); stroke: none; stroke-width: 1; fill-opacity: 0.6;"/>
<rect x="187.9" y="190.0" width="4.2" height="20.0" rx="3" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.9;"/>
<text x="200.1" y="205.0" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">3.8 s</text>
<rect x="176.0" y="245.0" width="10.0" height="10.0" rx="2" style="fill: var(--muted-2); stroke: none; stroke-width: 1; fill-opacity: 0.6;"/>
<text x="192.0" y="254.0" style="fill: var(--text); font-size: 11px; font-family: var(--font-body);">I/O</text>
<rect x="236.0" y="245.0" width="10.0" height="10.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.9;"/>
<text x="252.0" y="254.0" style="fill: var(--text); font-size: 11px; font-family: var(--font-body);">string search</text>
<rect x="356.0" y="245.0" width="10.0" height="10.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.55;"/>
<text x="372.0" y="254.0" style="fill: var(--text); font-size: 11px; font-family: var(--font-body);">total, split not measured</text>
</svg>
<figcaption>Where the I/O share was measured, the bar is split. By the lab build, I/O is most of the time again.</figcaption>
</figure>

Optimising a substring search operator looks simple in isolation, but the real wins come from:

1. **Fixing fundamentals first** (IO stack). A fast algorithm on slow data is still slow.
2. **Recognising pattern specialisation** (`'%needle%'` is CONTAINS, not regex).
3. **Direct buffer access** avoiding abstraction overhead.
4. **The right algorithm** (BMH and Volnitsky beat naive search by orders of magnitude).
5. **Preparing for parallelism** (GIL-free code paths).

This progression from 93 seconds to 4 seconds shows that cumulative, targeted optimisations compound. We're not done yet.
