---
title: REGEXP_REPLACE — Opteryx Function
description: Replaces all matches of a regular expression pattern with a replacement string.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

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
    Only the whole-match capture reference `'\1'` is supported. An arbitrary replacement template is refused. Must be a constant expression.

## Returns

**VARCHAR** — Returns the computed result as `VARCHAR`.
