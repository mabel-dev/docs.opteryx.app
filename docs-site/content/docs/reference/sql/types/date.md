---
title: DATE — Opteryx Type
description: DATE
---

# DATE

Calendar date (YYYY-MM-DD).

## Example

```
2023-04-18
```

## Range

- **Min:** `0001-01-01`
- **Max:** `9999-12-31`

## Notes

Parsed from ISO date strings and timestamps.

**Canonical name:** DATE

**Accepted spellings:** date

**Family:** temporal

## Flags

- **numeric**: `False`
- **temporal**: `True`
- **collection**: `False`
- **parameterized**: `False`

## Ingestion Mappings

- **parquet_logical**: date, date32[day]
