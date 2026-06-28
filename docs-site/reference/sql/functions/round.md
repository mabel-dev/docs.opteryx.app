---
title: ROUND — Opteryx Function
description: Rounds input number to nearest integer or specified decimal places.
---

# ROUND

Rounds input number to nearest integer or specified decimal places.

**Category:** Numeric Functions

## Syntax

```sql
ROUND(num)
```

```sql
ROUND(num, precision)
```

## Arguments

- **num** `number`
    Numeric value to round.
- **precision** `integer`
    Number of decimal places to keep. Negative values round to tens, hundreds, and larger positions.

## Returns

**FLOAT** — Returns the computed result as `FLOAT`.

## Usage Notes

Uses PyArrow's default half-to-even rule to break ties when a value falls exactly between two candidates.
