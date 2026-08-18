---
title: IP contains — Opteryx Operator
description: Returns true when the network on the left, in CIDR notation, contains the IPv4 address on the right, for example `'10.0.0.0/8' >>= ip`. The mirror of `<<=`. Symbol: >>=
---

# IP contains

Returns true when the network on the left, in CIDR notation, contains the IPv4 address on the right, for example `'10.0.0.0/8' >>= ip`. The mirror of `<<=`.

**Category:** comparison

**SQL symbol:** `>>=`

## Syntax

```sql
<network> >>= <address>
```

## Parameters

- **`<network>`** — The network to test against, in CIDR notation. Accepts [`varchar`](../types/varchar.md).
- **`<address>`** — An IPv4 address. It is held as its 32-bit integer value, which is why the signature below reads INTEGER. Accepts [`integer`](../types/integer.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT '10.0.0.0/8' >>= CAST('10.0.0.1' AS IPV4);
```

## Signatures

- `varchar >>= integer` → boolean

## Notes

Spelling follows PostgreSQL, CockroachDB and DuckDB's inet extension.

## See Also

- [IP contained by `<<=`](ipcontainedby.md)
