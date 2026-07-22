---
title: RANDOM_STRING — Opteryx Function
description: Computes n random bytes as varbinary, one value per row.
---

# RANDOM_STRING

Computes n random bytes as varbinary, one value per row.

**Category:** Utility Functions

## Syntax

```sql
RANDOM_STRING(n)
```

## Arguments

- **n** `integer`
    Number of random bytes to generate for each row.

## Returns

**VARBINARY** — Returns the computed result as `VARBINARY`.

## Usage Notes

This function is volatile. It returns `n` random bytes as `VARBINARY` for each row; the integer argument is the byte length, not a seed.
