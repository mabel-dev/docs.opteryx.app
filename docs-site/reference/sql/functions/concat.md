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

- **str1** `any`
    First input string value.
- **str2** `any`
    Input value of type `any`.
- **strs** `any` [optional | variadic]
    Input value of type `any`. Optional. Can be repeated.

## Returns

**VARCHAR** — Returns the computed result as `VARCHAR`.
