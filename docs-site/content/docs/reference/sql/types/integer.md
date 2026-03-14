---
title: INTEGER — Opteryx Type
description: INTEGER
---

# INTEGER

Signed 64-bit integer.

## Example

```
42
```

## Range

- **Min:** `-9223372036854775808`
- **Max:** `9223372036854775807`

## Notes

Parsed from strings, floats, and booleans.

**Canonical name:** INTEGER

**Aliases:** int16, int32, int64, int8

**Accepted spellings:** int16, int32, int64, int8, integer

**Family:** numeric

## Flags

- **numeric**: `True`
- **temporal**: `False`
- **collection**: `False`
- **parameterized**: `False`

## Ingestion Mappings

- **parquet_physical**: int16, int32, int64, int8
- **jsonl**: int64
