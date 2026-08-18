---
title: UNION, INTERSECT, and EXCEPT — Opteryx Reference
description: Set operations (UNION, INTERSECT, EXCEPT) for combining query results in Opteryx
---

# Set Operations

Set operations combine the results of multiple queries into a single result set. Opteryx supports three operators:

| Operator | Purpose |
|----------|---------|
| [`UNION`](#union) | Combine rows from two queries, removing duplicates (or `UNION ALL` to keep them) |
| [`INTERSECT`](#intersect) | Return rows that appear in both query results |
| [`EXCEPT`](#except) | Return rows from the first query that don't appear in the second |

## Syntax

~~~sql
<query> UNION [ ALL ] <query>;

<query> INTERSECT <query>;

<query> EXCEPT <query>;
~~~

All result sets combined this way must have the same number and types of columns; column names in the result come from the first query, and column order must match across queries.

## UNION

~~~sql
<query> UNION [ ALL ] <query>;
~~~

Combines results from two or more queries.

### Parameters

- `ALL` — keep duplicate rows instead of removing them. Faster than the default, since no
  deduplication pass is needed.

### Examples

#### Combine Two Queries
~~~sql
SELECT customer_id, 'order' AS source
  FROM orders
UNION
SELECT customer_id, 'return' AS source
  FROM returns;
~~~

#### UNION ALL
Combines results without removing duplicates (faster):

~~~sql
SELECT id FROM customers
UNION ALL
SELECT id FROM legacy_customers;
~~~

#### Finding Unique Customers Across Multiple Sources
~~~sql
SELECT customer_id FROM current_customers
UNION
SELECT customer_id FROM archived_customers;
~~~

## INTERSECT

~~~sql
<query> INTERSECT <query>;
~~~

Returns rows that appear in both query results.

### Examples

#### Basic INTERSECT
~~~sql
SELECT customer_id FROM orders WHERE amount > 1000
INTERSECT
SELECT customer_id FROM customers WHERE status = 'premium';
-- Returns customers who placed orders > $1000 AND have premium status
~~~

#### Finding Active Customers in Multiple Categories
~~~sql
SELECT customer_id FROM electronics_buyers
INTERSECT
SELECT customer_id FROM software_buyers;
-- Returns customers who bought from both categories
~~~

## EXCEPT

~~~sql
<query> EXCEPT <query>;
~~~

Returns rows from the first query that don't appear in the second query.

### Examples

#### Basic EXCEPT
~~~sql
SELECT customer_id FROM all_customers
EXCEPT
SELECT customer_id FROM suspended_customers;
-- Returns customers who are not suspended
~~~

#### Finding Customers with Missing Data
~~~sql
SELECT customer_id FROM orders
EXCEPT
SELECT customer_id FROM customer_profiles;
-- Returns customer IDs in orders but not in profiles
~~~

## Literal Values

Set operations can be used directly on literal values without a `FROM` clause:

~~~sql
SELECT 1 UNION ALL SELECT 2;

SELECT 1, 'a' UNION ALL SELECT 2, 'b';
~~~

## As a Subquery

Set operations can be used as a subquery in a `FROM` clause. The result must be aliased:

~~~sql
SELECT *
  FROM (
    SELECT name, id FROM $planets
    UNION ALL
    SELECT name, id FROM $planets
  ) AS combined;

SELECT *
  FROM (
    SELECT name, id FROM $planets WHERE id <= 5
    INTERSECT
    SELECT name, id FROM $planets WHERE id > 2
  ) AS overlap;

SELECT *
  FROM (
    SELECT name, id FROM $planets WHERE id <= 5
    EXCEPT
    SELECT name, id FROM $planets WHERE id < 3
  ) AS difference;
~~~

## Notes

- All result sets in a `UNION`/`INTERSECT`/`EXCEPT` must have the same number and types of columns.
- Column names from the first query are used in the result set.
- `UNION` removes duplicates; use `UNION ALL` to keep them.
- Column order must match across queries.
- You can use `ORDER BY` at the end of a set operation to sort final results.

## See Also

- [SELECT](select)
- [WITH (CTE)](with)
- [ORDER BY](order-by)
