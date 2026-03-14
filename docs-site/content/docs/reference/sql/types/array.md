---
title: ARRAY — Opteryx Type
description: ARRAY
---

# ARRAY

Array of values of a single type.

## Example

```
[1, 2, 3]
```

## Notes

Element type is specified as ARRAY<INTEGER>, ARRAY<VARCHAR>, etc.

**Canonical name:** ARRAY

**Accepted spellings:** array

**Family:** nested

## Flags

- **numeric**: `False`
- **temporal**: `False`
- **collection**: `True`
- **parameterized**: `True`

## Parameterized Forms

- `ARRAY<INTEGER>`

## Ingestion Mappings

- **parquet_logical_patterns**: array<...>
- **jsonl_patterns**: array<...>
