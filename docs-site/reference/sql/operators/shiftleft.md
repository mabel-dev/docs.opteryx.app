---
title: Left shift — Opteryx Operator
description: Shifts the bits of the left integer operand left by the number of positions in the right operand. Symbol: <<
---

# Left shift

Shifts the bits of the left integer operand left by the number of positions in the right operand.

**Category:** bitwise

**SQL symbol:** `<<`

## Syntax

```sql
<value> << <count>
```

## Parameters

- **`<value>`** — The integer whose bits are shifted. Accepts [`integer`](../types/integer.md).
- **`<count>`** — How many positions to shift by, 0..63. Accepts [`integer`](../types/integer.md).

## Returns

[`integer`](../types/integer.md)

## Examples

```sql
SELECT 1 << 4;
```

## Signatures

- `integer << integer` → integer

## Notes

The shift count must be 0..63 - the operands are 64-bit integers, and a count outside that range fails loud ('bitwise_shl: shift count out of range') rather than wrapping or saturating.

## See Also

- [Right shift `>>`](shiftright.md)
- [Bitwise AND `&`](bitwiseand.md)
