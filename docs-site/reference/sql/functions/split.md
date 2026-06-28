---
title: SPLIT — Opteryx Function
description: Splits a string into an array using the specified delimiter.
---

# SPLIT

Splits a string into an array using the specified delimiter.

**Category:** String Functions

## Syntax

```sql
SPLIT(string, delimiter)
```

```sql
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

**ARRAY<VARIANT>** — Returns the computed result as `ARRAY<VARIANT>`.
