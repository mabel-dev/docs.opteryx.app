---
title: SPLIT — Opteryx Function
description: Splits a string into an array using the specified delimiter. The resulting array is subscripted ZERO-based, with negative indexes counting back from the end: SPLIT('a.b.c.d','.')[0] is 'a', [1] is 'b' and [-1] is 'd'. Most SQL dialects index from 1, so a query ported from one of those returns the wrong element rather than an error - an out-of-range index gives NULL, not a failure.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# SPLIT

Splits a string into an array using the specified delimiter. The resulting array is subscripted ZERO-based, with negative indexes counting back from the end: SPLIT('a.b.c.d','.')[0] is 'a', [1] is 'b' and [-1] is 'd'. Most SQL dialects index from 1, so a query ported from one of those returns the wrong element rather than an error - an out-of-range index gives NULL, not a failure.

**Category:** String Functions

## Syntax

```sql
SPLIT(string, delimiter)
```

```sql
SPLIT(string, delimiter, limit)
```

## Arguments

- **string** `varchar`
    String input value.
- **delimiter** `varchar`
    Separator used to split the input string.
- **limit** `integer`
    Maximum number of items or splits to return.

## Returns

**array<element type of `string`>** — Returns an array whose element type is the string type of `string` — the parts are substrings of the input, so the element type is fixed and known.
