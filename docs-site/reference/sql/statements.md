---
title: SQL Statements — Opteryx Reference
description: Practical reference for SQL statements supported by Opteryx with concise examples and behavior notes.
---

# Statements

This page covers the most commonly used SQL statements in Opteryx with short examples and quick behavior notes. For in-depth syntax and full examples, follow the links to the detailed pages.

## Overview
Opteryx supports a pragmatic subset of SQL suitable for file-backed analytical queries. The following common statements are supported: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `EXPLAIN`, `SHOW`, `SET`, and various `SHOW`/`SHOW CREATE` helpers.

---

## SELECT (querying)
Retrieve rows from relations, with full support for filtering, joining, grouping, ordering and pagination.

Example — basic query:
```sql
SELECT id, name, created_at
  FROM users
 WHERE active = TRUE
 ORDER BY created_at DESC
 LIMIT 50;
```

Example — aggregation:
```sql
SELECT category, COUNT(*) AS cnt, SUM(amount) AS total
  FROM transactions
 WHERE status = 'completed'
 GROUP BY category
 HAVING SUM(amount) > 1000
 ORDER BY total DESC;
```

Notes:
- `DISTINCT` and `DISTINCT ON (cols)` are supported.
- `SELECT * EXCEPT (col1, col2)` excludes listed columns from `*` expansion.
- `FOR` clauses provide time-scoped/time-travel queries in supported contexts (see Time Travel docs).

---

## Joins & FROM
All common join forms are available: `INNER`, `LEFT` (and `LEFT SEMI` / `LEFT ANTI`), `RIGHT`, `FULL`, and `CROSS`.

Example — inner join:
```sql
SELECT o.id AS order_id, c.name AS customer
  FROM orders o
  JOIN customers c ON o.customer_id = c.id;
```

---

## Set operations
- `UNION` / `UNION ALL` — combines result sets
- `INTERSECT` — yields rows present in both
- `EXCEPT` — yields rows from the first not in the second

Example:
```sql
SELECT id FROM a
UNION ALL
SELECT id FROM b;
```

---

## DML: INSERT / UPDATE / DELETE
Basic data modification statements are supported where the underlying data store allows mutations. Behavior depends on storage backend.

Example — insert:
```sql
INSERT INTO users (id, name, active) VALUES (1, 'acme', true);
```

Example — update:
```sql
UPDATE users SET active = FALSE WHERE last_login < '2023-01-01';
```

Example — delete:
```sql
DELETE FROM sessions WHERE expires_at < current_timestamp;
```

---

## EXPLAIN
`EXPLAIN` shows the logical/physical plan; `EXPLAIN ANALYZE` runs the query and shows runtime metrics.

Example:
```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE id = 1;
```

Output formats may vary and are not guaranteed stable for machine parsing; `FORMAT MERMAID` can produce diagrams.

---

## SHOW, SET, and HELP commands
- `SHOW FUNCTIONS`, `SHOW TABLES`, `SHOW COLUMNS`, etc., list metadata.
- `SET variable = value` sets query-scoped variables.
- `SHOW PARAMETERS` / `SHOW VARIABLES` display configuration or variables.

---

## Tips & Behavior
- `ORDER BY` operates on the final result set; use `LIMIT`/`OFFSET` for pagination.
- `HAVING` filters grouped results (post-aggregation).
- Use `EXPLAIN ANALYZE` to diagnose slow queries and `FOR` for time-scoped reads.

---

## Where to go next
- Detailed statements reference: [Statements full page](/docs/reference/sql/statements)
- Examples and edge cases: [Supported SQL](/docs/reference/sql/supported-sql)
- Joins: [Joins](/docs/reference/sql/joins)

If you want, I can expand this page with more real-world examples, expected outputs, and common pitfalls for each statement.

- `GROUP BY` defines grouping keys for aggregation.
- `GROUP BY ALL` includes all non-aggregated columns from the `SELECT`.
- `HAVING` filters grouped results and requires a `GROUP BY`.

### ORDER BY / LIMIT / OFFSET

~~~sql
ORDER BY expression [ ASC | DESC ] [, ...]
~~~
~~~sql
OFFSET n
~~~
~~~sql
LIMIT n
~~~

These clauses apply to the final output:

- `ORDER BY` sorts rows.
- `LIMIT` restricts how many rows are returned.
- `OFFSET` skips rows before returning results.

## EXPLAIN

~~~sql
EXPLAIN [ ANALYZE ] [ FORMAT MERMAID | FORMAT TEXT ] statement
~~~

Displays the logical query plan.

- `ANALYZE` executes the query and appends execution metrics.
- `FORMAT` specifies output style: `TEXT` (default) or [`MERMAID`](https://mermaid.js.org/) for diagramming.

!!! warning
    Output format may change across versions and is not intended for machine parsing.

## EXECUTE :octicons-beaker-24: 

Execute a prepared statement.

~~~sql
EXECUTE statement_name[(<parameter=value[, ...]>)]
~~~

The `EXECUTE` clause executes a prepared statement. The parameters supplied in the invocation clause are used to populate placeholders in the prepared statement. The supplied parameters must be named, for example `EXECUTE PLANETS_BY_ID (id=1)`.

... (truncated)
