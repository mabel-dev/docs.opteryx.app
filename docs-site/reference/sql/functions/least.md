---
title: LEAST — Opteryx Function
description: Determines the minimum element in an array column.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# LEAST

Determines the minimum element in an array column.

**Category:** Array Functions

## Syntax

```sql
LEAST(arr)
```

## Arguments

- **arr** `array`
    Input array or vector value.

## Returns

**element type of `arr`** — Returns a single element from `arr`, preserving the array's element type.
