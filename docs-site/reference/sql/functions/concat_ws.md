---
title: CONCAT_WS — Opteryx Function
description: Concatenates strings with specified separator, skipping nulls.
---

# CONCAT_WS

Concatenates strings with specified separator, skipping nulls.

**Category:** String Functions

## Syntax

```sql
CONCAT_WS(separator, str1, [strs...])
```

## Arguments

- **separator** `varchar`
    String input value.
- **str1** `varchar`
    First string value to concatenate.
- **strs** `varchar` [optional | variadic]
    String input value. Optional. Can be repeated.

## Returns

**VARCHAR** — Returns the computed result as `VARCHAR`.
**NVARCHAR** — Returns the computed result as `NVARCHAR`.
**VARBINARY** — Returns the computed result as `VARBINARY`.
