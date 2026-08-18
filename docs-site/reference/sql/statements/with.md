---
title: WITH Clause (CTE) — Opteryx Reference
description: SQL WITH clause (Common Table Expressions) syntax and examples for named subqueries in Opteryx
---

# WITH (CTE)

The `WITH` clause defines Common Table Expressions (CTEs), which are named subqueries that can be reused multiple times within a single query. CTEs improve readability and reduce duplication.

## Syntax

~~~sql
WITH <cte_name> AS ( <query> ) [, ...]
<statement>;
~~~

## Parameters

- **`<cte_name>`** — the name the CTE is referenced by in `<statement>` and in later CTEs.
- **`<query>`** — the `SELECT` that defines the CTE's contents.
- **`<statement>`** — the main query, typically a [`SELECT`](select), that references one or
  more of the CTEs defined above it.

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
- CTEs are useful for improving query readability and reducing repetition.

## See Also

- [SELECT](select)
- [DISTINCT](distinct)
- [GROUP BY](group-by)
- [WHERE](where)
