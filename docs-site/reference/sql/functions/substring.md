---
title: SUBSTRING — Opteryx Function
description: Extracts a substring starting at the given position, with an optional length.
---

# SUBSTRING

Extracts a substring starting at the given position, with an optional length.

**Category:** String Functions

## Syntax

```
SUBSTRING(str FROM start)
```

```
SUBSTRING(str FROM start FOR length)
```

## Arguments

- **str** `varchar`
    Input string to extract a substring from.
- **start** `integer`
    One-based starting position of the substring.
- **length** `integer`
    Integer input value.

## Returns

**varchar** — Returns the computed result as `varchar`.

## Usage Notes

Canonical SQL-92 form is `SUBSTRING(str FROM start FOR length)`. Opteryx also accepts `SUBSTRING(str[, start[, length]])`.
