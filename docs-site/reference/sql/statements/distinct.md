---
title: DISTINCT Clause — Opteryx Reference
description: SQL DISTINCT clause syntax and examples for removing duplicates in Opteryx
---

# DISTINCT

The `DISTINCT` keyword removes duplicate rows from query results, returning only unique rows.

## Syntax

~~~sql
SELECT DISTINCT [ ON ( <column> [, ...] ) ] <column> [, ...]
  FROM <relation_name>;
~~~

## Parameters

- **`<column>`** — without `ON`, the columns considered when deduplicating rows (or every
  column, for `SELECT DISTINCT *`). With `ON`, the columns whose unique combinations
  determine grouping.
- `ON (<column> [, ...])` — keep only the first row for each unique combination of the given
  columns, instead of deduplicating on the full row. Typically paired with `ORDER BY` to
  control which row within each group counts as "first".

## Examples

### DISTINCT (All Columns)
Remove duplicate rows across all columns:

~~~sql
SELECT DISTINCT * FROM users;
~~~

### DISTINCT (Specific Columns)
Return unique combinations of specified columns:

~~~sql
SELECT DISTINCT customer_id, country
  FROM orders;

SELECT DISTINCT category, brand
  FROM products;
~~~

### DISTINCT ON
Return distinct rows based on specified columns while keeping the first occurrence of each group:

~~~sql
SELECT DISTINCT ON (customer_id) 
       customer_id, order_date, amount
  FROM orders
 ORDER BY customer_id, order_date DESC;
~~~

This returns the most recent order for each customer.

### Finding Unique Values
~~~sql
SELECT DISTINCT category
  FROM products
 ORDER BY category;
-- Returns each product category once
~~~

### Unique Combinations
~~~sql
SELECT DISTINCT country, state
  FROM users
 WHERE country = 'USA'
 ORDER BY state;
~~~

### Count of Unique Values
~~~sql
SELECT COUNT(DISTINCT customer_id) AS unique_customers
  FROM orders;
-- Returns the number of distinct customers
~~~

### DISTINCT ON with ORDER BY
~~~sql
SELECT DISTINCT ON (customer_id)
       customer_id,
       order_date,
       amount
  FROM orders
 ORDER BY customer_id, order_date DESC;
-- Returns the most recent order per customer
~~~

## Notes

- `DISTINCT` applies to all columns in the result set.
- `DISTINCT ON` is useful for finding the "first" or "last" row per group when combined with `ORDER BY`.
- Using `DISTINCT` can be expensive on large datasets; consider using `GROUP BY` if you need aggregates.
- `COUNT(DISTINCT column)` counts unique values in a column efficiently.

## See Also

- [SELECT](select)
- [GROUP BY](group-by)
- [ORDER BY](order-by)
