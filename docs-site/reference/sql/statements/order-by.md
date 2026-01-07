---
title: ORDER BY Clause — Opteryx Reference
description: SQL ORDER BY clause syntax, sorting, and examples for ordering results in Opteryx
---

# ORDER BY

The `ORDER BY` clause sorts the result set by one or more columns in ascending or descending order.

## Basic Syntax

```sql
SELECT columns
  FROM relation_name
 WHERE conditions
 GROUP BY ...
 HAVING ...
 ORDER BY column1 [ASC | DESC], column2 [ASC | DESC], ...
 LIMIT ...;
```

## Sort Direction

- **ASC** (default) - ascending order (A to Z, smallest to largest)
- **DESC** - descending order (Z to A, largest to smallest)

## Single Column Sorting

```sql
SELECT id, name, created_at
  FROM users
 ORDER BY created_at DESC;

SELECT product_id, price, name
  FROM products
 ORDER BY price ASC;
```

## Multiple Column Sorting

Sort by the first column, then by the second within groups of equal values:

```sql
SELECT category, name, price
  FROM products
 ORDER BY category ASC, price DESC;
```

## Sorting by Column Position

Reference columns by their position in the `SELECT` list:

```sql
SELECT id, name, amount
  FROM orders
 ORDER BY 3 DESC;  -- Sort by third column (amount)
```

## Sorting by Expressions

Sort by computed expressions or functions:

```sql
SELECT id, first_name, last_name
  FROM users
 ORDER BY LENGTH(first_name) DESC;

SELECT id, amount, created_at
  FROM orders
 ORDER BY YEAR(created_at), amount DESC;
```

## Examples

### Sorting with Pagination
```sql
SELECT id, name, email
  FROM users
 ORDER BY created_at DESC
 LIMIT 10;
```

### Complex Multi-Column Sort
```sql
SELECT 
  customer_id,
  order_date,
  amount
FROM orders
ORDER BY customer_id ASC, order_date DESC;
```

### Sorting by Aggregates
```sql
SELECT 
  category,
  COUNT(*) AS count,
  SUM(amount) AS total
FROM products
GROUP BY category
ORDER BY total DESC;
```

## Notes

- `ORDER BY` is applied to the final result set, after `WHERE`, `GROUP BY`, and `HAVING`.
- NULL values typically sort first (or last depending on the database).
- Use column aliases or position numbers instead of full expressions for clarity.
- Multiple sort keys are evaluated left to right.
