---
title: SUBSTRING — Opteryx Function
description: Extracts a substring starting at the specified position with optional length.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# SUBSTRING

Extracts a substring starting at the specified position with optional length.

**Category:** String Functions

## Syntax

```sql
SUBSTRING(str FROM start)
```

```sql
SUBSTRING(str FROM start FOR length)
```

## Arguments

- **string** `varchar`
    String input value.
- **from_pos** `integer`
    Integer input value.
- **count** `integer`
    Integer input value.

## Returns

**VARCHAR** — Returns the computed result as `VARCHAR`.

## Usage Notes

Canonical SQL-92 form is `SUBSTRING(str FROM start FOR length)`. Opteryx also accepts `SUBSTRING(str[, start[, length]])`.
