---
title: BASE64_DECODE — Opteryx Function
description: Base64 decode.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# BASE64_DECODE

Base64 decode.

**Category:** Hash & Encoding Functions

## Syntax

```sql
BASE64_DECODE(blob)
```

## Arguments

- **blob** `varchar`
    Must be well-formed base64 text; other input is rejected at execution.

## Returns

**VARBINARY** — Returns the computed result as `VARBINARY`.
