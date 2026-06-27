---
title: RANDOM_STRING — Opteryx Function
description: Generate random strings.
---

# RANDOM_STRING

Generate random strings.

**Category:** Utility Functions

## Syntax

```
RANDOM_STRING(n)
```

## Arguments

- **n** `integer`
    Length hint or row count used to generate random strings.

## Returns

**varbinary** — Returns the computed result as `varbinary`.

## Usage Notes

This function is volatile. The integer argument controls the generated output rather than supplying a seed.
