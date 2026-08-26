---
title: LENGTH — Opteryx Function
description: Computes length of string or number of elements in an array.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# LENGTH

Computes length of string or number of elements in an array.

**Category:** String Functions

## Syntax

```sql
LENGTH(string)
```

```sql
LENGTH(arr)
```

## Arguments

- **string** `varchar`
    String input value.
- **arr** `array`
    Input array or vector value.

## Returns

**INTEGER** — Returns the computed result as `INTEGER`.
