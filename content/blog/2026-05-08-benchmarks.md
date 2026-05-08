---
title: Five Benchmarks, One Engine
description: How we run five industry benchmarks to close blind spots exposed by our execution-layer rewrite and measure Opteryx against other engines.
date: 2026-05-08
author: Justin Joyce
role: Opteryx Engineering
image: /blog/2026-05-08-benchmarks.png
tags:
  - performance
  - benchmarks
  - execution-engine
  - testing
---

# Five Benchmarks, One Engine

## TL;DR

* We spent the last few months rewriting the execution layer; as it stabilises we've found blind spots in our internal tests.
* Running community benchmarks exposed missing features, optimiser blind spots, and performance cliffs.

⸻

## The problem: invisible gaps

Internal tests don’t lie - they just measure what you thought to test.

After the execution‑layer rewrite started stabilising, we realised our existing suite missed important patterns. The engine could pass unit tests and still fail in the wild: missing aggregation functions, null-handling edge cases, poor join ordering, optimiser gaps.

A tiny example:

~~~sql
SELECT category, SUM(amount) * 1.1 AS adjusted_total
FROM sales
GROUP BY category
~~~

We had no tests which operated on aggregation results. That sounds obvious in hindsight, but it simply wasn’t a shape our previous suite exercised.

⸻

## The approach: benchmarks are opinions

Benchmarks aren’t a single truth. They’re a collection of opinions about what matters.

Different benchmarks stress different things, so we picked a set that complement each other rather than overlap heavily.

### 1. SQLLogicTest — correctness

A broad correctness harness with a simple, portable format.

We use [SQLLogicTest](https://sqlite.org/sqllogictest/doc/trunk/about.wiki) for correctness and consistency. It’s portable and language‑agnostic, which also makes it useful for cross‑engine checks.

What SQLLogicTest bought us reproducible runs, and as most other benchmarks are focused on timings and not the outputs, it brought us output verification.

⸻

### 2. H2O db-benchmark — community comparison

[H2O](https://h2oai.github.io/db-benchmark/) is useful because other engines publish numbers against it.

It helped expose feature gaps first:

* missing aggregates like MEDIAN
* unsupported query shapes
* behaviour differences from peer engines

It also gives us a rough sense of where we sit on common aggregation and join workloads.

⸻

### 3. ClickBench — analytics workloads

[ClickBench](https://benchmark.clickhouse.com/) is where practical OLAP behaviour starts showing up.

The dataset is larger, the queries are aggregation and filter heavy, and performance cliffs become obvious quickly.

This exposed aggregation paths that were technically correct but slower than they should have been. We have been using ClickBench to guide our rewrite of the aggregation layer as we rewrote it from scratch having removed Arrow from the system..

⸻

### 4. TPC-H — optimiser completeness

[TPC‑H](https://www.tpc.org/tpch/) is small, but the query shapes are useful.

It stresses:

* join planning
* predicate handling
* subqueries
* execution‑plan stability

This exposed places where our heuristics and cost model weren’t robust enough yet.

⸻

### 5. JOB — join ordering precision

[JOB](https://github.com/gregrahn/join-order-benchmark) is brutal in a very specific way.

It exposed weaknesses in:

* cardinality estimation
* statistics coverage
* join‑order selection

You can have a correct optimiser and still produce catastrophically bad plans if the estimates are wrong. JOB makes those mistakes very obvious.

⸻

## What we found

**SQLLogicTest** — edge cases in null handling and type coercion. Mostly under control.

**H2O** — missing aggregates and unsupported features. We’re implementing the gaps as they appear.

**ClickBench** — When the work of the query is a function, we are competitive, but we're still missing some structural optimisations and performance opportunities..

**TPC-H** — Weak optimiser heuristics. Current work is around better propagation and mutation of statistics.

**JOB** — Statistics gaps hurting join ordering. Very similar to to TPC-H, but with improvements on how the optimizer uses the statistics to make decisions..

These findings form a priority queue: correctness → feature parity → optimiser robustness → targeted performance work.

⸻

## Why this matters

A query engine can be “correct” under narrow tests and still be unusable in practice.

Benchmarks force uncomfortable questions:

* do we behave like other engines?
* do we support the features people expect?
* do we fall over on realistic workloads?
* are our optimiser choices robust?

For us, benchmarks serve two purposes:

* verification — closing behavioural blind spots
* comparison — understanding where we lag and why

⸻

## Engineering takeaways

* Community benchmarks find problems internal suites miss.
* Correctness comes first; performance work on incorrect behaviour is wasted effort.
* Different benchmarks expose different classes of failure — you need several.

The execution rewrite only matters if behaviour and performance survive contact with real workloads.

That’s what the benchmarks are for.

— Justin
