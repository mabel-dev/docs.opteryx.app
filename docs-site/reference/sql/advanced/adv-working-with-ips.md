---
title: Working with IP Addresses in Opteryx - SQL IP Functions
description: Query and manipulate IPv4 addresses in Opteryx. CIDR containment testing, network truncation, summarising addresses into CIDR blocks, and expanding blocks back into addresses.
---

# Working with IPs

Opteryx has a dedicated [`IPV4`](/docs/reference/sql/types/ipv4) type. An IPv4 address is
stored as an unsigned 32-bit integer and displayed in dotted-decimal notation. Because the
storage is numeric, ordering, grouping, joining and comparison all operate on the
underlying integer — and unsigned integer order is exactly IPv4 address order.

## Creating IPv4 Values

Cast a string literal or column to `IPV4`:

~~~sql
SELECT CAST('192.168.1.1' AS IPV4);
SELECT '192.168.1.1'::IPV4;
~~~

## Containment Testing

Two operators test CIDR membership. The **address side must be `IPV4`-typed** — a plain
`VARCHAR` is rejected, because containment is a mask-and-compare on the 32-bit address,
not a string operation.

| Operator | Meaning |
|----------|---------|
| [`<<=`](/docs/reference/sql/operators/ipcontainedby) | Left address is inside the right network |
| [`>>=`](/docs/reference/sql/operators/ipcontains) | Left network contains the right address |

~~~sql
SELECT '192.168.0.1'::IPV4 <<= '192.168.0.0/24';   -- true
SELECT '10.1.2.3'::IPV4    <<= '192.168.0.0/24';   -- false
~~~

Against a column, cast in the filter:

~~~sql
SELECT *
  FROM network_logs
 WHERE ip_address::IPV4 <<= '10.0.0.0/8';
~~~

The right-hand side is CIDR notation written as a string literal. A `NULL` address is not
contained by any network and yields false. An invalid or prefix-less CIDR raises rather
than quietly matching nothing.

> Warning: `|` is **bitwise OR**, not containment. `ip | '10.0.0.0/8'` does not test membership — it is rejected as a type error, because bitwise OR takes integer operands. Use `<<=`.

## Network Addresses

[`IP_TRUNC`](/docs/reference/sql/functions/ip_trunc) applies a network mask, returning the
network address for a given prefix length. It is a bitwise AND with the netmask, so it is
the natural way to bucket traffic by subnet:

~~~sql
SELECT IP_TRUNC('192.168.1.130'::IPV4, 24);   -- 192.168.1.0
~~~

The prefix is an argument rather than a property of the value, because an Opteryx `IPV4`
carries no prefix length of its own (unlike a PostgreSQL `inet`). Grouping by the truncated
address gives per-subnet rollups:

~~~sql
SELECT IP_TRUNC(ip_address::IPV4, 24) AS subnet,
       COUNT(*)                       AS events
  FROM network_logs
 GROUP BY IP_TRUNC(ip_address::IPV4, 24)
 ORDER BY events DESC;
~~~

## Summarising Addresses into CIDR Blocks

`CIDR_AGG` is an [aggregate](/docs/reference/sql/aggregates) that collapses a set of
addresses into the **smallest list of CIDR blocks covering exactly those addresses**. It
returns `ARRAY<VARCHAR>`, ascending and non-overlapping:

~~~sql
SELECT CIDR_AGG(ip_address::IPV4) AS blocks
  FROM network_logs;
~~~

Adjacent addresses fold into the largest aligned block, so nine consecutive addresses
collapse to two blocks rather than nine:

~~~sql
-- addresses 10.0.0.0 through 10.0.0.8
-- returns ['10.0.0.0/29', '10.0.0.8/32']
~~~

The cover is **minimal and unique** — there is exactly one right answer for any set of
addresses, so the result does not depend on input order or on how the query was
parallelised.

Works with or without `GROUP BY`. Grouped, it gives one block list per group, which is the
usual shape for turning observed traffic into an allowlist candidate:

~~~sql
SELECT tenant_id,
       CIDR_AGG(ip_address::IPV4) AS observed_blocks
  FROM network_logs
 GROUP BY tenant_id;
~~~

Behaviour worth knowing:

- **The operand must be `IPV4`.** A plain integer column is rejected. The `IPV4` descriptor
  is the only thing distinguishing an address from any other 32-bit number, and without it
  the function would fold ids or counts into well-formed but entirely fictional networks.
