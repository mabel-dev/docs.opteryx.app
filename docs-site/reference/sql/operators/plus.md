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

- **`<left>`** — The value to add to. A DATE or TIMESTAMP is accepted only with an INTERVAL on the other side - two dates cannot be added. Accepts [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`timestamp`](../types/timestamp.md).
- **`<right>`** — The value to add. Mixing numeric types widens the result: INTEGER with FLOAT gives FLOAT, INTEGER with DECIMAL gives DECIMAL. Accepts [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`timestamp`](../types/timestamp.md).

## Returns

[`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`timestamp`](../types/timestamp.md)

## Examples

```sql
SELECT name, number_of_moons + 1 FROM $planets LIMIT 3;
```

```
Mercury | 1
Venus | 1
Earth | 2
```

```sql
SELECT CAST('2026-01-01' AS DATE) + INTERVAL '1' MONTH;
```

```
2026-02-01 00:00:00+00:00
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

## Notes

Adding NULL gives NULL. Date arithmetic is only ever date-plus-interval, and the result is a TIMESTAMP even when the operand was a DATE - see Signatures.

## See Also

- [Subtraction `-`](minus.md)
- [Multiplication `*`](multiply.md)
- [Division `/`](divide.md)
