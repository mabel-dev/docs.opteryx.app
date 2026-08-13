---
title: IFNULL — Opteryx Function
description: Selects the first argument when it is not null; otherwise uses the second argument.
---

# IFNULL

Selects the first argument when it is not null; otherwise uses the second argument.

**Category:** Utility Functions

## Syntax

```sql
IFNULL(value, default)
```

## Arguments

- **value** `any`
    A branch value. All branches must share one blendable family — all BOOLEAN, all string, or a numeric/temporal scalar mix. DECIMAL is not blendable; CAST it to DOUBLE first.
- **default** `any`
    A branch value. All branches must share one blendable family — all BOOLEAN, all string, or a numeric/temporal scalar mix. DECIMAL is not blendable; CAST it to DOUBLE first.

## Returns

**compatible input type** — Returns either the primary value or the fallback value using a type compatible with both arguments.
