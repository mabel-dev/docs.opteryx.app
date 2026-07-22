---
title: VECTOR — Opteryx Type
description: VECTOR
---

# VECTOR

A fixed-length vector of FP16 (half-precision) floating-point values. Used for similarity search and ML embedding workloads. Declared as `VECTOR(n)` where n is the number of dimensions.

## Casting

| From | Example | Notes |
|------|---------|-------|
| from ARRAY<FLOAT> literal | `[1.0, 0.5, 0.25]::VECTOR(3)` | Quantizes each element to FP16. Only a literal array of non-null numeric values is currently supported by CAST — casting an arbitrary ARRAY<FLOAT> column is not covered by this path. |

## Comparisons

This type does not support direct comparisons with `=`, `<`, or `>`. Extract or cast values first.

## Notes

Similarity search uses dedicated functions such as `COSINE_DISTANCE(a, b)` and `COSINE_SIMILARITY(a, b)`. Standard comparison operators are not supported on VECTOR.

## Limitations

- Vector columns cannot be used with standard comparison operators (=, <, >, etc.).
- The dimension count must match between vectors in any operation.
