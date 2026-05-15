---
title: UPDATE Statement — Opteryx Reference
description: SQL UPDATE statement syntax and examples for modifying data in Opteryx
---

# UPDATE

The `UPDATE` statement modifies existing rows in a table.

## Basic Syntax

!!! warning
    UPDATE is experimental and only works against the local backend. It is not suitable for production use.

~~~sql
UPDATE table_name
   SET column1 = value1, column2 = value2, ...
 WHERE condition;
~~~

## Single Column Update

~~~sql
UPDATE users
   SET active = FALSE
 WHERE last_login < '2023-01-01';
~~~

## Multiple Column Update

~~~sql
UPDATE products
   SET price = 99.99, updated_at = CURRENT_TIMESTAMP
 WHERE category = 'sale';
~~~

## Update with Expressions

~~~sql
UPDATE orders
   SET discount = amount * 0.1,
       final_price = amount - (amount * 0.1)
 WHERE status = 'completed';
~~~

## Conditional Update

~~~sql
UPDATE inventory
   SET quantity = CASE
                    WHEN quantity > 100 THEN quantity - 10
                    WHEN quantity > 50 THEN quantity - 5
                    ELSE quantity
                  END;
~~~

## Notes

- UPDATE is experimental and only works against the local backend.
- Always include a `WHERE` clause to target specific rows; without it, all rows will be updated.
