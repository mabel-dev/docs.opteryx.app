---
title: UUID — Opteryx Type
description: UUID
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# UUID

A universally unique identifier (RFC 9562). Stored as its 16 bytes in network order, so ordering, grouping, joining and comparison work on the bytes and byte order is the same as the order of the canonical text.

## Example

```sql
SELECT CAST('550e8400-e29b-41d4-a716-446655440000' AS UUID);
```

## Casting

| From | Example | Notes |
|------|---------|-------|
| varchar | `CAST(id AS VARCHAR)` | Lowercase 8-4-4-4-12 text. |
| varbinary | `CAST(id AS VARBINARY)` | The raw 16 bytes, not the text. |
| from VARCHAR | `CAST('550e8400-e29b-41d4-a716-446655440000' AS UUID)` | Strict: exactly 8-4-4-4-12 hex digits, either case. |
| from VARBINARY | `CAST(raw AS UUID)` | Exactly 16 bytes. |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `uuid`.

## Notes

Rendered as lowercase 8-4-4-4-12 text. A string literal compared with a UUID column is parsed as a UUID when the query is planned, so `id = '550e8400-...'` compares 16 bytes; a string column compared with a UUID column needs an explicit CAST.

## Limitations

- UUID text is parsed strictly: braces, `urn:uuid:` prefixes and unhyphenated hex are rejected rather than guessed.
- No arithmetic, and no string functions without an explicit CAST to VARCHAR.
- MIN, MAX and ANY_VALUE work over UUID; SUM and AVG do not. MIN/MAX as window functions (with an OVER clause) are not supported yet.
- Read from Parquet (FIXED_LEN_BYTE_ARRAY(16) annotated UUID), Avro (`uuid` on string or fixed(16)) and PostgreSQL `uuid` columns. CSV and JSONL produce UUID only through a declared schema; a uuid-shaped string is otherwise VARCHAR.
- Filters on a PostgreSQL UUID column are evaluated by Opteryx, not pushed to the server.
