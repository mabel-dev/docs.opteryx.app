---
title: ORDER BY Clause — Opteryx Reference
description: SQL ORDER BY clause syntax, sorting, and examples for ordering results in Opteryx
---

# ORDER BY

The `ORDER BY` clause sorts the result set by one or more columns in ascending or descending order.

## Syntax

~~~sql
SELECT <column> [, ...]
  FROM <relation_name>
 WHERE <condition>
 GROUP BY ...
 HAVING ...
 ORDER BY { <column> | <position> | <expression> } [ ASC | DESC ] [, ...]
 LIMIT ...;
~~~

## Parameters

- **`<column>`** — a column name or `SELECT` alias to sort by.
- **`<position>`** — a 1-based index into the `SELECT` list, sorting by that column.
- **`<expression>`** — a computed expression or function call to sort by.
- `ASC` — ascending order (A to Z, smallest to largest). The default if omitted.
- `DESC` — descending order (Z to A, largest to smallest).

Multiple sort keys, comma-separated, are evaluated left to right — the second key only breaks
ties left by the first.

## Examples

### Single Column Sorting
~~~sql
SELECT id, name, created_at
  FROM users
 ORDER BY created_at DESC;

SELECT product_id, price, name
  FROM products
 ORDER BY price ASC;
~~~

### Multiple Column Sorting
Sort by the first column, then by the second within groups of equal values:

~~~sql
SELECT category, name, price
  FROM products
 ORDER BY category ASC, price DESC;
~~~

### Sorting by Column Position
Reference columns by their position in the `SELECT` list:

~~~sql
SELECT id, name, amount
  FROM orders
 ORDER BY 3 DESC;  -- Sort by third column (amount)
~~~

### Sorting by Expressions
Sort by computed expressions or functions:

~~~sql
SELECT id, first_name, last_name
  FROM users
 ORDER BY LENGTH(first_name) DESC;

SELECT id, amount, created_at
  FROM orders
 ORDER BY EXTRACT(YEAR FROM created_at), amount DESC;
~~~

### Sorting with Pagination
~~~sql
SELECT id, name, email
  FROM users
 ORDER BY created_at DESC
 LIMIT 10;
~~~

### Complex Multi-Column Sort
~~~sql
SELECT 
  customer_id,
  order_date,
  amount
FROM orders
ORDER BY customer_id ASC, order_date DESC;
~~~

### Sorting by Aggregates
~~~sql
SELECT 
  category,
  COUNT(*) AS count,
  SUM(amount) AS total
FROM products
GROUP BY category
ORDER BY total DESC;
~~~

## Notes

- `ORDER BY` is applied to the final result set, after `WHERE`, `GROUP BY`, and `HAVING`.
- Ordering by `SELECT` aliases is supported, since `ORDER BY` runs after `SELECT`.
- NULL values typically sort first (or last depending on the database).
- Use column aliases or position numbers instead of full expressions for clarity.
- Multiple sort keys are evaluated left to right.

## See Also

- [SELECT](select.md)
- [LIMIT and OFFSET](limit.md)
- [GROUP BY](group-by.md)
- [HAVING](having.md)
