---
title: WITH Clause (CTE) — Opteryx Reference
description: SQL WITH clause (Common Table Expressions) syntax and examples for named and recursive subqueries in Opteryx
---

# WITH (CTE)

The `WITH` clause defines Common Table Expressions (CTEs), which are named subqueries that can be reused multiple times within a single query. CTEs improve readability and reduce duplication. `WITH RECURSIVE` additionally allows a CTE to reference itself, for hierarchical and graph-traversal queries.

## Syntax

~~~sql
WITH <cte_name> AS ( <query> ) [, ...]
<statement>;

WITH RECURSIVE <cte_name> [ ( <column> [, ...] ) ] AS (
    <anchor_query>
    UNION [ ALL ]
    <recursive_query>
) [, ...]
<statement>;
~~~

## Parameters

- **`<cte_name>`** — the name the CTE is referenced by in `<statement>` and in later CTEs.
- **`<query>`** — the `SELECT` that defines the CTE's contents.
- **`<statement>`** — the main query, typically a [`SELECT`](select), that references one or
  more of the CTEs defined above it.
- **`<anchor_query>`** — the starting rows of a recursive CTE; it must not reference the CTE.
- **`<recursive_query>`** — the step applied repeatedly; it references the CTE exactly once,
  and on each pass sees only the rows the previous pass produced.

## Examples

### Single CTE
Define and use a single named subquery:

~~~sql
WITH recent_orders AS (
  SELECT * FROM orders WHERE created_at > '2024-01-01'
)
SELECT customer_id, COUNT(*) AS order_count
  FROM recent_orders
 GROUP BY customer_id;
~~~

### Multiple CTEs
Chain multiple CTEs together:

~~~sql
WITH active_customers AS (
  SELECT * FROM customers WHERE status = 'active'
),
high_value_orders AS (
  SELECT * FROM orders WHERE amount > 1000
)
SELECT 
  c.customer_id,
  c.name,
  COUNT(*) AS orders
FROM active_customers c
JOIN high_value_orders o ON c.id = o.customer_id
GROUP BY c.customer_id, c.name;
~~~

### Simplifying Complex Queries
~~~sql
WITH order_stats AS (
  SELECT 
    customer_id,
    COUNT(*) AS total_orders,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount
  FROM orders
  GROUP BY customer_id
)
SELECT 
  customer_id,
  total_orders,
  total_amount,
  avg_amount
FROM order_stats
WHERE total_amount > 5000
ORDER BY total_amount DESC;
~~~

### Recursive: counting
The anchor produces the first row; the recursive term runs repeatedly until it
produces no new rows:

~~~sql
WITH RECURSIVE series (n) AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM series WHERE n < 10
)
SELECT n FROM series ORDER BY n;
~~~

### Recursive: graph traversal
Reachability over an edge list. `UNION` (without `ALL`) deduplicates every row
against everything already produced, which is what makes traversal of a
**cyclic** graph terminate:

~~~sql
WITH RECURSIVE reach (node) AS (
  SELECT 1 AS node
  UNION
  SELECT e.dst
    FROM reach
    JOIN edges AS e ON e.src = reach.node
)
SELECT node FROM reach ORDER BY node;
~~~

### Recursive: carried state
Multiple columns update together across iterations:

~~~sql
WITH RECURSIVE fib AS (
    SELECT 1 AS pos, 0 AS val, 1 AS next_val
    UNION ALL
    SELECT pos + 1, next_val, val + next_val
    FROM fib
    WHERE pos < 10
)
SELECT pos, val AS fibonacci_number
FROM fib
ORDER BY pos;
~~~

### Chaining Transformations
~~~sql
WITH cleaned_data AS (
  SELECT 
    id,
    TRIM(name) AS name,
    LOWER(email) AS email
  FROM raw_users
  WHERE email IS NOT NULL
),
deduped AS (
  SELECT DISTINCT * FROM cleaned_data
)
SELECT * FROM deduped;
~~~

## Notes

- CTEs are scoped to the query; they don't persist after execution.
- Multiple CTEs are separated by commas.
- A CTE can reference previously defined CTEs but not later ones.
- A CTE referenced more than once is materialized once and shared by every reference.
- CTEs are useful for improving query readability and reducing repetition.

### Recursive CTE notes

- The body must be `<anchor> UNION [ALL] <recursive term>`, and only the
  recursive term may reference the CTE — exactly once, directly in its `FROM`
  clause. The `RECURSIVE` keyword is permission, not obligation: a CTE under
  `WITH RECURSIVE` that never references itself is planned as an ordinary CTE.
- `UNION` deduplicates each emitted row against the whole result so far;
  `UNION ALL` appends unconditionally. On cyclic data, use `UNION` (or bound
  the recursion with a depth column) — an unbounded `UNION ALL` recursion is
  stopped by the iteration ceiling (`MAX_RECURSION_ITERATIONS`, default 1000)
  with an error, never a truncated result.
- Both terms must produce the same number of columns with the same types; add
  an explicit `CAST` where they differ.
- The recursive term may not apply aggregation, window functions, `ORDER BY`
  or `LIMIT` over the self-reference, and may only reach it through `INNER`
  joins. Apply those in the query that reads the CTE instead. Mutual recursion
  (two CTEs referencing each other) is not supported.
- Result order is unspecified: add an `ORDER BY` to the reading query when
  order matters.
- `EXPLAIN ANALYZE` reports the iterations a recursive CTE ran (and, for
  `UNION`, its distinct row count) in a `RECURSIVE CTE` section.

## See Also

- [Working with CTEs](/docs/reference/sql/advanced/adv-working-with-ctes) — patterns, recursion in depth, performance notes
- [SELECT](select)
- [DISTINCT](distinct)
- [GROUP BY](group-by)
- [WHERE](where)
