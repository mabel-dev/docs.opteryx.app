---
title: BOOLEAN — Opteryx Type
description: BOOLEAN
---

# BOOLEAN

Boolean value representing true or false.

## Example

```
TRUE
```

## Range

- **Min:** `False`
- **Max:** `True`

## Notes

Accepted values include TRUE/FALSE, 1/0, YES/NO, ON/OFF (case-insensitive).

**Canonical name:** BOOLEAN

**Aliases:** bool

**Accepted spellings:** bool, boolean

**Family:** boolean

## Flags

- **numeric**: `False`
- **temporal**: `False`
- **collection**: `False`
- **parameterized**: `False`

## Ingestion Mappings

- **parquet_physical**: boolean
- **parquet_logical**: boolean
- **jsonl**: boolean
