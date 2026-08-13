---
title: IIF — Opteryx Function
description: Selects between the second and third arguments based on the condition.
---

# IIF

Selects between the second and third arguments based on the condition.

**Category:** Utility Functions

## Syntax

```sql
IIF(condition, true_value, false_value)
```

## Arguments

- **condition** `boolean`
    Boolean expression used to choose which result to return.
- **true_value** `any`
    A branch value. All branches must share one blendable family — all BOOLEAN, all string, or a numeric/temporal scalar mix. DECIMAL is not blendable; CAST it to DOUBLE first.
- **false_value** `any`
    A branch value. All branches must share one blendable family — all BOOLEAN, all string, or a numeric/temporal scalar mix. DECIMAL is not blendable; CAST it to DOUBLE first.

## Returns

**dynamic** — Returns a value whose type depends on the supplied arguments.
