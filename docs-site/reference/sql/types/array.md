---
title: ARRAY — Opteryx Type
description: ARRAY
---

# ARRAY

An ordered sequence of elements, all of the same type. Array columns appear when reading Parquet or JSONL files that contain repeated/array fields. The element type is declared as `ARRAY<type>` (e.g. `ARRAY<INTEGER>`, `ARRAY<VARCHAR>`).

## Comparisons

This type does not support direct comparisons with `=`, `<`, or `>`. Extract or cast values first.

## Notes

Individual elements are accessed with subscript notation: `arr[0]` returns the first element (zero-indexed).

## Limitations

- There is no standalone array literal syntax. `SELECT [1, 2, 3]` is not valid.
- Arrays cannot be used in WHERE clauses or JOIN conditions directly. Use UNNEST or element access.
- You cannot CAST a scalar value to ARRAY.
