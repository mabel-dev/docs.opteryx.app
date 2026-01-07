---
title: LIMIT and OFFSET Clauses — Opteryx Reference
description: SQL LIMIT and OFFSET clause syntax and examples for pagination in Opteryx
---

# LIMIT and OFFSET

The `LIMIT` clause restricts the maximum number of rows returned. The `OFFSET` clause skips a specified number of rows before returning results. Together, they enable pagination.

## Basic Syntax

```sql
SELECT columns
  FROM relation_name
 WHERE conditions
 ORDER BY ...
 LIMIT count [OFFSET offset];
```

Or alternatively:

```sql
LIMIT count OFFSET offset;
OFFSET offset LIMIT count;
```

## LIMIT

Return only the first `n` rows:

```sql
SELECT * FROM users LIMIT 10;
SELECT * FROM orders LIMIT 5;
```

## OFFSET

Skip the first `n` rows before returning results:

```sql
SELECT * FROM users
 ORDER BY created_at DESC
 LIMIT 10 OFFSET 20;
-- Returns rows 21-30
```

## Pagination Example

Fetch pages of results with consistent ordering:

```sql
-- Page 1 (rows 1-10)
SELECT * FROM products
 ORDER BY id
 LIMIT 10 OFFSET 0;

-- Page 2 (rows 11-20)
SELECT * FROM products
 ORDER BY id
 LIMIT 10 OFFSET 10;

-- Page 3 (rows 21-30)
SELECT * FROM products
 ORDER BY id
 LIMIT 10 OFFSET 20;
```

## With GROUP BY and ORDER BY

```sql
SELECT 
  category,
  COUNT(*) AS count
FROM products
GROUP BY category
ORDER BY count DESC
LIMIT 5;
-- Returns top 5 categories by product count
```

## Notes

- `LIMIT` must come after `WHERE`, `GROUP BY`, `HAVING`, and `ORDER BY`.
- Always use `ORDER BY` for predictable `LIMIT` results.
- `OFFSET` without `LIMIT` is not allowed in most SQL dialects.
- For pagination, maintain the `ORDER BY` clause across requests to ensure consistent results.
