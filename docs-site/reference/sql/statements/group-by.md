---
title: GROUP BY Clause — Opteryx Reference
description: SQL GROUP BY clause syntax, aggregation, and examples for grouping data in Opteryx
---

# GROUP BY

The `GROUP BY` clause groups rows by one or more columns and applies aggregate functions to each group.

## Basic Syntax

```sql
SELECT column1, column2, aggregate_function(column3)
  FROM relation_name
 WHERE conditions
 GROUP BY column1, column2
 ORDER BY ...;
```

## Grouping by Columns

Group results by one or more columns:

```sql
SELECT category, COUNT(*) AS item_count
  FROM products
 GROUP BY category;

SELECT country, city, COUNT(*) AS user_count
  FROM users
 GROUP BY country, city;
```

## GROUP BY ALL

Include all non-aggregated columns from the `SELECT` list automatically:

```sql
SELECT category, brand, COUNT(*) AS count
  FROM products
 GROUP BY ALL;
-- Equivalent to: GROUP BY category, brand
```

## Common Aggregate Functions

- `COUNT(*)` - count all rows in the group
- `SUM(column)` - sum values in the group
- `AVG(column)` - average of values in the group
- `MIN(column)` - minimum value in the group
- `MAX(column)` - maximum value in the group

## Examples

### Single Column Grouping
```sql
SELECT status, COUNT(*) AS total
  FROM orders
 GROUP BY status
 ORDER BY total DESC;
```

### Multiple Column Grouping
```sql
SELECT 
  date_trunc('month', created_at) AS month,
  category,
  COUNT(*) AS orders,
  SUM(amount) AS revenue,
  AVG(amount) AS avg_order_value
FROM orders
GROUP BY month, category
ORDER BY month DESC, revenue DESC;
```

### Conditional Aggregation
```sql
SELECT 
  customer_id,
  COUNT(*) AS total_orders,
  SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS completed_revenue
FROM orders
GROUP BY customer_id;
```

### With HAVING Filter
```sql
SELECT category, COUNT(*) AS count
  FROM products
 GROUP BY category
 HAVING COUNT(*) > 10;
```

## Notes

- Columns in `SELECT` must either be in `GROUP BY` or used within an aggregate function.
- `GROUP BY ALL` automatically groups by all non-aggregated columns.
- Use `HAVING` to filter groups after aggregation.
- `WHERE` filters rows before grouping; `HAVING` filters groups after.
