---
title: SELECT Clause — Opteryx Reference
description: SQL SELECT clause syntax, usage, and examples for querying data in Opteryx
---

# SELECT

The `SELECT` clause specifies which columns or expressions to retrieve from a query.

## Syntax

~~~sql
SELECT [ DISTINCT | DISTINCT ON ( <column> [, ...] ) ] <column> [, ...]
  FROM <relation_name>
 WHERE <condition>
 GROUP BY <column> [, ...]
 HAVING <condition>
 ORDER BY <column> [, ...]
 LIMIT <count>;

SELECT * [ EXCEPT ( <column> [, ...] ) ]
  FROM <relation_name>;
~~~

## Parameters

- **`<column>`** — a column name, expression, or `*`, comma-separated for multiple.
- **`<relation_name>`** — a table, view, subquery, or CTE to read from. See
  [Joins](joins) for combining rows from more than one relation.
- `DISTINCT` — remove duplicate rows from the result. See [DISTINCT](distinct).
- `DISTINCT ON (<column> [, ...])` — keep only the first row for each unique combination of
  the given columns. See [DISTINCT](distinct).
- `* EXCEPT (<column> [, ...])` — expand `*` to all columns except those listed.
- `WHERE <condition>` — filter rows before grouping. See [WHERE](where).
- `GROUP BY <column> [, ...]` — group rows for aggregation. See [GROUP BY](group-by).
- `HAVING <condition>` — filter groups after aggregation. See [HAVING](having).
- `ORDER BY <column> [, ...]` — sort the result. See [ORDER BY](order-by).
- `LIMIT <count>` — restrict the number of rows returned. See
  [LIMIT and OFFSET](limit).

## Examples

### Standard Selection
Retrieve specific columns or all columns using the wildcard `*`:

~~~sql
SELECT id, name, created_at
  FROM users;

SELECT *
  FROM orders;
~~~

### DISTINCT
Remove duplicate rows from results:

~~~sql
SELECT DISTINCT customer_id
  FROM orders;
~~~

See [DISTINCT](distinct) for the full set of forms, including `DISTINCT ON`.

### DISTINCT ON
Return distinct results based on specified columns while keeping the first occurrence:

~~~sql
SELECT DISTINCT ON (customer_id) 
       customer_id, order_date, amount
  FROM orders
 ORDER BY customer_id, order_date DESC;
~~~

### SELECT * EXCEPT
Exclude specific columns from `*` expansion:

~~~sql
SELECT * EXCEPT (internal_id, debug_field)
  FROM users;
~~~

### With Expressions and Aliases
~~~sql
SELECT 
  id,
  name,
  UPPER(email) AS email_upper,
  EXTRACT(YEAR FROM created_at) AS signup_year
FROM users;
~~~

### Aggregation
~~~sql
SELECT 
  category,
  COUNT(*) AS item_count,
  SUM(amount) AS total_amount,
  AVG(price) AS avg_price
FROM products
GROUP BY category
ORDER BY total_amount DESC;
~~~

### Filtering with a Subquery
~~~sql
SELECT p.id, p.name, p.price
  FROM products p
 WHERE p.price > (SELECT AVG(price) FROM products);
~~~

For named, reusable subqueries instead of inline ones, see [WITH (CTE)](with).

## Notes

- Columns can be referenced by name, position number, or alias.
- Expressions and functions are fully supported in the select list.
- Results are ordered by the `ORDER BY` clause if specified; otherwise, order is undefined.
- `LIMIT` restricts the number of rows returned.

## See Also

- [DISTINCT](distinct)
- [WHERE](where)
- [GROUP BY](group-by)
- [HAVING](having)
- [ORDER BY](order-by)
- [LIMIT and OFFSET](limit)
- [WITH (CTE)](with)
- [Joins](joins)
- [Window Functions](window-functions)
- [UNION, INTERSECT, and EXCEPT](union)
