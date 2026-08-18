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

- **`<dividend>`** — The value to divide. Accepts [`float`](../types/float.md), [`integer`](../types/integer.md).
- **`<divisor>`** — The value to divide by. Accepts [`integer`](../types/integer.md).

## Returns

[`float`](../types/float.md), [`integer`](../types/integer.md)

## Examples

```sql
SELECT 7 % 2;
```

## Signatures

- `float % integer` → float
- `integer % integer` → integer

## See Also

- [Division `/`](divide.md)
- [Integer division `DIV`](myintegerdivide.md)
