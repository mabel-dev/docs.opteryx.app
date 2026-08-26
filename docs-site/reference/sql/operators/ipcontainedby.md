---
title: IP contained by — Opteryx Operator
description: Returns true when the left IPv4 address falls inside the network given on the right in CIDR notation, for example `ip <<= '10.0.0.0/8'`. Comparison is on the underlying 32-bit address, so it is a single mask-and-compare per row with no text parsing. Symbol: <<=
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# IP contained by

Returns true when the left IPv4 address falls inside the network given on the right in CIDR notation, for example `ip <<= '10.0.0.0/8'`. Comparison is on the underlying 32-bit address, so it is a single mask-and-compare per row with no text parsing.

**Category:** comparison

**SQL symbol:** `<<=`

## Syntax

```sql
<address> <<= <network>
```

## Parameters

- **`<address>`** — An IPv4 address. It is held as its 32-bit integer value, which is why the signature below reads INTEGER. Accepts [`integer`](../types/integer).
- **`<network>`** — The network to test against, in CIDR notation. The prefix length is required: an address without one is rejected. Accepts [`varchar`](../types/varchar).

## Returns

[`boolean`](../types/boolean)

## Examples

```sql
SELECT CAST('10.0.0.1' AS IPV4) <<= '10.0.0.0/8';
```

```
true
```

## Signatures

- `integer <<= varchar` → boolean

## Notes

Spelling follows PostgreSQL, CockroachDB and DuckDB's inet extension. A NULL address is not contained by any network and yields false. An invalid or prefix-less CIDR raises rather than matching nothing.

## See Also

- [IP contains `>>=`](ipcontains)
- [NULL semantics](../advanced/adv-null-semantics)
