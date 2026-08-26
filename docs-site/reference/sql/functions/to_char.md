---
title: TO_CHAR — Opteryx Function
description: Converts an integer codepoint to its corresponding character.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# TO_CHAR

Converts an integer codepoint to its corresponding character.

**Category:** String Functions

## Syntax

```sql
TO_CHAR(num)
```

## Arguments

- **num** `integer`
    A Unicode codepoint in 0..1114111 (U+10FFFF). The surrogate range 55296..57343 (U+D800..U+DFFF) is excluded as well — those are not Unicode scalar values.

## Returns

**VARCHAR** — Returns the computed result as `VARCHAR`.
