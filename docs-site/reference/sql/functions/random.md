---
title: RANDOM — Opteryx Function
description: Computes uniform random float(s) in [0, 1).
---

# RANDOM

Computes uniform random float(s) in [0, 1).

**Category:** Utility Functions

## Syntax

```
RANDOM(n)
```

```
RANDOM()
```

## Arguments

- **n** `integer`
    Number of random values to generate.

## Returns

**float64** — Returns the computed result as `float64`.

## Usage Notes

This function is volatile. The integer argument controls how many values are generated, not a seed.
