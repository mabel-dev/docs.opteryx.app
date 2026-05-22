---
title: Redesigning the String Header — Prefix or Hash?
description: Why we deviated from the textbook long-string layout and moved to a hybrid 16-byte header tuned for equality-heavy SQL workloads.
date: 2026-05-22
author: Justin Joyce
role: Opteryx Engineering
tags:
  - performance
  - strings
  - data-structures
  - execution-engine
---

# Redesigning the String Header — Prefix or Hash?

## TL;DR

* The textbook long-string layout (length + prefix + pointer) is elegant, but not ideal for our workload.
* Our hot paths are equality-heavy (`JOIN`, `GROUP BY`, `DISTINCT`, `IN`) and often hit shared prefixes.
* We now store long strings as `[length][xxhash32][prefix][arena offset]`.
* That gives us better early rejection for inequality checks, without widening the header.

---

## The context

Draken stores every string in a fixed 16-byte slot.

This is the format often called [German strings](https://cedardb.com/blog/german_strings/): short values inline, longer values out-of-line.

That fixed-width slot is non-negotiable. It keeps vector operations predictable and cache behaviour sane.

The real design work is deciding what information those 16 bytes should carry.

---

## The textbook long-string layout

The usual long-string layout is straightforward:

```text
[length 4B][prefix 4B][pointer 8B]
```

It’s a good default.

You get:

- length for cheap mismatch checks
- a prefix shortcut for early divergence
- a pointer to the full bytes

If your data diverges early, prefix checks avoid lots of arena reads.

If your data shares common starts (`https://`, `CVE-`, or repeated tenant IDs), prefix checks stop helping quickly.

That is exactly where our workloads spend time.

---

## Why we didn’t keep the textbook version

Because our bottleneck is not usually "find lexical order quickly".

Our bottleneck is "prove equality quickly, millions of times".

In Opteryx, the dominant string work is:

- hash join probes
- grouping key comparisons
- dedup checks
- `IN` membership checks

Those are equality decisions.

So I feel the right question is: what metadata helps us reject non-matches earliest, with the fewest memory touches?

A prefix helps sometimes.

A hash helps more often.

And we had one more lever: our arena reference can be a 32-bit offset (morsel-local), not a full 64-bit pointer.

That gives us an opportunity to free 4 bytes in the same 16-byte budget.

---

## What we changed

For long strings, the header is now:

```text
[length 4B][xxhash32 4B][prefix 4B][arena offset 4B]
```

So, same 16 bytes. Different payload.

At comparison time, we can reject in stages:

1. length mismatch → reject
2. hash mismatch → reject
3. prefix mismatch → reject
4. only then touch arena bytes

That sequence is cheap, branch-light, and friendly to batch execution.

This is the key difference from the textbook implementation: we use the fixed-width slot to carry *two* inequality filters (hash + prefix), not one.

---

## Short strings stay simple

For `length <= 12`, nothing changes:

```text
[length 4B][inline bytes 12B]
```

No arena access.

No indirection.

No drama.

---

## Where the gain appears

This pays off where we expected:

- `JOIN` on string keys
- `GROUP BY` string dimensions
- `DISTINCT` on string columns
- `IN (...)` filters over string literals

These paths do massive numbers of inequality checks.

The redesigned long-string header lets us eliminate most expensive byte fetches before they start.

---

## The broader point

The structure didn’t change.

The information density did.

Textbook layouts are great starting points. They’re not sacred.

When workload shape is clear, you should spend your 16 bytes on the questions your engine asks most often.

For us, that question is equality.

So that’s what we optimised.

— Justin
