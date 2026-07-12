---
title: NULL Semantics in Opteryx - Understanding NULL Handling
description: How Opteryx handles NULL in comparisons and filters. Why WHERE excludes NULL comparisons and how to test for NULL correctly.
---

# NULL Semantics

Most comparisons involving `NULL` return `NULL`, not `true` or `false`. The exceptions are the operators built specifically to test for `NULL` — `IS NULL` and `IS NOT NULL`.

## In a SELECT, NULL Stays NULL

```sql
SELECT name = null
  FROM $planets;
```

```
 name=null
-----------
 null
 null
 null
 ...
```

Every row's comparison evaluates to `NULL`, because `name` is never actually `NULL` — but the comparison itself is undefined against a `NULL` operand, regardless of which side it's on.

## In a WHERE, NULL Is Never True

A filter keeps a row only when its condition evaluates to `true`. `NULL` is neither `true` nor `false`, so rows where the condition evaluates to `NULL` are dropped:

```sql
SELECT name
  FROM $planets
 WHERE name = null;
```

Returns an empty set. This holds for inequality too:

```sql
SELECT name
  FROM $planets
 WHERE name != null;
```

Also empty — `!= null` is exactly as undefined as `= null`.

## Testing for NULL

Because `NULL = NULL` is itself `NULL` (not `true`), an equality test can never find `NULL` rows. Use `IS NULL` / `IS NOT NULL` instead:

```sql
SELECT name
  FROM data.observations
 WHERE reading IS NULL;
```

`IS` comparisons are evaluated directly rather than going through the three-valued comparison logic, so they give a definite `true`/`false` even when the column itself is `NULL`.

## Coalescing Around NULL

`IFNULL` and `COALESCE` substitute a value when a column is `NULL`, which is usually more useful than filtering the row out entirely:

```sql
SELECT name, IFNULL(notes, 'no notes recorded') AS notes
  FROM data.observations;
```

## Related

- [Troubleshooting Queries](/docs/guides/troubleshooting)
- [Data Types](/docs/reference/sql/data-types)
