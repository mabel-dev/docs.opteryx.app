---
title: NULLIF — Opteryx Function
description: Compares the two arguments and yields null when they are equal; otherwise preserves the first argument.
---

# NULLIF

Compares the two arguments and yields null when they are equal; otherwise preserves the first argument.

**Category:** Utility Functions

## Syntax

```sql
NULLIF(value, compare)
```

## Arguments

- **value** `any`
    A branch value. All branches must share one blendable family — all BOOLEAN, all string, or a numeric/temporal scalar mix. DECIMAL is not blendable; CAST it to DOUBLE first.
- **compare** `any`
    A branch value. All branches must share one blendable family — all BOOLEAN, all string, or a numeric/temporal scalar mix. DECIMAL is not blendable; CAST it to DOUBLE first.

## Returns

**same as `value`** — Returns a value with the same type as `value`.
