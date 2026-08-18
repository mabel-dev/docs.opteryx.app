---
title: Subtraction — Opteryx Operator
description: Returns the difference between two numeric, date, timestamp, or interval-compatible operands. Symbol: -
---

# Subtraction

Returns the difference between two numeric, date, timestamp, or interval-compatible operands.

**Category:** binary

**SQL symbol:** `-`

## Syntax

```sql
<left> - <right>
```

## Parameters

- **`<left>`** — The value to subtract from. Accepts [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`timestamp`](../types/timestamp.md).
- **`<right>`** — The value to subtract. Accepts [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`timestamp`](../types/timestamp.md).

## Returns

[`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`timestamp`](../types/timestamp.md)

## Examples

```sql
SELECT name, aphelion - perihelion FROM $planets;
```

## Signatures

- `date - date` → interval
- `date - interval` → timestamp
- `date - timestamp` → interval
- `decimal - decimal` → decimal
- `decimal - float` → float
- `decimal - integer` → decimal
- `float - decimal` → float
- `float - float` → float
- `float - integer` → float
- `integer - decimal` → decimal
- `integer - float` → float
- `integer - integer` → integer
- `interval - date` → timestamp
- `interval - interval` → interval
- `interval - timestamp` → timestamp
- `timestamp - date` → interval
- `timestamp - interval` → timestamp
- `timestamp - timestamp` → interval

## See Also

- [Addition `+`](plus.md)
- [Multiplication `*`](multiply.md)
- [Division `/`](divide.md)
