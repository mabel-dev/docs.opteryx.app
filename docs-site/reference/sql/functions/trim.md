---
title: TRIM — Opteryx Function
description: Removes leading and trailing whitespace from string.
---

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
