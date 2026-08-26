---
title: RPAD — Opteryx Function
description: Pads string on the right with fill character to reach specified width.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# RPAD

Pads string on the right with fill character to reach specified width.

**Category:** String Functions

## Syntax

```sql
RPAD(string, width, fill)
```

## Arguments

- **string** `varchar`
    String input value.
- **width** `integer` [constant]
    Target width for the output. Must be a constant expression.
- **fill** `varchar` [constant]
    Padding text used when the input is shorter than the target width. Must be a constant expression.

## Returns

**VARCHAR** — Returns the computed result as `VARCHAR`.
