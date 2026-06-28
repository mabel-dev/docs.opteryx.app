---
title: VARBINARY — Opteryx Type
description: VARBINARY
---

# VARBINARY

Raw binary data (arbitrary bytes). Use for hashes, encoded payloads, or any non-text binary content.

**Aliases:** `BLOB`, `BYTES`

## Example

```sql
SELECT HEX_DECODE('deadbeef');
```

## Casting

| From | Example | Notes |
|------|---------|-------|
| from VARCHAR | `'hello'::VARBINARY` | Treats the string bytes directly as binary |
| from NVARCHAR | `utf8_col::VARBINARY` | Returns the raw UTF-8 byte sequence |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `VARBINARY`, `VARCHAR`.

## Limitations

- There is no binary literal syntax. Use HEX_DECODE(), BASE64_DECODE(), or cast from a hex string.
