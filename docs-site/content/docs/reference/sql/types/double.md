---
title: DOUBLE — Opteryx Type
description: DOUBLE
---

# DOUBLE

Double-precision floating point number.

## Example

```
123.45
```

## Range

- **Min:** `-1.7976931348623157e+308`
- **Max:** `1.7976931348623157e+308`

## Notes

Supports scientific notation (e.g. 1.23e5).

**Canonical name:** DOUBLE

**Aliases:** float, float32, float64

**Accepted spellings:** double, float, float32, float64

**Family:** numeric

## Flags

- **numeric**: `True`
- **temporal**: `False`
- **collection**: `False`
- **parameterized**: `False`

## Ingestion Mappings

- **parquet_physical**: double, float, float32, float64
- **jsonl**: double
