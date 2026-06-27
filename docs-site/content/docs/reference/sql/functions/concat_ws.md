---
title: CONCAT_WS — Opteryx Function
description: Concatenates strings with specified separator, skipping nulls.
---

# CONCAT_WS

Concatenates strings with specified separator, skipping nulls.

**Category:** String Functions

## Syntax

```
CONCAT_WS(separator, str1, [strs...])
```

## Arguments

- **separator** `varchar`
    String input value.
- **str1** `any`
    First string value to concatenate.
- **strs** `any` [optional | variadic]
    Input value of type `any`. Optional. Can be repeated.

## Returns

**varchar** — Returns the computed result as `varchar`.
