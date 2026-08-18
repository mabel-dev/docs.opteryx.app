---
title: Addition — Opteryx Operator
description: Returns the sum of two numeric or interval-compatible operands. Symbol: +
---

# Addition

Returns the sum of two numeric or interval-compatible operands.

**Category:** binary

**SQL symbol:** `+`

## Syntax

```sql
<left> + <right>
```

## Parameters

- **`<left>`** — The value to add to. Accepts [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`timestamp`](../types/timestamp.md).
- **`<right>`** — The value to add. Accepts [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`timestamp`](../types/timestamp.md).

## Returns

[`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`timestamp`](../types/timestamp.md)

## Examples

```sql
SELECT name, number_of_moons + 1 FROM $planets;
```

```sql
SELECT CAST('2026-01-01' AS DATE) + INTERVAL '1' MONTH;
```

## Signatures

- `date + interval` → timestamp
- `decimal + decimal` → decimal
- `decimal + float` → float
- `decimal + integer` → decimal
- `float + decimal` → float
- `float + float` → float
- `float + integer` → float
- `integer + decimal` → decimal
- `integer + float` → float
- `integer + integer` → integer
- `interval + date` → timestamp
- `interval + interval` → interval
- `interval + timestamp` → timestamp
- `timestamp + interval` → timestamp

## See Also

- [Subtraction `-`](minus.md)
- [Multiplication `*`](multiply.md)
- [Division `/`](divide.md)
