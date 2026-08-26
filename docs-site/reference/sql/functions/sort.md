---
title: SORT — Opteryx Function
description: Sorts an array column.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# SORT

Sorts an array column.

**Category:** Array Functions

## Syntax

```sql
SORT(arr)
```

## Arguments

- **arr** `array`
    Input array or vector value.

## Returns

**same as `arr`** — Returns a sorted array while preserving the input array type.
