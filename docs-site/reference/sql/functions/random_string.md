---
title: RANDOM_STRING — Opteryx Function
description: Computes n random bytes as varbinary, one value per row.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# RANDOM_STRING

Computes n random bytes as varbinary, one value per row.

**Category:** Utility Functions

## Syntax

```sql
RANDOM_STRING(n)
```

## Arguments

- **n** `integer`
    Number of random bytes to generate for each row.

## Returns

**VARBINARY** — Returns the computed result as `VARBINARY`.

## Usage Notes

This function is volatile. It returns `n` random bytes as `VARBINARY` for each row; the integer argument is the byte length, not a seed.
