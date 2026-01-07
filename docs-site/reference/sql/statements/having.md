---
title: HAVING Clause — Opteryx Reference
description: SQL HAVING clause syntax and examples for filtering grouped results in Opteryx
---

# HAVING

The `HAVING` clause filters grouped results after aggregation. It is always used with `GROUP BY`.

## Basic Syntax

```sql
SELECT column1, aggregate_function(column2)
  FROM relation_name
 GROUP BY column1
 HAVING condition;
```

## Key Differences from WHERE

- **WHERE** filters rows before grouping
- **HAVING** filters groups after aggregation

## Examples

### Simple HAVING Filter
```sql
SELECT category, COUNT(*) AS count
  FROM products
 GROUP BY category
 HAVING COUNT(*) > 5;
```

### Multiple Conditions
```sql
SELECT 
  customer_id,
  COUNT(*) AS orders,
  SUM(amount) AS total
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 2 
   AND SUM(amount) > 1000;
```

### Using Aliases
```sql
SELECT 
  department,
  AVG(salary) AS avg_salary
FROM employees
GROUP BY department
HAVING AVG(salary) > 50000;
```

### Complex Aggregation
```sql
SELECT 
  year,
  COUNT(DISTINCT customer_id) AS unique_customers,
  SUM(amount) AS total_revenue
FROM orders
GROUP BY year
HAVING COUNT(DISTINCT customer_id) > 100
   AND SUM(amount) > 100000;
```

## Notes

- `HAVING` requires a preceding `GROUP BY`.
- You can filter on aggregate functions directly in the condition.
- Combining `WHERE` and `HAVING` filters before and after grouping respectively.

Example with both WHERE and HAVING:
```sql
SELECT category, COUNT(*) AS count
  FROM products
 WHERE price > 10
 GROUP BY category
 HAVING COUNT(*) > 5;
```
