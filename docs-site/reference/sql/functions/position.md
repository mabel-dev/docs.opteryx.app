---
title: POSITION — Opteryx Function
description: Computes the starting position (1-based) of substring in string, or 0 if not found.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# POSITION

Computes the starting position (1-based) of substring in string, or 0 if not found.

**Category:** String Functions

## Syntax

```sql
POSITION(needle IN haystack)
```

## Arguments

- **sub** `varchar`
    String input value.
- **string** `varchar`
    String input value.

## Returns

**INTEGER** — Returns the computed result as `INTEGER`.

## Usage Notes

Canonical SQL-92 form is `POSITION(needle IN haystack)`. Opteryx also accepts `POSITION(needle, haystack)`.
