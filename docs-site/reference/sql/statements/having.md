---
title: HAVING Clause — Opteryx Reference
description: SQL HAVING clause syntax and examples for filtering grouped results in Opteryx
---

# HAVING

The `HAVING` clause filters grouped results after aggregation. It is always used with `GROUP BY`.

## Syntax

~~~sql
SELECT <column>, <aggregate_function>(<column>)
  FROM <relation_name>
 GROUP BY <column>
 HAVING <condition>;
~~~

## Parameters

- **`<condition>`** — a boolean expression evaluated after grouping and aggregation. It may
  reference aggregate functions directly, or a `SELECT` alias (an Opteryx-specific extension —
  see Notes).

## Examples

### Simple HAVING Filter
~~~sql
SELECT category, COUNT(*) AS count
  FROM products
 GROUP BY category
 HAVING COUNT(*) > 5;
~~~

### Multiple Conditions
~~~sql
SELECT 
  customer_id,
  COUNT(*) AS orders,
  SUM(amount) AS total
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 2 
   AND SUM(amount) > 1000;
~~~

### Using Aliases

Opteryx supports filtering by `SELECT` aliases in `HAVING`:

~~~sql
SELECT 
  department,
  AVG(salary) AS avg_salary
FROM employees
GROUP BY department
HAVING avg_salary > 50000;
~~~

### Complex Aggregation
~~~sql
SELECT 
  year,
  COUNT(DISTINCT customer_id) AS unique_customers,
  SUM(amount) AS total_revenue
FROM orders
GROUP BY year
HAVING COUNT(DISTINCT customer_id) > 100
   AND SUM(amount) > 100000;
~~~

### Combined with WHERE
`WHERE` and `HAVING` can be used together, filtering before and after grouping respectively:

~~~sql
SELECT category, COUNT(*) AS count
  FROM products
 WHERE price > 10
 GROUP BY category
 HAVING COUNT(*) > 5;
~~~

## Notes

- `HAVING` filters groups after aggregation; `WHERE` filters rows before grouping.
- `HAVING` requires a preceding `GROUP BY`.
- You can filter on aggregate functions directly in the condition.
- Opteryx supports filtering by `SELECT` aliases in `HAVING`.

## See Also

- [SELECT](select.md)
- [GROUP BY](group-by.md)
- [WHERE](where.md)
