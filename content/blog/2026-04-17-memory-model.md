---
title: "Rewriting the Memory Model: Moving Beyond Arrow"
description: Why we replaced Arrow in Opteryx to break through a fundamental performance barrier.
date: 2026-04-16
author: Justin Joyce
role: Opteryx Engineering
image: /blog/2026-04-16-memory-model.png
tags:
  - performance
  - memory
  - arrow
  - execution-engine
  - engineering
---

# Rewriting the Memory Model: Moving Beyond Arrow

## TL;DR

[Arrow](https://arrow.apache.org/) helped us get started, but it became a performance barrier in the execution path.

On [ClickBench](https://benchmark.clickhouse.com/#system=-ndd&type=-&machine=+ca4e&cluster_size=-&opensource=-&hardware=+c&tuned=+n&metric=combined&queries=-) we were near the front of a group of medium-performance engines, but there was a clear gap to the fastest ones. That usually points to something structural rather than something you can tune away.

So we stopped trying to optimise around it and started replacing Arrow with something designed for how [Opteryx](https://opteryx.app/) actually runs queries.

## The starting point

Arrow solved real problems for us early on.

It gave us:
- a lot of functionality without having to build everything ourselves
- compatibility with [Parquet](https://parquet.apache.org/) and the wider ecosystem

That mattered. When you’re building a query engine, there’s a lot of value in starting from something stable.

And to be clear, Arrow is a good fit for a lot of systems. If your problem is interoperability or general-purpose data processing, you won’t go far wrong with it.

This isn’t a post about Arrow being bad.

It’s about hitting a limit.

## The problem we kept seeing

As we worked through performance issues in Opteryx, we kept seeing the same pattern.

We could make things faster locally:
- tighten loops
- reduce allocations
- optimise operators

But the gains stopped stacking.

That usually means the problem isn’t local anymore. It means the architecture is doing something expensive over and over again.

In our case, it was moving data between representations.

A typical path looked like:
- Arrow arrays as the source
- [NumPy](https://numpy.org/) views or copies for some operations
- Python objects where neither worked cleanly

Every step between those had a cost.

## A concrete example

This showed up clearly when we reworked our [LIKE](https://docs.opteryx.app/blog/2026-04-10-like-performance) operator.

The original path moved data from Arrow → NumPy → Python.

When we processed the Arrow buffers directly, we cut about 7 seconds off a run over 100 million strings.

That wasn’t a clever optimisation. It was just removing transitions.

## The conversion tax

The easiest way to think about it is a conversion tax.

The engine wasn’t operating on one representation end-to-end. It kept crossing boundaries, and every boundary had overhead.

Two things dominated.

**CPU overhead**

Arrow’s null handling is fine on its own. The problem is what happens when you mix it with Python and multiple execution paths:
- extra checks in tight loops
- more branching
- Python object access creeping into hot paths
- vectorised paths dropping back to interpreted ones

None of that is catastrophic individually, but together it adds up.

**Memory overhead**

We were also holding the same data more than once.

Combinations of:
- Arrow buffers
- NumPy arrays
- Python structures

In theory Arrow supports zero-copy. In practice, null handling and layout differences often meant we couldn’t take that path cleanly.

So we ended up duplicating and adapting data instead.

<figure class="doc-figure">
<svg viewBox="0 0 680 210" width="100%" role="img" aria-labelledby="memory-tax-title memory-tax-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="memory-tax-title">The conversion tax, before and after Draken</title>
<desc id="memory-tax-desc">Two pipelines. Before: Parquet to Arrow arrays to NumPy views or copies to Python objects to the operator, with a cost marked at each of the four crossings: copies, null re-handling, or dropping into the interpreter, and the same data held more than once. After: Parquet to Draken vectors to native operators, with no conversions.</desc>
<text x="0.0" y="14.0" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Before: data changed shape on the way through</text>
<rect x="0.0" y="30.0" width="108.8" height="40.0" rx="6" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="54.4" y="55.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">Parquet</text>
<line x1="111.8" y1="50.0" x2="134.8" y2="50.0" style="stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="132.8,46.0 140.8,50.0 132.8,54.0" style="fill: var(--muted);"/>
<rect x="98.8" y="76.0" width="54.0" height="16.0" rx="8" style="fill: var(--opteryx-orange); stroke: none; stroke-width: 1; fill-opacity: 0.18;"/>
<text x="125.8" y="88.0" text-anchor="middle" style="fill: var(--orange-ink); font-size: 10px; font-weight: 700; font-family: var(--font-body);">convert</text>
<rect x="142.8" y="30.0" width="108.8" height="40.0" rx="6" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="197.2" y="55.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">Arrow arrays</text>
<line x1="254.6" y1="50.0" x2="277.6" y2="50.0" style="stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="275.6,46.0 283.6,50.0 275.6,54.0" style="fill: var(--muted);"/>
<rect x="241.6" y="76.0" width="54.0" height="16.0" rx="8" style="fill: var(--opteryx-orange); stroke: none; stroke-width: 1; fill-opacity: 0.18;"/>
<text x="268.6" y="88.0" text-anchor="middle" style="fill: var(--orange-ink); font-size: 10px; font-weight: 700; font-family: var(--font-body);">convert</text>
<rect x="285.6" y="30.0" width="108.8" height="40.0" rx="6" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="340.0" y="55.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">NumPy views or copies</text>
<line x1="397.4" y1="50.0" x2="420.4" y2="50.0" style="stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="418.4,46.0 426.4,50.0 418.4,54.0" style="fill: var(--muted);"/>
<rect x="384.4" y="76.0" width="54.0" height="16.0" rx="8" style="fill: var(--opteryx-orange); stroke: none; stroke-width: 1; fill-opacity: 0.18;"/>
<text x="411.4" y="88.0" text-anchor="middle" style="fill: var(--orange-ink); font-size: 10px; font-weight: 700; font-family: var(--font-body);">convert</text>
<rect x="428.4" y="30.0" width="108.8" height="40.0" rx="6" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="482.8" y="55.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">Python objects</text>
<line x1="540.2" y1="50.0" x2="563.2" y2="50.0" style="stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="561.2,46.0 569.2,50.0 561.2,54.0" style="fill: var(--muted);"/>
<rect x="527.2" y="76.0" width="54.0" height="16.0" rx="8" style="fill: var(--opteryx-orange); stroke: none; stroke-width: 1; fill-opacity: 0.18;"/>
<text x="554.2" y="88.0" text-anchor="middle" style="fill: var(--orange-ink); font-size: 10px; font-weight: 700; font-family: var(--font-body);">convert</text>
<rect x="571.2" y="30.0" width="108.8" height="40.0" rx="6" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="625.6" y="55.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">operator</text>
<text x="0.0" y="112.0" style="fill: var(--orange-ink); font-size: 11.5px; font-family: var(--font-body);">Each crossing could copy, re-handle nulls, or drop into the interpreter, and the same data was held more than once.</text>
<text x="0.0" y="144.0" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">After: one representation end to end</text>
<rect x="0.0" y="160.0" width="204.0" height="40.0" rx="6" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="102.0" y="185.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">Parquet</text>
<line x1="207.0" y1="180.0" x2="230.0" y2="180.0" style="stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="228.0,176.0 236.0,180.0 228.0,184.0" style="fill: var(--muted);"/>
<rect x="238.0" y="160.0" width="204.0" height="40.0" rx="6" style="fill: var(--surface); stroke: var(--opteryx-teal); stroke-width: 1;"/>
<text x="340.0" y="185.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">Draken vectors</text>
<line x1="445.0" y1="180.0" x2="468.0" y2="180.0" style="stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="466.0,176.0 474.0,180.0 466.0,184.0" style="fill: var(--muted);"/>
<rect x="476.0" y="160.0" width="204.0" height="40.0" rx="6" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="578.0" y="185.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">native operators</text>
</svg>
</figure>

## We tried to push Arrow further

Before replacing it, we tried to make it work.

We accessed buffers directly. We avoided higher-level APIs. We pushed more work into compiled code.

That helped, but only up to a point.

We kept running into the same issue: even when the data was “zero-copy”, the execution wasn’t. The loops were still in Python, or the control flow still depended on it.

At the same time, the engine was getting more complicated. Each workaround made one path faster and something else harder to reason about.

At some point it became clear we were optimising around the mismatch instead of removing it.

## The decision

Once we framed it properly, the direction was obvious.

If we wanted to move the performance ceiling, we needed to own the memory model used in execution.

That’s where Draken came from.

## What Draken is designed to do

Draken isn’t trying to replace Arrow everywhere. It’s about removing it from the hot path.

A few things mattered:

**Keep Python out of tight loops**

If something is performance-critical, it shouldn’t be running through Python object machinery.

Iteration, null handling, operator execution — all of that needs to stay in native code.

**Stop translating data**

The engine shouldn’t need to convert data just to move between stages.

A query engine does enough work already. Converting representations shouldn’t be part of it.

**Control the layout**

We want the memory layout to match how the engine actually executes, not how a general-purpose format needs to behave.

We still align with Parquet where it makes sense — things like dictionary encoding still matter — but we’re not bound to Arrow’s internal structure.

## Why this changes the ceiling

The gains here don’t come from a single optimisation.

They come from removing whole categories of work:
- no Python in tight loops
- no repeated conversions
- null handling designed for our execution model
- memory layout chosen for operators, not interchange

That makes things faster, but more importantly it makes further improvements easier.

## The engineering lesson

Arrow was a good starting point, but it wasn’t the right execution format for Opteryx long term.

The mismatch between memory model and execution model kept showing up as overhead.

Owning the format let us remove that friction.

That’s where the gain comes from — not a faster component, but a simpler path.

## One unexpected win

One thing we didn’t expect: Arrow often materialises dictionary-encoded columns into dense representations.

By keeping dictionary encoding in our internal format, we got a nice side-effect:
- fewer comparisons
- smaller working sets
- less memory traffic

That wasn’t the goal, but it turned out to be a useful win.
