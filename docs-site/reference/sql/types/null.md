---
title: NULL — Opteryx Type
description: NULL
---

# NULL

The absence of a value. NULL is not a type you declare — it appears when a column has no value or an expression produces no result.

## Comparisons

This type does not support direct comparisons with `=`, `<`, or `>`. Extract or cast values first.

## Notes

NULL is never equal to anything, including itself. Use `IS NULL` or `IS NOT NULL` to test for nulls. NULL propagates through arithmetic and most functions: `1 + NULL` is NULL.

## Limitations

- You cannot CAST to NULL.
- NULL = NULL is always false; use IS NULL instead.
