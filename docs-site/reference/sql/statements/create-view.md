---
title: CREATE VIEW Statement — Opteryx Reference
description: SQL CREATE VIEW statement syntax and examples for creating views in Opteryx
---

# CREATE VIEW

The `CREATE VIEW` statement creates a new view that exposes the result of a query as a named relation.

## Basic Syntax

```sql
CREATE VIEW [workspace].[collection].[view_name] AS
SELECT ...;
```

## Examples

### Basic View
```sql
CREATE VIEW my_workspace.my_collection.active_users AS
SELECT id, name, email, created_at
  FROM users
 WHERE active = TRUE;
```

### Complex View with Joins
```sql
CREATE VIEW sales.analytics.order_summary AS
SELECT 
  o.order_id,
  c.customer_name,
  o.order_date,
  o.amount,
  COUNT(*) OVER (PARTITION BY c.customer_id) AS customer_order_count
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'completed';
```

### View Based on Another View
```sql
CREATE VIEW my_workspace.my_collection.high_value_customers AS
SELECT customer_id, SUM(amount) AS total_spent
FROM order_summary
GROUP BY customer_id
HAVING SUM(amount) > 10000;
```

## Notes

- Views are virtual relations defined by queries; they don't store data.
- Use fully qualified names: `[workspace].[collection].[view_name]`.
- Views are read-only in most contexts.
- View definitions are stored and can be modified with `ALTER VIEW` or removed with `DROP VIEW`.
