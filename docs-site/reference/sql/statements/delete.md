---
title: DELETE Statement — Opteryx Reference
description: SQL DELETE statement syntax and examples for removing data in Opteryx
---

# DELETE

The `DELETE` statement removes rows from a table.

## Basic Syntax

!!! warning
    DELETE is experimental and only works against the local backend. It is not suitable for production use.

~~~sql
DELETE FROM table_name
 WHERE condition;
~~~

## Delete Specific Rows

~~~sql
DELETE FROM sessions
 WHERE expires_at < CURRENT_TIMESTAMP;

DELETE FROM orders
 WHERE status = 'cancelled';
~~~

## Delete All Rows

Remove all rows from a table:

~~~sql
DELETE FROM temporary_data;
~~~

!!! warning
    Deleting all rows without a `WHERE` clause will remove all data from the table. Use with caution.

## Delete with Subquery

~~~sql
DELETE FROM orders
 WHERE customer_id IN (
   SELECT id FROM customers WHERE status = 'inactive'
 );
~~~

## Examples

### Remove Expired Data
~~~sql
DELETE FROM sessions
 WHERE created_at < CURRENT_TIMESTAMP - INTERVAL 30 DAY;
~~~

### Cascade Delete Pattern
~~~sql
DELETE FROM order_items
 WHERE order_id IN (
   SELECT id FROM orders WHERE status = 'cancelled'
 );

DELETE FROM orders
 WHERE status = 'cancelled';
~~~

## Notes

- DELETE is experimental and only works against the local backend.
- Always include a `WHERE` clause to target specific rows.
- Consider archiving data instead of deleting for compliance and audit purposes.
