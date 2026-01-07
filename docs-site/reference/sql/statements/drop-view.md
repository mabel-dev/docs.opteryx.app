---
title: DROP VIEW Statement — Opteryx Reference
description: SQL DROP VIEW statement syntax and examples for removing views in Opteryx
---

# DROP VIEW

The `DROP VIEW` statement removes an existing view.

## Basic Syntax

```sql
DROP VIEW [workspace].[collection].[view_name];
```

## Examples

### Drop a View
```sql
DROP VIEW workspace.collection.my_view;
```

### Drop Multiple Views
```sql
DROP VIEW workspace.collection.view1;
DROP VIEW workspace.collection.view2;
```

## Notes

- The view must exist; use `DROP VIEW IF EXISTS` for conditional drops (if supported).
- Use the fully qualified name: `[workspace].[collection].[view_name]`.
- Any queries or views depending on this view will fail after the drop.
- Dropping a view does not affect the underlying data or relations it was based on.
