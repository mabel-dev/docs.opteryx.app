---
title: Supported SQL — Opteryx Reference
description: Concise summary of SQL features and syntax supported by Opteryx with practical examples and links to detailed reference pages.
---

# Supported SQL

This page gives a concise, practical summary of the SQL features supported by Opteryx and points to deeper reference pages.

## What this page contains
- Quick reference of commonly used statements and clauses
- Short, runnable examples for everyday use cases
- Links to full reference pages for statements, functions, types, and advanced topics

## Quick reference
- Core query: `SELECT` … `FROM` … `WHERE` … `GROUP BY` … `HAVING` … `ORDER BY` … `LIMIT` … `OFFSET`
- Joins: `INNER`, `LEFT` (including `SEMI` / `ANTI`), `RIGHT`, `FULL`, `CROSS`
- CTEs: `WITH` (named subqueries)
- Window functions: `ROW_NUMBER()`, `RANK()`, `SUM() OVER (...)`, etc.
- Aggregates: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`
- Set ops: `UNION` / `UNION ALL`, `INTERSECT`, `EXCEPT`
- Data mod: `INSERT`, `UPDATE`, `DELETE` (backend-dependent)

> Note: Opteryx targets a pragmatic, file-oriented SQL subset suitable for ad-hoc analytical queries — not full RDBMS parity.

---

## Common examples

### Simple SELECT
```sql
SELECT id, name, created_at
  FROM users
 WHERE active = TRUE
 ORDER BY created_at DESC
 LIMIT 50;
```

### Aggregation and HAVING
```sql
SELECT category, COUNT(*) AS count, SUM(amount) AS total
  FROM transactions
 WHERE status = 'completed'
 GROUP BY category
 HAVING SUM(amount) > 1000
 ORDER BY total DESC;
```

### Window function
```sql
SELECT id, user_id, amount,
       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) AS rank
  FROM purchases;
```

### CTE for readability
```sql
WITH recent AS (
  SELECT * FROM events WHERE ts > current_date - INTERVAL '7' DAY
)
SELECT user_id, COUNT(*) FROM recent GROUP BY user_id;
```

### JOIN (inner)
```sql
SELECT o.id AS order_id, c.name AS customer
  FROM orders o
  JOIN customers c ON o.customer_id = c.id;
```

---

## Language details & behavior
- NULL handling follows SQL three-valued logic for comparisons and predicates.
- `LIKE` / `ILIKE` and regular-expression matches (`RLIKE`, `~`) are supported for pattern filtering.
- `DISTINCT` and `DISTINCT ON (cols)` are available for de-duplication.
- `SELECT * EXCEPT(col1, col2)` is supported to exclude columns from `*` expansion.
- Time travel and date-scoped queries are available via `FOR` clauses in contexts that support it (see the Time Travel docs).

---

## Where to go next
- Statements & clauses: [Statements](/docs/reference/sql/statements)
- Functions & aggregates: [Functions](/docs/reference/sql/functions)
- Data types & casting: [Data Types](/docs/reference/sql/data-types)
- Joins & examples: [Joins](/docs/reference/sql/joins)
- Advanced topics: see the `adv-*` pages for time travel, arrays, structs, temp tables, and query optimization

---

If you want, I can expand any of the example sections (more edge cases, error notes, or runnable examples with expected output).