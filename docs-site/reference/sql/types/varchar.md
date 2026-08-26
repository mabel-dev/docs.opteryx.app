---
title: VARCHAR — Opteryx Type
description: VARCHAR
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

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
| from VARBINARY | `bin_col::VARCHAR` | Reinterprets the raw bytes as ASCII text. UTF-8 is NOT validated, so bytes that are not ASCII produce an undefined VARCHAR that a client may be unable to decode — cast to NVARCHAR instead, which validates and fails on invalid sequences |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `VARCHAR`, `NVARCHAR`, `VARBINARY`.

## Notes

Supports `LIKE` (case-sensitive), `ILIKE` (case-insensitive), and `RLIKE` (regular expression) pattern matching. Every VARCHAR operation works on BYTES: LENGTH counts bytes, SUBSTRING/LEFT/RIGHT take byte offsets, and REVERSE reverses bytes. On ASCII content — the only content VARCHAR defines — bytes and characters are the same thing. Use NVARCHAR for anything else; its equivalents count code points.

## Limitations

- Non-ASCII bytes stored in a VARCHAR column produce undefined behaviour — use NVARCHAR for Unicode. A byte-wise operation will happily split a multi-byte character: `REVERSE` over UTF-8 held in a VARCHAR returns an invalid sequence, and that is the type's contract, not a fault in the function.
- String values (VARCHAR/NVARCHAR/VARBINARY alike) are length-capped at just under 4 GiB per value (length is stored as uint32).
