---
title: TRIM — Opteryx Function
description: Removes leading and trailing whitespace from string.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# TRIM

Removes leading and trailing whitespace from string.

**Category:** String Functions

## Syntax

```sql
TRIM([BOTH|LEADING|TRAILING] chars FROM str)
```

## Arguments

- **string** `varchar`
    String input value.
- **characters** `varchar` [optional | constant]
    The SET of characters to strip, not a substring to match: `TRIM(BOTH 'ab' FROM 'baXab')` is `X`. Must be constant. Omitted, ASCII whitespace is stripped. Over an NVARCHAR operand the set is matched by codepoint, so a multibyte character can never be split. Must be a constant expression. Optional.

## Returns

**dynamic** — Returns a value whose type depends on the supplied arguments.

## Usage Notes

Canonical SQL-92 form is `TRIM([BOTH|LEADING|TRAILING] chars FROM str)`. Opteryx also accepts `TRIM(str[, chars])` as well as `LTRIM` and `RTRIM`. `chars` is a SET of characters, matched in any order and repeated: `TRIM(BOTH 'ab' FROM 'baXab')` is `X`. It must be constant, and over an `NVARCHAR` operand it is matched by codepoint, so a multibyte character is never split. Omit it (`TRIM(str)`) to strip ASCII whitespace; the direction-only spelling `TRIM(BOTH FROM str)` is not accepted.
