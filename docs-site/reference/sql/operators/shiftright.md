---
title: Right shift — Opteryx Operator
description: Shifts the bits of the left integer operand right by the number of positions in the right operand. Symbol: >>
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Right shift

Shifts the bits of the left integer operand right by the number of positions in the right operand.

**Category:** bitwise

**SQL symbol:** `>>`

## Syntax

```sql
<value> >> <count>
```

## Parameters

- **`<value>`** — The integer whose bits are shifted. The shift is arithmetic, so the sign is preserved. Accepts [`integer`](../types/integer).
- **`<count>`** — How many positions to shift by, 0..63. Accepts [`integer`](../types/integer).

## Returns

[`integer`](../types/integer)

## Examples

```sql
SELECT 256 >> 4, -1 >> 1;
```

```
16 | -1
```

## Signatures

- `integer >> integer` → integer

## Notes

Right shift is ARITHMETIC, not logical: the sign bit is copied, so `-1 >> 1` is -1 and a negative value never becomes positive by shifting. The shift count must be 0..63 - the operands are 64-bit integers, and a count outside that range fails loud ('bitwise_shr: shift count out of range') rather than wrapping or saturating.

## See Also

- [Left shift `<<`](shiftleft)
- [Bitwise AND `&`](bitwiseand)
