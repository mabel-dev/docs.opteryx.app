---
title: POSITION — Opteryx Function
description: Computes the starting position (1-based) of substring in string, or 0 if not found.
---

# POSITION

Computes the starting position (1-based) of substring in string, or 0 if not found.

**Category:** String Functions

## Syntax

```
POSITION(needle IN haystack)
```

## Arguments

- **sub** `varchar`
    String input value.
- **string** `varchar`
    String input value.

## Returns

**int64** — Returns the computed result as `int64`.

## Usage Notes

Canonical SQL-92 form is `POSITION(needle IN haystack)`. Opteryx also accepts `POSITION(needle, haystack)`.
