---
title: UPDATE Statement — Opteryx Reference
description: SQL UPDATE statement syntax and examples for modifying data in Opteryx
---

# UPDATE

The `UPDATE` statement modifies existing rows in a table.

## Basic Syntax

```sql
UPDATE table_name
   SET column1 = value1, column2 = value2, ...
 WHERE condition;
```

## Single Column Update

```sql
UPDATE users
   SET active = FALSE
 WHERE last_login < '2023-01-01';
```

## Multiple Column Update

```sql
UPDATE products
   SET price = 99.99, updated_at = CURRENT_TIMESTAMP
 WHERE category = 'sale';
```

## Update with Expressions

```sql
UPDATE orders
   SET discount = amount * 0.1,
       final_price = amount - (amount * 0.1)
 WHERE status = 'completed';
```

## Update from SELECT

```sql
UPDATE employees e
   SET salary = s.new_salary
  FROM salary_adjustments s
 WHERE e.id = s.employee_id;
```

## Conditional Update

```sql
UPDATE inventory
   SET quantity = CASE
                    WHEN quantity > 100 THEN quantity - 10
                    WHEN quantity > 50 THEN quantity - 5
                    ELSE quantity
                  END;
```

## Notes

- Always include a `WHERE` clause to target specific rows; without it, all rows will be updated.
- Not all data stores support UPDATE operations; availability depends on the backend.
- Use transactions to ensure data consistency across multiple updates.
