---
title: FLOOR — Opteryx Function
description: Calculates the largest integer less than or equal to the input.
---

# FLOOR

Calculates the largest integer less than or equal to the input.

**Category:** Numeric Functions

## Syntax

```
FLOOR(num, [scale...])
```

## Arguments

- **num: number** — Numeric value to round downward.
- **scale: integer** — Decimal scale to apply before taking the floor. Negative values round to tens, hundreds, and larger positions. Optional. Can be repeated.

## Returns

**double** — Returns the computed result as `double`.

## Usage Notes

When `scale` is provided, positive values affect digits to the right of the decimal point and negative values affect tens, hundreds, and larger positions.
