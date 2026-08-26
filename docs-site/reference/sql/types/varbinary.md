---
title: VARBINARY — Opteryx Type
description: VARBINARY
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

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

Can be compared (using `=`, `<`, `>`, etc.) with: `VARBINARY`, `VARCHAR`, `NVARCHAR`.

## Notes

LIKE and RLIKE work on VARBINARY. ILIKE does not — `col ILIKE pattern` on a VARBINARY column is rejected at bind time, since case-insensitive matching is not defined for raw bytes.

## Limitations

- There is no binary literal syntax. Use HEX_DECODE(), BASE64_DECODE(), or cast from a hex string.
