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

- **`<dividend>`** — The value to divide. Two integers still divide to a FLOAT - use `DIV` for integer division. Accepts [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md).
- **`<divisor>`** — The value to divide by. Dividing by zero yields infinity rather than raising, because the result is floating point. Accepts [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md).

## Returns

[`decimal`](../types/decimal.md), [`float`](../types/float.md)

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

## Notes

`/` is true division: `5 / 2` is 2.5, never 2. A DECIMAL operand keeps the result DECIMAL; every other combination gives FLOAT, and `1 / 0` is therefore `inf` rather than an error.

## See Also

- [Integer division `DIV`](myintegerdivide.md)
- [Modulo `%`](modulo.md)
- [Multiplication `*`](multiply.md)
