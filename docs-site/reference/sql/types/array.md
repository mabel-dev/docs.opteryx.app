---
title: ARRAY — Opteryx Type
description: ARRAY
---

# ARRAY

An ordered sequence of elements, all of the same type. Array columns appear when reading Parquet or JSONL files that contain repeated/array fields. The element type is declared as `ARRAY<type>` (e.g. `ARRAY<INTEGER>`, `ARRAY<VARCHAR>`).

## Comparisons

This type does not support direct comparisons with `=`, `<`, or `>`. Extract or cast values first.

## Notes

Individual elements are accessed with subscript notation: `arr[0]` returns the first element (zero-indexed, negative indices count from the end). Array literals (`[1, 2, 3]`) are valid as an operand of `IN`, `@>`, `@>>`, or `CAST(... AS VECTOR(n))` — just not as a bare item in the SELECT list.

## Limitations

- There is no standalone array literal syntax in the SELECT list. `SELECT [1, 2, 3]` is not valid, though `[1, 2, 3]` is valid as an operand elsewhere (see notes).
- Array EQUALITY is not supported (no `=` operator registered for ARRAY = ARRAY). Membership/containment checks (`col IN (...)`, `@>`, `@>>`) DO work directly in a WHERE clause — the array itself just can't be compared for equality.
- You cannot CAST a scalar value to ARRAY.
- Element access (`arr[i]`) is unsupported for VECTOR_FP16 and DECIMAL128 element types — it fails loud rather than returning a stripped or misread value.
