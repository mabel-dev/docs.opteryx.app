---
title: RANDOM_STRING — Opteryx Function
description: Generate random strings.
---

# RANDOM_STRING

Generate random strings.

**Category:** Utility Functions

## Syntax

```sql
RANDOM_STRING(n)
```

## Arguments

- **n** `integer`
    Length hint or row count used to generate random strings.

## Returns

**VARBINARY** — Returns the computed result as `VARBINARY`.

## Usage Notes

This function is volatile. The integer argument controls the generated output rather than supplying a seed.
