---
title: DECIMAL — Opteryx Type
description: DECIMAL
---

# DECIMAL

Exact fixed-point number with declared precision and scale: `DECIMAL(precision, scale)`. Precision is the total number of significant digits (1–38); scale is the number of digits after the decimal point (0–precision). For example, `DECIMAL(10, 2)` holds values up to 99999999.99.

## Example

```sql
SELECT 1.23::DECIMAL(10,2);
```

## Casting

| From | Example | Notes |
|------|---------|-------|
| from INTEGER | `42::DECIMAL(10,2)` | Exact — no precision loss for integers within range |
| from FLOAT | `3.14::DECIMAL(10,4)` | Rounded to declared scale; floating-point representation may introduce noise |
| from VARCHAR | `'1.23'::DECIMAL(10,2)` | String must be a valid decimal literal |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `DECIMAL`, `INTEGER`, `FLOAT`.

## Notes

Precision 1–18 uses 64-bit integer storage. Precision 19–38 uses 128-bit integer storage. Precision above 38 is not supported. Arithmetic result precision follows SQL Server rules: addition/subtraction scales as `max(s1,s2)` with precision `max(p1-s1, p2-s2) + max(s1,s2) + 1`; multiplication gives `p1+p2` precision and `s1+s2` scale.

## Limitations

- SUM and AVG do not support DECIMAL columns — cast to FLOAT first: `SUM(col::FLOAT)`.
- DECIMAL columns from Parquet files are read correctly but aggregate functions reject them.
