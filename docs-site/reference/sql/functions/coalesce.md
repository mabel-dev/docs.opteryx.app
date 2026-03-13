---
title: COALESCE — Opteryx Function
description: Selects the first non-null value from the list of arguments.
---

# COALESCE

Selects the first non-null value from the list of arguments.

**Category:** Utility Functions

## Syntax

```
COALESCE(arg0, [args...])
```

## Arguments

- **arg0** `any`
    First input value.
- **args** `any` [optional | variadic]
    Additional input values. Optional. Can be repeated.

## Returns

**compatible input type** — Returns the first non-null argument using a type compatible with the supplied values.
