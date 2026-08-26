---
title: HUMANIZE — Opteryx Function
description: Format number in human-readable form.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# HUMANIZE

Format number in human-readable form.

**Category:** Conversion Functions

## Syntax

```sql
HUMANIZE(val, [mode])
```

## Arguments

- **val** `number`
    Input value.
- **mode** `varchar` [optional | constant]
    Scale system to render into: 'words' (default), 'compact', 'bytes', 'si', 'time', 'clock', 'percent' or 'odds'. Must be a constant expression. Optional.

## Returns

**VARCHAR** — Returns the computed result as `VARCHAR`.
