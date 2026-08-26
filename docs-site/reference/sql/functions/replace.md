---
title: REPLACE — Opteryx Function
description: Replace all occurrences.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# REPLACE

Replace all occurrences.

**Category:** String Functions

## Syntax

```sql
REPLACE(string, search, replace_val)
```

## Arguments

- **string** `varchar`
    String input value.
- **search** `varchar`
    Text or pattern to replace in the input.
- **replace_val** `varchar`
    String input value.

## Returns

**VARCHAR** — Returns the computed result as `VARCHAR`.
