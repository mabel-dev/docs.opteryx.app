---
title: IIF — Opteryx Function
description: Selects between the second and third arguments based on the condition.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

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