- **Duplicate addresses are free.** The set deduplicates as it collects, so repeated
  addresses cost nothing and do not change the answer.
- **`NULL` is not a member.** A group whose addresses are all `NULL` returns an *empty
  array*, not `NULL` — the answer to "which addresses did this group hold" is a set, and the
  empty set is a real answer.
- **Two memory ceilings, reported separately.** `@@cidr_agg_state_budget_bytes` bounds the
  collected address set; `@@cidr_agg_emit_budget_bytes` bounds the emitted text. Neither
  follows from the other, and exceeding either raises rather than returning a truncated
  list. See [Variables](/docs/reference/sql/variables).

Because the state deduplicates, its size grows with the number of **distinct** addresses,
not with the number of rows read — so summarising a billion log lines covering ten thousand
addresses is cheap.

## Expanding CIDR Blocks into Addresses

`CIDR_UNNEST` is the inverse: a join form that expands each CIDR block into one row per
address it covers. It sits in the `CROSS JOIN` position, alongside `UNNEST`:

~~~sql
SELECT ip
  FROM $no_table
 CROSS JOIN CIDR_UNNEST('10.0.0.0/29') AS ip;
~~~

The expanded column is `IPV4`, so it composes with everything above — containment, ordering,
joins, and `CIDR_AGG` itself:

~~~sql
SELECT CIDR_AGG(ip)
  FROM $no_table
 CROSS JOIN CIDR_UNNEST('10.0.0.0/29') AS ip;
-- returns ['10.0.0.0/29'] — the round trip
~~~

Against a column of blocks — expanding an allowlist so it can be joined against traffic:

~~~sql
SELECT l.*
  FROM network_logs AS l
 INNER JOIN (
         SELECT ip
           FROM allowlist AS a
          CROSS JOIN CIDR_UNNEST(a.block) AS ip
       ) AS allowed
    ON l.ip_address::IPV4 = allowed.ip;
~~~

Expansion is **streamed**, not materialised: memory stays flat regardless of prefix length,
so a `/8` does not build a 16-million-element intermediate. What it does produce is rows —
a `/8` is 16,777,216 of them and a `/0` is 4,294,967,296 — so bound the result with a
`WHERE` clause or `LIMIT` when exploring. There is no minimum prefix length; a `/0` is
allowed, because any floor would be an arbitrary limit and a caller who means `/0` is not
making a mistake the engine can detect.

Block parsing is **strict**. Shorthand forms and leading zeros are rejected rather than
guessed at, because an access control list and a parser disagreeing about what `010.1` means
is a well-known source of security bugs:

~~~sql
CROSS JOIN CIDR_UNNEST('10.0.0.0/24')    -- ok
CROSS JOIN CIDR_UNNEST('010.0.0.0/24')   -- raises: leading zero
CROSS JOIN CIDR_UNNEST('10.0.0.0/33')    -- raises: prefix out of range
CROSS JOIN CIDR_UNNEST('10.0.0.0')       -- raises: no prefix
~~~

A `NULL` block contributes no rows, matching `CROSS JOIN UNNEST` over a `NULL` array.

## Comparison and Ordering

`IPV4` values compare, sort and group on the underlying integer, so ordering is true
address order:

~~~sql
SELECT ip_address
  FROM network_logs
 WHERE ip_address::IPV4 = '192.168.0.1'::IPV4
 ORDER BY ip_address::IPV4;
~~~

## Casting

| From / To | Example | Notes |
|-----------|---------|-------|
| `VARCHAR` → `IPV4` | `'192.168.1.1'::IPV4` | Parses dotted-decimal |
| `IPV4` → `VARCHAR` | `CAST(ip AS VARCHAR)` | Renders dotted-decimal |
| `IPV4` → `UINT32` | `CAST(ip AS UINT32)` | Exposes the raw address; no bits change |

## Limitations

- IPv6 is not supported; `IPV4` is a 32-bit address type.
- Arithmetic on addresses is not supported — cast to `UINT32` to compute on the raw value.
- The CIDR operand of `<<=` / `>>=` is a string literal; there is no CIDR/network type. CIDR
  blocks are text everywhere they appear, including `CIDR_AGG` output and `CIDR_UNNEST`
  input, which is what makes the round trip between them work.
- `CIDR_AGG` and `CIDR_UNNEST` operate on IPv4 only, and `CIDR_AGG` requires its operand to
  already be `IPV4`-typed.
