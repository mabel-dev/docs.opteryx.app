---
title: Stop Using Regex for REGEXP_REPLACE
description: REGEXP_REPLACE dominated query time. Swapping regex engines didn't help. We built a specialised DFA instead.
date: 2026-04-24
author: Justin Joyce
role: Opteryx Engineering
image: /blog/2026-04-24-regex-replace.png
tags:
   - performance
   - regex
   - operators
   - algorithms
   - clickbench
---

# When we Stopped Using Regex for REGEXP_REPLACE

## TL;DR

Our REGEXP_REPLACE performance on [ClickBench](https://benchmark.clickhouse.com/) was 10x slower than peers. Swapping regex engines barely moved the needle. The fix wasn't finding a faster regex engine, it was avoiding regex entirely. We built a specialised DFA and reduced query times to near parity.

---

## The Problem

REGEXP_REPLACE was eating our lunch.

I'll be honest, when we first started publishing to [ClickBench](https://benchmark.clickhouse.com/), we were so far from the pack that the performance of one specialized query wasn't going to close that gap.

After many iterations of the engine, performance of queries like Query 28 being ~10x slower than engines like [DuckDB](https://duckdb.org/) stands out like a sore thumb.

When a single operator dominates runtime, that naively feels like an easy win.

---

## We Tried the Obvious Thing First

First step: swap the regex engine.

DuckDB uses [RE2](https://github.com/google/re2). It's well known, fast, and predictable. Google wrote and use [RE2 in BigQuery](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/string_functions#regexp_contains), so it's fast and well-suited to our problem, so we integrated it into [Opteryx](https://opteryx.app/).

Result? Barely any change.

Maybe 5% in some cases. Hard to separate from noise. That's not a breakthrough — that's measurement variance.

Conclusion: the regex engine wasn't the bottleneck.

---

## The Pivot

If a faster regex engine wasn't the answer, what was?

Most REGEXP_REPLACE calls we see don't need full regex - they're mostly extract or replace calls.

We had brought a regex to a slice fight.

Turns out, you don't need backtracking to do patterned string slicing. You could use a [deterministic finite automaton](https://en.wikipedia.org/wiki/Deterministic_finite_automaton) (DFA).

---

## What We Built

We built a specialised engine, based on a DFA, for the patterns we actually see.

Not a full regex engine. A constrained one. Simple, even.

Design:

- compile pattern → deterministic automaton (once, at initialization)
- operate directly on buffers (no Python strings)
- track the capture points through the pattern
- slice the buffer at the capture points to extract the value

The key idea is embarrassingly simple: compile a rule you can progress through the string monotonically to execute.

---

## Results

From our lab ClickBench runs (non-published):

We went from 60 seconds down to 10. Same workload, same query shape, just a different approach.

This isn't a small optimisation. It changes the cost profile of the query.

---

## Engineering Lessons

One of the strengths of SQL is the engine is free to choose how it processes the user's request. Here, we were given a regex so we naively processed it as a regex, rather than using regex as the language to describe the intent and choosing the fastest way for us to meet that ask.

---

## Final Thought

The lesson isn't "build a faster regex engine".

It's "recognise when you don't need one".

— Justin
