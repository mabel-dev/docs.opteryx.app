---
title: DECIMAL — Opteryx Type
description: DECIMAL
---

# DECIMAL

Fixed-point decimal number with configurable precision and scale.

## Example

```
123.45
```

## Range

- **Min:** `-99999999999999999.999999999999999999999`
- **Max:** `99999999999999999.999999999999999999999`

## Notes

If precision/scale are not defined, defaults to precision=38 and scale=21.

**Family:** numeric

## Flags

- **numeric**: `True`
- **temporal**: `False`
- **collection**: `False`
- **parameterized**: `True`

## Parameterized Forms

- `DECIMAL(10,2)`
