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
    Value returned when `condition` evaluates to true.
- **false_value** `any`
    Value returned when `condition` evaluates to false.

## Returns

**dynamic** — Returns a value whose type depends on the supplied arguments.
