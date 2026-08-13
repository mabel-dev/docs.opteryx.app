---
title: CONCAT — Opteryx Function
description: Concatenates multiple string arguments into a single string.
---

# CONCAT

Concatenates multiple string arguments into a single string.

**Category:** String Functions

## Syntax

```sql
CONCAT(str1, str2, [strs...])
```

## Arguments

- **str1** `varchar`
    First input string value.
- **str2** `varchar`
    String input value.
- **strs** `varchar` [optional | variadic]
    String input value. Optional. Can be repeated.

## Returns

**VARCHAR** — Returns the computed result as `VARCHAR`.
**NVARCHAR** — Returns the computed result as `NVARCHAR`.
**VARBINARY** — Returns the computed result as `VARBINARY`.
