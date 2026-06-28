---
title: TRIM — Opteryx Function
description: Removes leading and trailing whitespace from string.
---

# TRIM

Removes leading and trailing whitespace from string.

**Category:** String Functions

## Syntax

```sql
TRIM([BOTH|LEADING|TRAILING] [chars] FROM str)
```

## Arguments

- **string** `varchar`
    String input value.

## Returns

**dynamic** — Returns a value whose type depends on the supplied arguments.

## Usage Notes

Canonical SQL-92 form is `TRIM([BOTH|LEADING|TRAILING] [chars] FROM str)`. Opteryx also accepts `TRIM(str[, chars])` as well as `LTRIM` and `RTRIM`.
