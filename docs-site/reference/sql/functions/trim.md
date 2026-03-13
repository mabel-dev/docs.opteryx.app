---
title: TRIM — Opteryx Function
description: Trim leading and trailing characters.
---

# TRIM

Trim leading and trailing characters.

**Category:** String Functions

## Syntax

```
TRIM([BOTH|LEADING|TRAILING] [chars] FROM str)
```

## Arguments

- **str: varchar** — Input string value.
- **chars: varchar** — Characters to remove from the input string. Optional.

## Returns

**varchar** — Returns the computed result as `varchar`.

## Usage Notes

Canonical SQL-92 form is `TRIM([BOTH|LEADING|TRAILING] [chars] FROM str)`. Opteryx also accepts `TRIM(str[, chars])` as well as `LTRIM` and `RTRIM`.
