# SELECT

This page summarizes SELECT usage, including common clauses and examples.

## WITH (CTE)

Common Table Expressions (CTEs) allow you to name subqueries using `WITH` for reuse within a query.

```sql
WITH recent_orders AS (
  SELECT * FROM orders WHERE created_at > '2024-01-01'
)
SELECT customer_id, COUNT(*) FROM recent_orders GROUP BY customer_id;
```

## GROUP BY

Use `GROUP BY` to aggregate results by one or more expressions.

## HAVING

Filter grouped results using `HAVING`.

## JOIN

Combine data using `JOIN` clauses. See the Joins page for examples.

## LIMIT / OFFSET / ORDER BY / WHERE

Standard clauses to paginate and filter results.

## EXAMPLES

```sql
SELECT customer_id, COUNT(*) AS orders
  FROM orders
 WHERE status = 'completed'
 GROUP BY customer_id
 ORDER BY orders DESC
 LIMIT 10;
```