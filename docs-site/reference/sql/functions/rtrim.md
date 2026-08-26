---
title: RTRIM — Opteryx Function
description: Removes trailing whitespace from string.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# RTRIM

Removes trailing whitespace from string.

**Category:** String Functions

## Syntax

```sql
RTRIM(string, [characters])
```

## Arguments

- **string** `varchar`
    String input value.
- **characters** `varchar` [optional | constant]
    The SET of characters to strip, not a substring to match: `TRIM(BOTH 'ab' FROM 'baXab')` is `X`. Must be constant. Omitted, ASCII whitespace is stripped. Over an NVARCHAR operand the set is matched by codepoint, so a multibyte character can never be split. Must be a constant expression. Optional.

## Returns

**dynamic** — Returns a value whose type depends on the supplied arguments.
