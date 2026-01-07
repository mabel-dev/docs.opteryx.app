---
title: WHERE Clause — Opteryx Reference
description: SQL WHERE clause syntax, filter conditions, and examples for filtering rows in Opteryx
---

# WHERE

The `WHERE` clause filters rows based on specified conditions. Only rows where the condition evaluates to `TRUE` are included in the result set.

## Basic Syntax

```sql
SELECT columns
  FROM relation_name
 WHERE condition;
```

## Condition Types

### Simple Comparisons
```sql
SELECT * FROM users WHERE age > 18;
SELECT * FROM products WHERE price = 99.99;
SELECT * FROM orders WHERE status != 'cancelled';
```

### Logical Operators

Combine conditions using `AND`, `OR`, and `NOT`:

```sql
SELECT * FROM orders
 WHERE status = 'completed' 
   AND amount > 100
   AND created_at > '2024-01-01';

SELECT * FROM products
 WHERE category = 'electronics'
    OR category = 'software';

SELECT * FROM users WHERE NOT archived;
```

### IN Operator

Check if a value exists in a list:

```sql
SELECT * FROM orders
 WHERE status IN ('pending', 'processing', 'shipped');

SELECT * FROM users
 WHERE user_id NOT IN (1, 2, 3, 4, 5);
```

### BETWEEN Operator

Filter rows within a range:

```sql
SELECT * FROM transactions
 WHERE amount BETWEEN 100 AND 1000;

SELECT * FROM events
 WHERE event_date BETWEEN '2024-01-01' AND '2024-12-31';
```

### Pattern Matching

Use `LIKE` for pattern matching (with `%` and `_` wildcards):

```sql
SELECT * FROM users WHERE email LIKE '%@gmail.com';
SELECT * FROM products WHERE name LIKE 'Widget%';
SELECT * FROM files WHERE filename LIKE '%.pdf';
```

### NULL Checks

Check for NULL values:

```sql
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM orders WHERE deleted_at IS NOT NULL;
```

## Examples

### Multiple Conditions
```sql
SELECT id, name, email, created_at
  FROM users
 WHERE active = TRUE
   AND created_at >= '2024-01-01'
   AND email IS NOT NULL;
```

### Complex Logic
```sql
SELECT order_id, customer_id, amount
  FROM orders
 WHERE (status = 'completed' OR status = 'shipped')
   AND amount > 50
   AND created_at > CURRENT_DATE - INTERVAL 30 DAY;
```

### Subquery Conditions
```sql
SELECT name FROM users
 WHERE user_id IN (
   SELECT user_id FROM orders WHERE amount > 1000
 );
```

## Notes

- `WHERE` is evaluated before `GROUP BY`, `HAVING`, and `ORDER BY`.
- The condition must evaluate to a boolean value.
- Use parentheses to clarify the order of logical operations.
- For filtering grouped results, use `HAVING` instead.
