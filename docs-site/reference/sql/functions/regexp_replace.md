---
title: REGEXP_REPLACE — Opteryx Function
description: Replaces all matches of a regular expression pattern with a replacement string.
---

# REGEXP_REPLACE

Replaces all matches of a regular expression pattern with a replacement string.

**Category:** String Functions

## Syntax

```sql
REGEXP_REPLACE(string, pattern, replacement)
```

## Arguments

- **string** `varchar`
    String input value.
- **pattern** `varchar` [constant]
    Regular expression pattern to match in the input string. Must be a constant expression.
- **replacement** `varchar` [constant]
    Replacement text used for matched content. Must be a constant expression.

## Returns

**VARCHAR** — Returns the computed result as `VARCHAR`.
