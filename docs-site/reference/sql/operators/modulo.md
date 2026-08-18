---
title: Modulo — Opteryx Operator
description: Returns the remainder after division of the left numeric operand by the right numeric operand. Symbol: %
---

# Modulo

Returns the remainder after division of the left numeric operand by the right numeric operand.

**Category:** binary

**SQL symbol:** `%`

## Syntax

```sql
<dividend> % <divisor>
```

## Parameters

- **`<dividend>`** — The value to divide. Its sign is the sign of the result. Accepts [`float`](../types/float.md), [`integer`](../types/integer.md).
- **`<divisor>`** — The value to divide by. Accepts [`integer`](../types/integer.md).

## Returns

[`float`](../types/float.md), [`integer`](../types/integer.md)

## Examples

```sql
SELECT 7 % 2, -7 % 2, 7 % -2;
```

```
1 | -1 | 1
```

## Signatures

- `float % integer` → float
- `integer % integer` → integer

## Notes

The remainder takes the sign of the DIVIDEND, not the divisor: `-7 % 2` is -1 and `7 % -2` is 1. That is C and Go's rule, not Python's, where `-7 % 2` is 1.

## See Also

- [Division `/`](divide.md)
- [Integer division `DIV`](myintegerdivide.md)
