---
title: DISTINCT Clause — Opteryx Reference
description: SQL DISTINCT clause syntax and examples for removing duplicates in Opteryx
---

# DISTINCT

The `DISTINCT` keyword removes duplicate rows from query results, returning only unique rows.

## Basic Syntax

```sql
SELECT DISTINCT column1, column2, ...
  FROM relation_name;
```

## DISTINCT (All Columns)

Remove duplicate rows across all columns:

```sql
SELECT DISTINCT * FROM users;
```

## DISTINCT (Specific Columns)

Return unique combinations of specified columns:

```sql
SELECT DISTINCT customer_id, country
  FROM orders;

SELECT DISTINCT category, brand
  FROM products;
```

## DISTINCT ON

Return distinct rows based on specified columns while keeping the first occurrence of each group:

```sql
SELECT DISTINCT ON (customer_id) 
       customer_id, order_date, amount
  FROM orders
 ORDER BY customer_id, order_date DESC;
```

This returns the most recent order for each customer.

## Examples

### Finding Unique Values
```sql
SELECT DISTINCT category
  FROM products
 ORDER BY category;
-- Returns each product category once
```

### Unique Combinations
```sql
SELECT DISTINCT country, state
  FROM users
 WHERE country = 'USA'
 ORDER BY state;
```

### Count of Unique Values
```sql
SELECT COUNT(DISTINCT customer_id) AS unique_customers
  FROM orders;
-- Returns the number of distinct customers
```

### DISTINCT ON with ORDER BY
```sql
SELECT DISTINCT ON (customer_id)
       customer_id,
       order_date,
       amount
  FROM orders
 ORDER BY customer_id, order_date DESC;
-- Returns the most recent order per customer
```

## Notes

- `DISTINCT` applies to all columns in the result set.
- `DISTINCT ON` is useful for finding the "first" or "last" row per group when combined with `ORDER BY`.
- Using `DISTINCT` can be expensive on large datasets; consider using `GROUP BY` if you need aggregates.
- `COUNT(DISTINCT column)` counts unique values in a column efficiently.
