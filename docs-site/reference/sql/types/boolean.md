---
title: BOOLEAN — Opteryx Type
description: BOOLEAN
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# BOOLEAN

A logical TRUE or FALSE value.

**Aliases:** `BOOL`

## Example

```sql
SELECT TRUE;
```

## Casting

| From | Example | Notes |
|------|---------|-------|
| from INTEGER | `1::BOOLEAN` | 0 → FALSE, any non-zero → TRUE |
| from FLOAT | `1.0::BOOLEAN` | 0.0 → FALSE, any non-zero → TRUE |
| from VARCHAR | `'true'::BOOLEAN` | Exact matches only (case-insensitive): `true`/`false`, `1`/`0`, `yes`/`no`, `on`/`off`. Any other value raises an error — including empty string, `'null'`, and `'none'`. |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `BOOLEAN`.

## Limitations

- BOOLEAN cannot be compared to numeric types directly. Cast first: `col::INTEGER = 1`.
- Plain `CAST(... AS BOOLEAN)` / `::BOOLEAN` raises on an unrecognised string — there is no silent fallback. However `TRY_CAST(... AS BOOLEAN)` and element parsing inside `CAST(... AS ARRAY<BOOLEAN>)` do NOT raise and do NOT return NULL for garbage input — they silently coerce any unrecognised string to FALSE.
