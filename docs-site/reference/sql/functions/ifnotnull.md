---
title: IFNOTNULL — Opteryx Function
description: Selects the second argument when the first argument is not null; otherwise yields null.
---

# IFNOTNULL

Selects the second argument when the first argument is not null; otherwise yields null.

**Category:** Utility Functions

## Syntax

```sql
IFNOTNULL(value, result)
```

## Arguments

- **value** `any`
    A branch value. All branches must share one blendable family — all BOOLEAN, all string, or a numeric/temporal scalar mix. DECIMAL is not blendable; CAST it to DOUBLE first.
- **result** `any`
    A branch value. All branches must share one blendable family — all BOOLEAN, all string, or a numeric/temporal scalar mix. DECIMAL is not blendable; CAST it to DOUBLE first.

## Returns

**compatible input type** — Returns the result value using a type compatible with the supplied arguments when the first argument is not null.
