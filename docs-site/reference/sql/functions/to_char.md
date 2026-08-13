---
title: TO_CHAR — Opteryx Function
description: Converts an integer codepoint to its corresponding character.
---

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
