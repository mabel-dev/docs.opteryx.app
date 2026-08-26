---
title: JSONB_OBJECT_KEYS — Opteryx Function
description: Extract keys from JSON object.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# JSONB_OBJECT_KEYS

Extract keys from JSON object.

**Category:** Struct/JSON Functions

## Syntax

```sql
JSONB_OBJECT_KEYS(json)
```

## Arguments

- **json** `varchar`
    Must be text that parses as a JSON object; other input is rejected at execution.

## Returns

**ARRAY<VARIANT>** — Returns the computed result as `ARRAY<VARIANT>`.
