---
title: Division — Opteryx Operator
description: Returns the quotient of two numeric operands, or divides an INTERVAL by a number. Symbol: /
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Division

Returns the quotient of two numeric operands, or divides an INTERVAL by a number.

**Category:** binary

**SQL symbol:** `/`

**Precedence:** level 4 of 15 (1 binds tightest) — see [operator precedence](../operators#operator-precedence).

## Syntax

```sql
<dividend> / <divisor>
```

## Parameters

- **`<dividend>`** — The value to divide: a number or an INTERVAL. Two integers still divide to a FLOAT - use `DIV` for integer division. Accepts [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer), [`interval`](../types/interval).
- **`<divisor>`** — The number to divide by. Dividing a number by zero yields infinity rather than raising, because the result is floating point; dividing an INTERVAL by zero is an error. A number cannot be divided by an INTERVAL. Accepts [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer).

## Returns

[`decimal`](../types/decimal), [`float`](../types/float), [`interval`](../types/interval)

## Examples

```sql
SELECT 5 / 2;
```

```
2.5
```

```sql
SELECT CAST(1 AS DECIMAL(10,2)) / 3;
```

```
0.33333333
```

```sql
SELECT CAST('2026-01-01' AS TIMESTAMP) + INTERVAL '1' MONTH / 2;
```

```
2026-01-16 00:00:00+00:00
```

## Signatures

- `decimal / decimal` → decimal
- `decimal / float` → float
- `decimal / integer` → decimal
- `float / decimal` → float
- `float / float` → float
- `float / integer` → float
- `integer / decimal` → decimal
- `integer / float` → float
- `integer / integer` → float
- `interval / float` → interval
- `interval / integer` → interval

## Notes

`/` is true division: `5 / 2` is 2.5, never 2. A DECIMAL operand keeps the result DECIMAL; every other numeric combination gives FLOAT, and `1 / 0` is therefore `inf` rather than an error. An INTERVAL divided by a number is an INTERVAL: whole months divide, and the remainder spills into days at 30 days per month, so `INTERVAL '1' MONTH / 2` is 15 days and `INTERVAL '2' YEAR / 3` is 8 months.

## See Also

- [Integer division `DIV`](myintegerdivide)
- [Modulo `%`](modulo)
- [Multiplication `*`](multiply)
