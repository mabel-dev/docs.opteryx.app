---
title: Left shift — Opteryx Operator
description: Shifts the bits of the left integer operand left by the number of positions in the right operand. Symbol: <<
---

# Left shift

Shifts the bits of the left integer operand left by the number of positions in the right operand.

**Category:** bitwise

**SQL symbol:** `<<`

## Notes

The shift count must be 0..63 - the operands are 64-bit integers, and a count outside that range fails loud ('bitwise_shl: shift count out of range') rather than wrapping or saturating.
