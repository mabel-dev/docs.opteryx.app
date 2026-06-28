---
title: BOOLEAN — Opteryx Type
description: BOOLEAN
---

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
- Casting an unrecognised string to BOOLEAN raises an error, not NULL. There is no silent fallback.
