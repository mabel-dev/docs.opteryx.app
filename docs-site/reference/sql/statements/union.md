---
title: UNION, INTERSECT, and EXCEPT — Opteryx Reference
description: Set operations (UNION, INTERSECT, EXCEPT) for combining query results in Opteryx
---

# Set Operations

Set operations combine the results of multiple queries into a single result set.

## UNION

Combines results from two or more queries, removing duplicate rows.

### Basic Syntax
```sql
SELECT columns FROM table1
UNION
SELECT columns FROM table2;
```

### Example
```sql
SELECT customer_id, 'order' AS source
  FROM orders
UNION
SELECT customer_id, 'return' AS source
  FROM returns;
```

### UNION ALL

Combines results without removing duplicates (faster):

```sql
SELECT id FROM customers
UNION ALL
SELECT id FROM legacy_customers;
```

## INTERSECT

Returns rows that appear in both query results.

### Syntax
```sql
SELECT columns FROM table1
INTERSECT
SELECT columns FROM table2;
```

### Example
```sql
SELECT customer_id FROM orders WHERE amount > 1000
INTERSECT
SELECT customer_id FROM customers WHERE status = 'premium';
-- Returns customers who placed orders > $1000 AND have premium status
```

## EXCEPT

Returns rows from the first query that don't appear in the second query.

### Syntax
```sql
SELECT columns FROM table1
EXCEPT
SELECT columns FROM table2;
```

### Example
```sql
SELECT customer_id FROM all_customers
EXCEPT
SELECT customer_id FROM suspended_customers;
-- Returns customers who are not suspended
```

## Full Examples

### Finding Unique Customers Across Multiple Sources
```sql
SELECT customer_id FROM current_customers
UNION
SELECT customer_id FROM archived_customers;
```

### Finding Active Customers in Multiple Categories
```sql
SELECT customer_id FROM electronics_buyers
INTERSECT
SELECT customer_id FROM software_buyers;
-- Returns customers who bought from both categories
```

### Finding Customers with Missing Data
```sql
SELECT customer_id FROM orders
EXCEPT
SELECT customer_id FROM customer_profiles;
-- Returns customer IDs in orders but not in profiles
```

## Notes

- All result sets in a `UNION`/`INTERSECT`/`EXCEPT` must have the same number and types of columns.
- Column names from the first query are used in the result set.
- `UNION` removes duplicates; use `UNION ALL` to keep them.
- Column order must match across queries.
- You can use `ORDER BY` at the end of a set operation to sort final results.
