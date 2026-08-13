---
title: COALESCE — Opteryx Function
description: Selects the first non-null value from the list of arguments.
---

# COALESCE

Selects the first non-null value from the list of arguments.

**Category:** Utility Functions

## Syntax

```sql
COALESCE(arg0, [args...])
```

## Arguments

- **arg0** `any`
    A branch value. All branches must share one blendable family — all BOOLEAN, all string, or a numeric/temporal scalar mix. DECIMAL is not blendable; CAST it to DOUBLE first.
- **args** `any` [optional | variadic]
    Further branch values, of the same blendable family as `arg0`. Optional. Can be repeated.

## Returns

**compatible input type** — Returns the first non-null argument using a type compatible with the supplied values.
