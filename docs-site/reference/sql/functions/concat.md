---
title: CONCAT — Opteryx Function
description: Concatenates multiple string arguments into a single string.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# CONCAT

Concatenates multiple string arguments into a single string.

**Category:** String Functions

## Syntax

```sql
CONCAT(str1, str2, [strs...])
```

## Arguments

- **str1** `varchar`
    First input string value.
- **str2** `varchar`
    String input value.
- **strs** `varchar` [optional | variadic]
    String input value. Optional. Can be repeated.

## Returns

**VARCHAR** — Returns the computed result as `VARCHAR`.
**NVARCHAR** — Returns the computed result as `NVARCHAR`.
**VARBINARY** — Returns the computed result as `VARBINARY`.
