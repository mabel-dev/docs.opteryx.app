---
title: EMBED — Opteryx Function
description: Embeds text using the configured engine embedding provider.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# EMBED

Embeds text using the configured engine embedding provider.

**Category:** Vector / Embedding Functions

## Syntax

```sql
EMBED(text)
```

## Arguments

- **text** `varchar`
    Input text to convert into an embedding vector.

## Returns

**vector** — Returns an embedding vector.

## Usage Notes

This function depends on the configured embedding provider and returns a numeric `vector`.
