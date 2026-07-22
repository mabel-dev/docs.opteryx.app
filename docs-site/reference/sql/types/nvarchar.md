---
title: NVARCHAR — Opteryx Type
description: NVARCHAR
---

# NVARCHAR

A variable-length UTF-8 encoded text string. Use NVARCHAR for any text that may contain non-ASCII characters. JSON columns are stored as NVARCHAR.

## Example

```sql
SELECT 'héllo wörld';
```

## Casting

| From | Example | Notes |
|------|---------|-------|
| from VARCHAR | `ascii_col::NVARCHAR` | Validates UTF-8; fails if the bytes are not valid UTF-8 |
| from VARBINARY | `bin_col::NVARCHAR` | Interprets raw bytes as UTF-8; fails on invalid sequences |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `NVARCHAR`, `VARCHAR`, `VARBINARY`.

## Notes

Supports `LIKE`, `ILIKE`, and `RLIKE` pattern matching. String functions that operate on character positions (e.g. SUBSTRING, LEFT, RIGHT) count Unicode code points, not bytes, ONLY when the position/length argument is a literal — when it comes from a column expression, the same functions currently fall back to a byte-based kernel and give wrong offsets for non-ASCII text.

## Limitations

- Casting from VARBINARY will fail if the bytes are not valid UTF-8.
- There is no structured STRUCT or JSONB type. JSON data lands as NVARCHAR — use `->` and `->>` to navigate it.
