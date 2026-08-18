---
title: IPV4 — Opteryx Type
description: IPV4
---

# IPV4

An IPv4 address. Stored as an unsigned 32-bit integer and displayed in dotted-decimal notation. Because the storage is numeric, ordering, grouping, joining and comparison all operate on the underlying integer — and unsigned integer order is exactly IPv4 address order.

## Example

```sql
SELECT CAST('192.168.1.1' AS IPV4);
```

## Casting

| From | Example | Notes |
|------|---------|-------|
| varchar | `CAST(ip AS VARCHAR)` | Renders dotted-decimal. |
| uint32 | `CAST(ip AS UINT32)` | Exposes the raw address as an integer; no bits change. |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `ipv4`, `integer`.

## Operators

| Operator | Syntax | Description |
|----------|--------|-------------|
| [`<<=`](../operators/ipcontainedby) | `<address> <<= <network>` | IPv4 CIDR containment operator. |
| [`>>=`](../operators/ipcontains) | `<network> >>= <address>` | IPv4 CIDR containment operator, reversed. |

## Notes

Parquet has no IP type: an address column is stored as a plain uint32 and stays readable by tools that do not know about IPv4. The IPv4 typing comes from the Opteryx catalog, which records the column as IPV4 over that uint32.

## Limitations

- IPv4 only. There is no IPv6 type.
- Address text is parsed strictly: no shorthand forms such as `10.1` for `10.0.0.1`, and no leading zeros such as `010.0.0.1`. Both are rejected rather than guessed, because a parser and an access rule disagreeing about what an address means is a security bug.
- An address does not carry a prefix length (unlike a PostgreSQL `inet`). The prefix is always an operand of the operation that needs it — `ip <<= '10.0.0.0/8'`.

## See Also

- [Working with IPs](../advanced/adv-working-with-ips) — worked examples.
