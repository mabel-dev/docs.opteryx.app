---
title: ROUND — Opteryx Function
description: Rounds input number to nearest integer or specified decimal places.
---

# ROUND

Rounds input number to nearest integer or specified decimal places.

**Category:** Numeric Functions

## Syntax

```
ROUND(num, [precision...])
```

## Arguments

- **num** `number`
    Numeric value to round.
- **precision** `integer` [optional | variadic]
    Number of decimal places to keep. Negative values round to tens, hundreds, and larger positions. Optional. Can be repeated.

## Returns

**double** — Returns the computed result as `double`.

## Usage Notes

Uses PyArrow's default half-to-even rule to break ties when a value falls exactly between two candidates.
