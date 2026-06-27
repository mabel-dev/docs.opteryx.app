---
title: DECIMAL — Opteryx Type
description: DECIMAL
---

# DECIMAL

Exact fixed-point decimal number with configurable precision and scale.

## Example

```
DECIMAL(10,2)
```

## Notes

Suitable for monetary values. Use CAST to FLOAT for aggregate operations.

**Family:** numeric

## Flags

- **numeric**: `True`
- **temporal**: `False`
- **collection**: `False`
- **parameterized**: `True`

## Parameterized Forms

- `DECIMAL(precision,scale)`
