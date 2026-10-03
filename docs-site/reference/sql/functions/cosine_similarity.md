---
title: COSINE_SIMILARITY — Opteryx Function
description: Embeds both texts with the active embedding provider and returns their cosine similarity.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# COSINE_SIMILARITY

Embeds both texts with the active embedding provider and returns their cosine similarity.

**Category:** Text Similarity Functions

## Syntax

```sql
COSINE_SIMILARITY(arr, vec)
```

## Arguments

- **arr** `varchar`
    First text input.
- **vec** `varchar`
    Second text input.

## Returns

**FLOAT** — Returns the computed result as `FLOAT`.
