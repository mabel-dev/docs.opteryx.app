---
title: VARCHAR — Opteryx Type
description: VARCHAR
---

# VARCHAR

A variable-length ASCII text string. Use VARCHAR for columns that contain only ASCII characters. For text with accented characters, emoji, or any non-ASCII content, use NVARCHAR instead.

**Aliases:** `STRING`, `TEXT`

## Example

```sql
SELECT 'hello world';
```

## Casting

| From | Example | Notes |
|------|---------|-------|
| from INTEGER | `42::VARCHAR` | Decimal string representation |
| from FLOAT | `3.14::VARCHAR` | Decimal notation |
| from BOOLEAN | `TRUE::VARCHAR` | 'true' or 'false' |
| from DATE | `date_col::VARCHAR` | 'YYYY-MM-DD' |
| from TIMESTAMP | `ts_col::VARCHAR` | ISO 8601 string representation |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `VARCHAR`, `NVARCHAR`, `VARBINARY`.

## Notes

Supports `LIKE` (case-sensitive), `ILIKE` (case-insensitive), and `RLIKE` (regular expression) pattern matching.

## Limitations

- Non-ASCII bytes stored in a VARCHAR column produce undefined behaviour — use NVARCHAR for Unicode.
- String values (VARCHAR/NVARCHAR/VARBINARY alike) are length-capped at just under 4 GiB per value (length is stored as uint32).
