---
title: SUBSTRING — Opteryx Function
description: Extracts a substring starting at the specified position with optional length.
---

# SUBSTRING

Extracts a substring starting at the specified position with optional length.

**Category:** String Functions

## Syntax

```
SUBSTRING(str FROM start)
```

```
SUBSTRING(str FROM start FOR length)
```

## Arguments

- **string** `varchar`
    String input value.
- **from_pos** `integer`
    Integer input value.
- **count** `integer`
    Integer input value.

## Returns

**varchar** — Returns the computed result as `varchar`.

## Usage Notes

Canonical SQL-92 form is `SUBSTRING(str FROM start FOR length)`. Opteryx also accepts `SUBSTRING(str[, start[, length]])`.
