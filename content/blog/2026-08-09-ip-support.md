---
title: IP Addresses Are Just Integers — And That's the Whole Design
description: Opteryx now has a native IPV4 type, CIDR containment, IP_TRUNC and CIDR_AGG. The type is a uint32 with a label, which is why almost none of the engine had to learn anything.
date: 2026-08-09
author: Justin Joyce
role: Opteryx Engineering
tags:
  - types
  - log-analytics
  - execution-engine
  - query-planning
---

# IP Addresses Are Just Integers — And That's the Whole Design

## TL;DR

* Opteryx has an `IPV4` type. It is a `UINT32` carrying a logical label — the 32 bits **are** the address, so `192.168.1.1` is `0xC0A80101`.
* Because unsigned integer order is byte-for-byte identical to IPv4 address order, sorting, grouping, joining and comparing needed *no* IPv4 awareness. Zero new code in any of them.
* `ip <<= '10.0.0.0/8'` is one AND and one compare per row. Literal networks get rewritten at plan time to a `BETWEEN`, which prunes files at the scan.
* `IP_TRUNC(ip, 24)` masks to network address. `CIDR_AGG(ip)` collapses any set of addresses into the minimal CIDR cover.
* IPv4 only. IPv6 exists, but it doesn't fit this design.

---

## Why bother with a type at all

You can already store addresses in Opteryx as `VARCHAR`. Everything works, in the sense that nothing errors.

But every interesting question about an address column is actually a *numeric* question:

- "traffic from `10.0.0.0/8`" is a range test
- "top talkers by /24" is a masked group-by
- "which addresses did this tenant use" wants a compact answer, not 40,000 strings

Done over text, each is a parse per row, and none of them prune at the scan. The addresses are usually the most selective column in a log table, and the engine was treating them as opaque bytes.

The type earns its place — but only if it's cheap.

---

## One decision does most of the work

An IPv4 column is a `DRAKEN_UINT32` vector with an `IPV4` logical descriptor. The bit order is standard: most significant byte first.

That's the design.

The payoff is what *didn't* get written. Unsigned integer ordering is exactly IPv4 address ordering, so:

- `ORDER BY ip` — the existing uint32 sort. Correct.
- `GROUP BY ip` — the existing integer hash. Correct.
- `JOIN ... ON a.ip = b.ip` — the existing integer join. Correct.
- `ip > '10.0.0.0'` — the existing comparison kernel.
- Statistics, bounds, row-group pruning — all of it already understood uint32.

The only places that need to know an address is an address are the ones where text matters (parsing and rendering) and where prefixes matter (containment, truncation, aggregation). That's four small pieces of code.

The canonical bit-order definition lives in one header, `draken/core/ipv4.h`. The renderer, cast kernels, containment check, and `IP_TRUNC` all route through it. A change to parsing rules cannot land selectively — there is only one place to change it.

---

## Parsing is strict

`CAST('10.1' AS IPV4)` fails. So does `CAST('010.0.0.1' AS IPV4)`.

Both pass most `inet_aton()`-style parsers. The first silently becomes `10.0.0.1`; the second becomes either `10.0.0.1` or `8.0.0.1` depending on whether leading zeros are octal.

That ambiguity isn't abstract. An access control rule and a log parser disagreeing about what `010.0.0.1` means is a security bug — one that reads as working software right up until it doesn't. Opteryx refuses both.

And rejections raise an error. They don't become `NULL`, don't become `0.0.0.0`. An unparseable address in a security dataset is a fact about your data, not a value.

---

## Containment: `<<=`

```sql
SELECT * FROM logs WHERE src_ip <<= '10.0.0.0/8';
```

The spelling follows PostgreSQL, CockroachDB and DuckDB. `>>=` is the mirror.

The predicate is `(address & netmask) == base` — one AND, one compare, no text parsing in the loop. That's why addresses are integers.

The kernel is one header with two call sites: plain columns or dictionary vectors. A compile-time parameter selects whether a row reads `data[i]` or `data[selection[i]]`. The compare, bit packing and null handling are shared, so both shapes give the same answer.

The 8-way unrolled pack breaks read-modify-write chains between adjacent rows, letting the compiler auto-vectorize to NEON (ARM) and AVX2 (x86) without target-specific intrinsics. RISC-V gets it for free.

A `NULL` address is contained by nothing — `false`, not `NULL`. Branchless, using the validity byte.

---

## The part that made it fast

That kernel is good, but it wasn't the bottleneck.

Containment as `<<=` compiles to an opaque function call in the expression bytecode. The optimizer's pushdown only recognizes comparisons, so `<<=` filters never reached the connector, never pruned files, and were never visible to join ordering. It read everything, then discarded most of it efficiently.

A network is exactly a closed unsigned interval. At plan time, literal CIDR containment rewrites to a range:

