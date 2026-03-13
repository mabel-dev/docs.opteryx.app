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

- **n: integer** — Length hint or row count used to generate random strings.

## Returns

**blob** — Returns the computed result as `blob`.

## Usage Notes

This function is volatile. The integer argument controls the generated output rather than supplying a seed.
