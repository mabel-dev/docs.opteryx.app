---
title: 10x Faster Memory Management: Optimising Opteryx's Core Memory Pool
description: How a targeted change to the MemoryPool implementation produced a 10x improvement by moving metadata into C++ while keeping the Python API unchanged.
date: 2026-04-03
author: Justin Joyce
role: Opteryx Engineering
image: /blog/2026-04-03-memory-pool.png
tags:
  - performance
  - memory
  - c++
  - engineering
---

# 10x Faster Memory Management: Optimising Opteryx's Core Memory Pool

## TL;DR

A small, surgical change to the memory pool produced a 10x improvement in allocation/commit throughput. We moved metadata tracking out of Python and into a compact C++ structure, preserved the public API, and avoided a large rewrite. The result: much higher throughput, lower variance, and no behavioural changes for users.

---

## The problem

The `MemoryPool` is central to query execution: it allocates buffers, manages lifetime, supports zero‑copy reads, and compacts segments. For years the pool tracked segment metadata using Python `dict`s. That was simple and readable — but slow.

In a tight allocate→read→release loop (the exact pattern used across query plans and streaming workloads) Python hash-table lookups and object overhead dominated the hot path. The metadata lookups were the bottleneck.

---

## The change

We did three things, incrementally and carefully:

- Replaced the Python `dict` used for metadata with a C++ `unordered_map<int64_t, SegmentMetadata>`.
- Moved metadata into a compact C struct (`SegmentMetadata`) with no Python object overhead.
- Kept the public Python API identical; `used_segments` remains a lazily-evaluated Python dict for compatibility.

The key principle was minimalism: replace just the slow part and keep everything else stable.

---

## Why this works

- Metadata access is performance‑critical but implementation‑local. Users call the same APIs; they do not rely on Python `dict` semantics for internal bookkeeping.
- Moving metadata to C++ removes Python interpreter and object costs from the hot path.
- Keeping the public API stable means tests, consumers, and integrations continue to work without change.

We also retained Python `RLock` for synchronization because C++ template types cannot be embedded in Cython classes in our current layout — a pragmatic compromise that keeps thread-safety intact.

---

## Results

Benchmarks (small allocations: 50k commits of 100 bytes):

Old implementation:  12,839 ops/sec  
New implementation: 134,104 ops/sec

Improvement: 10.4x faster

This is a meaningful change, not a micro‑tweak — it shifts the envelope for memory‑bound workloads and reduces variance introduced by the Python runtime.

---

## Where it matters

- Read cache: we're planning to use the MemoryPool as a read-caching layer as part of continual IO-stack improvements — enabling hot-block reuse, reducing physical IO, and improving tail latency for common queries.
- Morsel exchange: during the execution-engine rewrite the pool will act as the morsel exchange between operators, enabling efficient, zero-copy morsel handoffs and clearer ownership boundaries for execution stages.
- Zero‑copy flows: lower latency between producers and consumers when memory handoffs are fast and predictable.
- Classic Opteryx: historically the MemoryPool served as the buffer pool; these planned uses extend that role into caching and operator exchange while preserving the same minimal, native hot path and public API.

---

## How we approached it

This was not a rewrite. The steps were:

1. Profile to confirm the real bottleneck (dict lookups and object churn).
2. Design a minimal C++ metadata representation and chosen container (`unordered_map<int64_t, SegmentMetadata>`).
3. Implement the C++ layer behind the existing Cython/Python bindings.
4. Preserve the Python-facing API and lazy compatibility layers.
5. Run the full test-suite and benchmark under representative loads.

The result was surgical: small, reviewable changes with a large impact.

---

## The broader lesson

Optimising a mature codebase usually works best as a targeted, incremental effort. Identify the true hot path, replace the implementation with a low‑overhead equivalent, and keep the surrounding behaviour stable. You get the performance gains without the risk and cost of a full rewrite.

If you’re struggling with latency or throughput in a Python project, look for implementation details that are purely internal state — those are often the best places to move into faster languages without changing your public contract.
