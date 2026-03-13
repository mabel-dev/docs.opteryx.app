---
title: POSITION — Opteryx Function
description: Find position of substring.
---

# POSITION

Find position of substring.

**Category:** String Functions

## Syntax

```
POSITION(needle IN haystack)
```

## Arguments

- **needle: varchar** — Substring to search for.
- **haystack: varchar** — String to search within.

## Returns

**integer** — Returns the computed result as `integer`.

## Usage Notes

Canonical SQL-92 form is `POSITION(needle IN haystack)`. Opteryx also accepts `POSITION(needle, haystack)`.
