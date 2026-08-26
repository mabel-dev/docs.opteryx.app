---
title: DECIMAL — Opteryx Type
description: DECIMAL
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

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

Precision 1–18 uses 64-bit integer storage. Precision 19–38 uses 128-bit integer storage. Precision above 38 is not supported. Arithmetic result precision follows SQL Server rules: addition/subtraction scales as `max(s1,s2)` with precision `max(p1-s1, p2-s2) + max(s1,s2) + 1`; multiplication gives `p1+p2` precision and `s1+s2` scale; division gives `p1+6` precision and `max(s1+6, 6)` scale. FLOAT → DECIMAL casts round half-away-from-zero, not banker's rounding. Unlike INTEGER, DECIMAL arithmetic overflow (result too wide for the storage tier) raises an error rather than wrapping silently.

## Limitations

- MEDIAN does not support DECIMAL columns — cast to FLOAT/DOUBLE first: `MEDIAN(col::DOUBLE)`. SUM, AVG, MIN, and MAX all support DECIMAL natively and preserve exactness (SUM/MIN/MAX stay DECIMAL; AVG returns DOUBLE).