```sql
-- what you write
WHERE src_ip <<= '10.0.0.0/8'

-- what the optimizer plans
WHERE src_ip BETWEEN 167772160 AND 184549375
```

Now it prunes. Files that miss the range never open.

Two things about that rewrite are non-negotiable:

**It must emit `BETWEEN`, not `AND`.** Conjunctive predicates are split before rewrite, and pushdown only collects filters whose root is a comparison, `BETWEEN` or unary operator. An `AND` stays where it was written — which meant the filter sat *above* a join in our motivating case, filtering 500,000 materialised rows instead of pruning the scan.

**The `NULL` mismatch is only safe in a `WHERE`.** The kernel returns `false` for `NULL` addresses; a range returns `NULL`. `WHERE` discards both — the only reason they're equivalent. The rewrite fires on filters only. In a projection, it's a silent wrong answer.

Bounds come from the same Draken CIDR parser the kernel uses — no second parser in Python. Unparseable CIDR is left for the kernel to raise, because optimizations don't control *when* errors happen.

---

## `IP_TRUNC` and `CIDR_AGG`

`IP_TRUNC(ip, prefix)` applies a network mask: `IP_TRUNC('192.168.1.1', 24)` is `192.168.1.0`. The prefix is an argument, not part of the value, because an Opteryx address carries no prefix. Unlike PostgreSQL's `inet`, an address here is just an address; the prefix belongs to the operation.

It makes "group by /24" trivial:

```sql
SELECT IP_TRUNC(src_ip, 24) AS subnet, COUNT(*)
  FROM logs
 GROUP BY subnet
 ORDER BY 2 DESC;
```

`CIDR_AGG(ip)` is more interesting. It answers "which addresses did this group contain" as the *minimal* cover:

```sql
SELECT tenant, CIDR_AGG(src_ip) FROM logs GROUP BY tenant;
```

`10.0.0.0` through `10.0.0.7` comes back as `10.0.0.0/29`, not eight `/32`s. The result is an `ARRAY<VARCHAR>` — ascending, non-overlapping, and unique. The minimal cover has only one correct answer.

The uint32 representation pays off: the accumulator is a Roaring bitmap. Duplicates are free — a billion rows from one address costs the same as one. `NULL`s aren't members. A group with no addresses returns an empty array, not `NULL` — the answer to "which addresses" is a set, and the empty set is a valid answer.

It's bounded by two budgets: `@@cidr_agg_state_budget_bytes` for the collected set, `@@cidr_agg_emit_budget_bytes` for the rendered output. Both are independent — fitting one doesn't guarantee fitting the other. Worst case: half-density input (every other address), where nothing folds and each address needs a `/32`. A set that quietly stopped accepting addresses would produce correct-looking blocks that are silently incomplete. So it refuses instead.

---

## The metadata trap

Parquet has no IP type. An address column writes as plain `uint32` — which is a feature. Files stay readable by tools that know nothing of Opteryx.

But Parquet can't tell you the column is an address. The IPv4-ness lives in the catalog schema — in the *plan*. And plan metadata can go missing.

It did. `IPV4` is the only logical descriptor that refines an already-complete physical type. `DATE32`, `TIMESTAMP64`, `DECIMAL` each have their own physical tag, so identity lives in the vector ABI and can't be lost. A `UINT32` that loses its `IPV4` label is still a well-formed integer column. Nothing fails.

Until it does: `CIDR_AGG` requires `IPV4`, so a dropped label turns a valid query into an error. That settled a question in the code — the descriptor is *carried*, not optional. A scan that sees an IPv4 column must attach it. The Parquet reader now does.

`.skene`, our format, never had this problem. It carries logical descriptors natively in the schema — because expressing types Parquet loses is why `.skene` exists. The descriptor comes from the file.

That asymmetry is the lesson: Skene's descriptor comes from the **file**; Parquet's from the **plan**. Only one can vanish.

---

## What isn't done

**IPv6 doesn't exist.** Not an oversight. A 128-bit address doesn't get the integer leverage above — it would be a new design, not an extension. Not written.

**`CREATE TABLE AS SELECT` doesn't yet round-trip the type.** The catalog persists broad categories, not exact types. An `IPV4` column comes back as integer. It's a one-line fix in the catalog service; the serializer exists. It hasn't landed. Reading existing IPv4 data works.

---

## The point

Adding a type isn't about the type. It's finding the representation under which the rest of the engine already works.

Addresses as `uint32` meant sort, group, join, compare, statistics and pruning were done before we started. What remained was four pieces of IP-specific code, one plan-time rewrite that turned a tight kernel into a scan that never runs, and one metadata question.

Find the representation that collapses the problem. Then find what you missed — usually metadata.

— Justin
