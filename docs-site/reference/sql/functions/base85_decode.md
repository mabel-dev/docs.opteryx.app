---
title: BASE85_DECODE — Opteryx Function
description: Base85 decode.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# BASE85_DECODE

Base85 decode.

**Category:** Hash & Encoding Functions

## Syntax

```sql
BASE85_DECODE(blob)
```

## Arguments

- **blob** `varchar`
    Must be well-formed base85 text; other input is rejected at execution.

## Returns

**VARBINARY** — Returns the computed result as `VARBINARY`.
