---
title: JSONB — Opteryx Type
description: JSONB
---

# JSONB

JSON binary data.

## Example

```
{'key': 'value'}
```

## Notes

Stored as a binary JSON blob.

**Canonical name:** JSONB

**Accepted spellings:** jsonb

**Family:** nested

## Flags

- **numeric**: `False`
- **temporal**: `False`
- **collection**: `True`
- **parameterized**: `False`

## Ingestion Mappings

- **parquet_logical**: json, jsonb, struct
- **jsonl**: object
