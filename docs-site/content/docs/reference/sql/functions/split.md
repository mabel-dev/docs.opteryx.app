---
title: SPLIT — Opteryx Function
description: Splits a string into an array using the specified delimiter.
---

# SPLIT

Splits a string into an array using the specified delimiter.

**Category:** String Functions

## Syntax

```
SPLIT(string, delimiter)
```

```
SPLIT(string, delimiter, limit)
```

## Arguments

- **string** `varchar`
    String input value.
- **delimiter** `varchar`
    Separator used to split the input string.
- **limit** `integer`
    Maximum number of items or splits to return.

## Returns

**array<variant>** — Returns the computed result as `array<variant>`.
