---
title: A Toolbox of Hash Structures — Why One Hash Table Isn't Enough
description: How replacing a single general-purpose hash table with a family of specialised structures — including a direct-addressed bit-array — drove meaningful performance gains across joins, filters, and deduplication in Opteryx.
date: 2026-05-15
author: Justin Joyce
role: Opteryx Engineering
tags:
  - performance
  - joins
  - data-structures
  - execution-engine
---

# A Toolbox of Hash Structures — Why One Hash Table Isn't Enough

## TL;DR

* "Hash join" and "hash set" are conceptual descriptions, not implementations — there are many ways to build each.
* A general-purpose hash table is a sound default, but it's not the best tool for every job.
* We replaced a single hash structure with a small family of specialised alternatives.
* For bounded-range integer keys, a direct-addressed bit-array eliminates hashing entirely and cuts membership test costs by up to 2×.

## The name is not the implementation

When people say "hash join" or "hash set", they're describing an idea.

Build a structure on one side. Probe it from the other.

What they're not describing is how that structure should actually be built — and that's where most of the interesting decisions live.

In practice, "hash join" encompasses at least:

- Classic chained hash tables (general purpose, works for everything)
- Open-addressing / Robin Hood hash tables (better cache behaviour under load)
- Partitioned hash joins (NUMA-friendly, cache-line aware)
- Direct-addressed structures (for bounded integer keys — no hashing at all)
- Bloom-filter-assisted joins (probabilistic prefilter before a main structure)

The right choice depends on what the data actually looks like: cardinality, type, value range, expected probe/build ratio.

A single structure optimised for the average case pays a tax on every case that isn't average.

## What we already had

Before this work, Opteryx had two membership structures handling everything:

- **`CarcharSet`** — a general-purpose hash set. Works for any type, any cardinality. Always correct. Not always optimal.
- **`ParviSet`** — tuned for string keys with a compact memory layout.

These cover the common case well. They're not going anywhere.

The question is what we leave on the table by applying them uniformly — and whether we can do better for the cases where we know more about the data.

## The gap: bounded integer keys

Every hash table operation has a fixed cost floor.

Compute a hash. Index into a bucket array. Follow a chain. Potentially miss cache.

For high-cardinality or variable-width data, that cost is irreducible. But for bounded-range integer keys — status codes, day-of-week values, country IDs, date-part outputs — it's not. The hash is pure overhead.

If you know the value range fits in a small interval `[min, max]`, you can replace the hash table with a direct-addressed bit-array:

```
slot  = key − min_val
word  = words[slot >> 6]     # uint64_t word
mask  = 1 << (slot & 63)
test  = word & mask
```

No hash function. No collision chain. An insert or membership test is a subtraction, a right-shift, and a bit-test.

At one bit per slot, 262,144 slots occupy 32 KB — comfortably L1-resident.

We call this the `PerfectHashSet`.


## Where it fits

The new structure plugs into three hot paths:

**`IN`-list filters** — a pre-built set of literal values, probed once per row. If all literals are non-null integers and `max − min < 262,144`, the set is built at plan time as a `PerfectHashSet`. The probe kernel receives a typed dense pointer (`int8*`, `int16*`, or `int64*`) and iterates without branching on element width.

**`DISTINCT`** — streaming deduplication. For `INT8` and `INT16` columns, type bounds guarantee the full value domain fits within 512 or 128K slots respectively. The `PerfectHashSet` initialises once and accumulates naturally across morsels — no promotion logic needed.

**Semi/anti-join probing** — the right side materialises into a set; the left side probes it. For narrow integer join keys, the build phase uses type-specialised dense-pointer loops. Nulls are tracked separately and handled before the probe.

In all three cases, `CarcharSet` remains the fallback for anything outside the eligibility criteria. The toolbox gains a new member — the existing member keeps its role.

## Eligibility is explicit, not magic

The eligibility check is deliberate and conservative.

| Path | Criterion | Bounds source |
|---|---|---|
| `IN`-list | All literals are non-null integers; `max − min < 262,144` | Exact: computed from literals at plan time |
| `DISTINCT` | Column type is `INT8` or `INT16` | Type-bound: guaranteed by the type system |
| Semi/anti-join | First right morsel is `INT8` or `INT16` | Same type-bound |

The 262,144-slot cap isn't arbitrary — it's where 32 KB of bit-array fits in a typical L1 cache. Beyond that, the access pattern on a larger array degrades toward the random-access cost of the hash table it would replace, and you've gained nothing.

If eligibility fails, the code falls back to `CarcharSet` without retrying. No silent degradation. No ambiguity.

## A bug the tests caught

The `int64` batch probe kernel originally had no bounds check.

Consider `IN (100, 200, 300)` probed against a column containing `[1, 2, ..., 9]`. The `PerfectHashSet` is built over the range `[100, 300]`. For key `1`: `idx = 1 − 100 = −99`, then `words[−99 >> 6]` is a read two `uint64_t` words *before* the allocated array.

On one run, that unallocated memory happened to have a set bit. False match.

The fix is an explicit bounds check in all `int64` batch methods. The `int8`/`int16` kernels are exempt — a value of those types is always within the bounds the set was constructed for, so the check would be unreachable.

I feel like this is one of those bugs that's obvious in retrospect and completely invisible until something goes wrong in exactly the right way. Good argument for writing tests before you're confident the code is correct.

## Results

Measured on 1M-row synthetic arrays, ARM (Apple Silicon), dev build:

| Path | CarcharSet | PerfectHashSet | Speedup |
|---|---|---|---|
| `IN`-list, `int64`, range 1–100 | 6.1 ms | 2.9 ms | **2.1×** |
| `IN`-list, `int8` column | 6.3 ms | 3.6 ms | **1.7×** |

The `int64` path gains more because the hash computation dominates for 64-bit keys. The `int8` path is already cheaper to hash (Draken uses compact fixed-width hashing for narrow types), so the relative gain is smaller — but still meaningful.

## What's next

Phase 2 extends eligibility to `INT32` and `INT64` columns using per-column min/max statistics already collected by Opteryx's manifest layer. Any bounded-range column the planner can prove fits within the cap — date ordinals, enum-like integer keys, foreign keys into small dimension tables — becomes a candidate without any structural changes.

Beyond set membership, the same idea extends to join maps: a direct-addressed structure where each slot stores a row-index list instead of a single bit. That's the `DirectAddressJoinMap` — deferred from this phase, but the logical next step.

The broader lesson is the same one that runs through the aggregation work and the Draken rewrite.

A general-purpose solution is correct everywhere and optimal nowhere.

Build the toolbox. Use the right tool.

-- Justin
