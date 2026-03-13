---
title: CEILING — Opteryx Function
description: Calculates the smallest integer greater than or equal to the input.
---

# CEILING

Calculates the smallest integer greater than or equal to the input.

**Category:** Numeric Functions

## Syntax

```
CEILING(num, [scale...])
```

## Arguments

- **num: number** — Numeric value to round upward.
- **scale: integer** — Decimal scale to apply before taking the ceiling. Negative values round to tens, hundreds, and larger positions. Optional. Can be repeated.

## Returns

**double** — Returns the computed result as `double`.

## Usage Notes

When `scale` is provided, positive values affect digits to the right of the decimal point and negative values affect tens, hundreds, and larger positions.
