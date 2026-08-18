---
title: Multiplication — Opteryx Operator
description: Returns the product of two numeric operands. Symbol: *
---

# Multiplication

Returns the product of two numeric operands.

**Category:** binary

**SQL symbol:** `*`

## Syntax

```sql
<left> * <right>
```

## Parameters

- **`<left>`** — A numeric value. Accepts [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md).
- **`<right>`** — A numeric value. The result takes the wider of the two types - see Signatures. Accepts [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md).

## Returns

[`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md)

## Examples

```sql
SELECT name, diameter * 2 FROM $planets LIMIT 3;
```

```
Mercury | 9758
Venus | 24208
Earth | 25512
```

## Signatures

- `decimal * decimal` → decimal
- `decimal * float` → float
- `decimal * integer` → decimal
- `float * decimal` → float
- `float * float` → float
- `float * integer` → float
- `integer * decimal` → decimal
- `integer * float` → float
- `integer * integer` → integer

## See Also

- [Division `/`](divide.md)
- [Addition `+`](plus.md)
- [Subtraction `-`](minus.md)
