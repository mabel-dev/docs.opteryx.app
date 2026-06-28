---
title: POSITION — Opteryx Function
description: Computes the starting position (1-based) of substring in string, or 0 if not found.
---

# POSITION

Computes the starting position (1-based) of substring in string, or 0 if not found.

**Category:** String Functions

## Syntax

```sql
POSITION(needle IN haystack)
```

## Arguments

- **sub** `varchar`
    String input value.
- **string** `varchar`
    String input value.

## Returns

**INTEGER** — Returns the computed result as `INTEGER`.

## Usage Notes

Canonical SQL-92 form is `POSITION(needle IN haystack)`. Opteryx also accepts `POSITION(needle, haystack)`.
