---
title: JSONB_OBJECT_KEYS — Opteryx Function
description: Extract keys from JSON object.
---

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
