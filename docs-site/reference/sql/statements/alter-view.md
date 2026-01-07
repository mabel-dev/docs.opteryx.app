---
title: ALTER VIEW Statement — Opteryx Reference
description: SQL ALTER VIEW statement syntax and examples for modifying view definitions in Opteryx
---

# ALTER VIEW

The `ALTER VIEW` statement modifies the definition of an existing view.

## Basic Syntax

```sql
ALTER VIEW [workspace].[collection].[view_name] AS
SELECT ...;
```

## Examples

### Update View Definition
```sql
ALTER VIEW workspace.collection.my_view AS
SELECT id, name, email
  FROM users
 WHERE active = TRUE;
```

### Fully Qualified Names
```sql
ALTER VIEW workspace.collection.active_orders AS
SELECT order_id, customer_id, amount, created_at
  FROM orders
 WHERE status = 'completed';
```

## Notes

- The view must exist before you can alter it.
- Use the fully qualified name: `[workspace].[collection].[view_name]`.
- The new definition replaces the entire previous query.
- Any queries depending on the view will use the updated definition on their next execution.
