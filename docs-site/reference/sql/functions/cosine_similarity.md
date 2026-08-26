---
title: COSINE_SIMILARITY — Opteryx Function
description: Cosine similarity over numeric vectors or semantic text inputs.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# COSINE_SIMILARITY

Cosine similarity over numeric vectors or semantic text inputs.

**Category:** Vector / Embedding Functions

## Syntax

```sql
COSINE_SIMILARITY(arr, vec)
```

## Arguments

- **arr** `vector`
    First vector or text input.
- **vec** `vector`
    Second vector or text input.

## Returns

**FLOAT** — Returns the computed result as `FLOAT`.
