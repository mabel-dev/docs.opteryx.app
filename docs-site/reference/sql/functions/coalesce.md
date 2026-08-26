---
title: COALESCE — Opteryx Function
description: Selects the first non-null value from the list of arguments.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

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
