---
title: Division — Opteryx Operator
description: Returns the quotient of two numeric operands. Symbol: /
---

# Division

Returns the quotient of two numeric operands.

**Category:** binary

**SQL symbol:** `/`

## Syntax

```sql
<dividend> / <divisor>
```

## Parameters

- **`<dividend>`** — The value to divide. Accepts [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md).
- **`<divisor>`** — The value to divide by. Accepts [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md).

## Returns

[`decimal`](../types/decimal.md), [`float`](../types/float.md)

## Examples

```sql
SELECT name, mass / diameter FROM $planets;
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

## See Also

- [Integer division `DIV`](myintegerdivide.md)
- [Modulo `%`](modulo.md)
- [Multiplication `*`](multiply.md)
