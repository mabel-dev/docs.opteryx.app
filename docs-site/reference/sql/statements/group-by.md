---
title: GROUP BY Clause — Opteryx Reference
description: SQL GROUP BY clause syntax, aggregation, and examples for grouping data in Opteryx
---

# GROUP BY

The `GROUP BY` clause groups rows by one or more columns and applies aggregate functions to each group.

## Syntax

~~~sql
SELECT <column> [, ...], <aggregate_function>(<column>)
  FROM <relation_name>
 WHERE <condition>
 GROUP BY { <column> [, ...] | ALL }
 ORDER BY ...;
~~~

## Parameters

- **`<column>`** — one or more columns to group rows by, comma-separated. Every non-aggregated
  column in the `SELECT` list must appear here.
- `ALL` — group by every non-aggregated column in the `SELECT` list automatically, equivalent
  to listing them explicitly.

## Examples

### Grouping by Columns
Group results by one or more columns:

~~~sql
SELECT category, COUNT(*) AS item_count
  FROM products
 GROUP BY category;

SELECT country, city, COUNT(*) AS user_count
  FROM users
 GROUP BY country, city;
~~~

### GROUP BY ALL
Include all non-aggregated columns from the `SELECT` list automatically:

~~~sql
SELECT category, brand, COUNT(*) AS count
  FROM products
 GROUP BY ALL;
-- Equivalent to: GROUP BY category, brand
~~~

### Single Column Grouping
~~~sql
SELECT status, COUNT(*) AS total
  FROM orders
 GROUP BY status
 ORDER BY total DESC;
~~~

### Multiple Column Grouping
~~~sql
SELECT 
  EXTRACT(YEAR FROM created_at) AS year,
  category,
  COUNT(*) AS orders,
  SUM(amount) AS revenue,
  AVG(amount) AS avg_order_value
FROM orders
GROUP BY year, category
ORDER BY year DESC, revenue DESC;
~~~

### Conditional Aggregation
~~~sql
SELECT 
  customer_id,
  COUNT(*) AS total_orders,
  SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS completed_revenue
FROM orders
GROUP BY customer_id;
~~~

### With HAVING Filter
~~~sql
SELECT category, COUNT(*) AS count
  FROM products
 GROUP BY category
 HAVING COUNT(*) > 10;
~~~

## Notes

- Columns in `SELECT` must either be in `GROUP BY` or used within an aggregate function.
- `GROUP BY ALL` automatically groups by all non-aggregated columns.
- Common aggregate functions used with `GROUP BY`: `COUNT(*)`, `SUM(column)`, `AVG(column)`, `MIN(column)`, `MAX(column)`.
- Use `HAVING` to filter groups after aggregation.
- `WHERE` filters rows before grouping; `HAVING` filters groups after.

## See Also

- [SELECT](select)
- [HAVING](having)
- [WHERE](where)
- [ORDER BY](order-by)
- [Window Functions](window-functions)
