---
title: FLOOR — Opteryx Function
description: Calculates the largest integer less than or equal to the input.
---

# FLOOR

Calculates the largest integer less than or equal to the input.

**Category:** Numeric Functions

## Syntax

```sql
FLOOR(num, [scale...])
```

## Arguments

- **num** `number`
    Numeric value to round downward.
- **scale** `integer` [optional | variadic]
    Decimal scale to apply before taking the floor. Negative values round to tens, hundreds, and larger positions. Optional. Can be repeated.

## Returns

**FLOAT** — Returns the computed result as `FLOAT`.

## Usage Notes

When `scale` is provided, positive values affect digits to the right of the decimal point and negative values affect tens, hundreds, and larger positions.
