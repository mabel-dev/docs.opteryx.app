---
title: SELECT Clause — Opteryx Reference
description: SQL SELECT clause syntax, usage, and examples for querying data in Opteryx
---

# SELECT

The `SELECT` clause specifies which columns or expressions to retrieve from a query.

## Basic Syntax

```sql
SELECT [ DISTINCT | DISTINCT ON (col1, col2, ...) ] 
       column1, column2, ..., expression1, ...
  FROM relation_name
 WHERE conditions
 GROUP BY ...
 HAVING ...
 ORDER BY ...
 LIMIT ...;
```

## Core Features

### Standard Selection
Retrieve specific columns or all columns using the wildcard `*`:

```sql
SELECT id, name, created_at
  FROM users;

SELECT *
  FROM orders;
```

### DISTINCT

Remove duplicate rows from results:

```sql
SELECT DISTINCT customer_id
  FROM orders;
```

### DISTINCT ON

Return distinct results based on specified columns while keeping the first occurrence:

```sql
SELECT DISTINCT ON (customer_id) 
       customer_id, order_date, amount
  FROM orders
 ORDER BY customer_id, order_date DESC;
```

### SELECT * EXCEPT

Exclude specific columns from `*` expansion:

```sql
SELECT * EXCEPT (internal_id, debug_field)
  FROM users;
```

## Examples

### Basic Selection
```sql
SELECT id, name, email
  FROM users
 WHERE active = TRUE;
```

### With Expressions and Aliases
```sql
SELECT 
  id,
  name,
  UPPER(email) AS email_upper,
  YEAR(created_at) AS signup_year
FROM users;
```

### Aggregation
```sql
SELECT 
  category,
  COUNT(*) AS item_count,
  SUM(amount) AS total_amount,
  AVG(price) AS avg_price
FROM products
GROUP BY category
ORDER BY total_amount DESC;
```

## Subqueries and CTEs

See [WITH (CTE)](#with-cte) for using Common Table Expressions.

```sql
SELECT p.id, p.name, p.price
  FROM products p
 WHERE p.price > (SELECT AVG(price) FROM products);
```

## Notes

- Columns can be referenced by name, position number, or alias.
- Expressions and functions are fully supported in the select list.
- Results are ordered by the `ORDER BY` clause if specified; otherwise, order is undefined.
- `LIMIT` restricts the number of rows returned.
