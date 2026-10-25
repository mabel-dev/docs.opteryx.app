---
title: COSINE_DISTANCE — Opteryx Function
description: Embeds both texts with the active embedding provider and returns 1 - cosine similarity. As the leading ORDER BY key, rows whose distance is NULL (no text, so no embedding) are not returned. `ORDER BY COSINE_DISTANCE(col, 'query') LIMIT k` on a column with a vector index is answered through the index - exactly, unless the `nprobe` variable is set, when only that many clusters per file are searched (approximate).
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# COSINE_DISTANCE

Embeds both texts with the active embedding provider and returns 1 - cosine similarity. As the leading ORDER BY key, rows whose distance is NULL (no text, so no embedding) are not returned. `ORDER BY COSINE_DISTANCE(col, 'query') LIMIT k` on a column with a vector index is answered through the index - exactly, unless the `nprobe` variable is set, when only that many clusters per file are searched (approximate).

**Category:** Text Similarity Functions

## Syntax

```sql
COSINE_DISTANCE(arr, vec)
```

## Arguments

- **arr** `varchar`
    First text input.
- **vec** `varchar`
    Second text input.

## Returns

**FLOAT** — Returns the computed result as `FLOAT`.
