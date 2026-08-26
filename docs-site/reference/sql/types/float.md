---
title: FLOAT — Opteryx Type
description: FLOAT
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# FLOAT

64-bit IEEE 754 double-precision floating-point number. Write `FLOAT` or `DOUBLE` in SQL — they are equivalent.

**Aliases:** `DOUBLE`

## Example

```sql
SELECT 3.14;
```

## Range

- **Min:** `-1.7976931348623157e+308`
- **Max:** `1.7976931348623157e+308`

## Casting

| From | Example | Notes |
|------|---------|-------|
| from INTEGER | `42::FLOAT` | Exact for values up to 2^53; larger integers lose precision |
| from BOOLEAN | `TRUE::FLOAT` | TRUE → 1.0, FALSE → 0.0 |
| from VARCHAR | `'3.14'::FLOAT` | Accepts decimal notation and scientific notation (e.g. '1.5e3') |
| from DECIMAL | `d_col::FLOAT` | May lose precision for high-scale decimals |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `FLOAT`, `INTEGER`, `DECIMAL`.

## Notes

NaN sorts highest (appears after all real numbers). -0.0 and 0.0 compare as equal. Infinity is representable but not directly writable as a literal.

## Limitations

- Floating-point arithmetic is inexact. Use DECIMAL for financial calculations.
- NaN comparisons: NaN = NaN is FALSE in SQL; NaN appears at the top when sorting.
- GROUP BY SUM/AVG over FLOAT is computed by parallel workers whose summation order is not fixed, so re-running the identical query against unchanged data can return different low-order digits between runs. INTEGER SUM/COUNT are exact and unaffected.
