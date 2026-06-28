---
title: NORMAL — Opteryx Function
description: Computes normally-distributed random float(s).
---

# NORMAL

Computes normally-distributed random float(s).

**Category:** Utility Functions

## Syntax

```sql
NORMAL(n)
```

```sql
NORMAL()
```

## Arguments

- **n** `integer`
    Number of random values to generate.

## Returns

**FLOAT** — Returns the computed result as `FLOAT`.

## Usage Notes

This function is volatile. The integer argument controls how many values are generated, not a seed.
