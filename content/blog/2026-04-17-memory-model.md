---
title: Rewriting the Memory Model Moving Beyond Arrow
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
