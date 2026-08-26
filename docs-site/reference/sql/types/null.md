---
title: NULL — Opteryx Type
description: NULL
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# NULL

The absence of a value. NULL is not a type you declare — it appears when a column has no value or an expression produces no result.

## Example

```sql
SELECT NULL;
```

## Comparisons

This type does not support direct comparisons with `=`, `<`, or `>`. Extract or cast values first.

## Notes

NULL is never equal to anything, including itself. Use `IS NULL` or `IS NOT NULL` to test for nulls. NULL propagates through arithmetic and most functions: `1 + NULL` is NULL.

## Limitations

- You cannot CAST to NULL.
- `NULL = NULL` evaluates to NULL (unknown, per SQL three-valued logic) — not TRUE and not FALSE. It never matches in a WHERE clause, which looks like FALSE from the outside, but the value itself is NULL; use IS NULL instead.
