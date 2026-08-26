---
title: MATCH — Opteryx Function
description: True when COSINE_SIMILARITY(column, query) >= the `match_threshold` session variable (default 0.5). Matching is only as semantic as the active EMBED capability: the built-in embedder is a lexical hashed projection, so by default MATCH behaves as a case-insensitive exact match rather than a meaning-based one. Install a semantic embedding capability, and/or tune `match_threshold`, to change that. Empty or stopword-only text embeds to a zero vector, giving an undefined (NaN) similarity, which never matches.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# MATCH

True when COSINE_SIMILARITY(column, query) >= the `match_threshold` session variable (default 0.5). Matching is only as semantic as the active EMBED capability: the built-in embedder is a lexical hashed projection, so by default MATCH behaves as a case-insensitive exact match rather than a meaning-based one. Install a semantic embedding capability, and/or tune `match_threshold`, to change that. Empty or stopword-only text embeds to a zero vector, giving an undefined (NaN) similarity, which never matches.

**Category:** String Functions

## Syntax

```sql
MATCH(str) AGAINST(pattern)
```

## Arguments

- **string** `varchar`
    String input value.
- **query** `varchar`
    String input value.

## Returns

**BOOLEAN** — Returns the computed result as `BOOLEAN`.

## Usage Notes

Canonical form is `MATCH(str) AGAINST(pattern)`. Opteryx normalizes this syntax to an internal helper.
