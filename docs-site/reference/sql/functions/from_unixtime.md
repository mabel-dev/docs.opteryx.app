---
title: FROM_UNIXTIME — Opteryx Function
description: Convert Unix timestamp to TIMESTAMP.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# FROM_UNIXTIME

Convert Unix timestamp to TIMESTAMP.

**Category:** Date & Time Functions

## Syntax

```sql
FROM_UNIXTIME(ts)
```

## Arguments

- **ts** `number`
    Unix timestamp expressed in seconds.

## Returns

**TIMESTAMP[US]** — Returns the computed result as `TIMESTAMP[US]`.
