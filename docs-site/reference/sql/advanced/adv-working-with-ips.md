---
title: Working with IP Addresses in Opteryx - SQL IP Functions
description: Query and manipulate IPv4 addresses in Opteryx. Perform CIDR containment testing and comparisons with SQL.
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
- The CIDR operand of `<<=` / `>>=` is a string literal; there is no CIDR/network type.
