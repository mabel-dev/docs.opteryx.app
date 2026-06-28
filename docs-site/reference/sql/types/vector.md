---
title: VECTOR — Opteryx Type
description: VECTOR
---

# VECTOR

A fixed-length vector of FP16 (half-precision) floating-point values. Used for similarity search and ML embedding workloads. Declared as `VECTOR(n)` where n is the number of dimensions.

## Casting

| From | Example | Notes |
|------|---------|-------|
| from ARRAY<FLOAT> | `float_array_col::VECTOR(384)` | Quantizes each element to FP16 |

## Comparisons

This type does not support direct comparisons with `=`, `<`, or `>`. Extract or cast values first.

## Notes

Similarity search uses dedicated functions such as `COSINE_DISTANCE(a, b)` and `COSINE_SIMILARITY(a, b)`. Standard comparison operators are not supported on VECTOR.

## Limitations

- Vector columns cannot be used with standard comparison operators (=, <, >, etc.).
- The dimension count must match between vectors in any operation.
