---
title: COMMENT Statement — Opteryx Reference
description: SQL COMMENT statement syntax and examples for adding comments to objects in Opteryx
---

# COMMENT

The `COMMENT` statement adds or modifies descriptive comments on tables and views. These comments provide documentation for data objects.

## Basic Syntax

```sql
COMMENT [IF EXISTS] ON TABLE [workspace].[collection].[table_name] IS '<comment_text>';

COMMENT [IF EXISTS] ON VIEW [workspace].[collection].[view_name] IS '<comment_text>';
```

## Table Comments

Add a comment to a table:

```sql
COMMENT ON TABLE workspace.collection.users IS 'User accounts and profile information';

COMMENT ON TABLE workspace.collection.orders IS 'All customer orders including status and amounts';
```

## View Comments

Add a comment to a view:

```sql
COMMENT ON VIEW workspace.collection.active_users IS 'Users with active accounts in the last 30 days';

COMMENT ON VIEW workspace.collection.order_summary IS 'Aggregated order statistics by customer';
```

## Conditional Comments

Use `IF EXISTS` to avoid errors if the object doesn't exist:

```sql
COMMENT IF EXISTS ON TABLE workspace.collection.old_data IS 'Legacy data table';

COMMENT IF EXISTS ON VIEW workspace.collection.temp_view IS 'Temporary analysis view';
```

## Examples

### Documenting a Dataset
```sql
COMMENT ON TABLE warehouse.sales.transactions IS 'Daily transaction records including customer ID, amount, and timestamp';

COMMENT ON VIEW warehouse.sales.daily_revenue IS 'Aggregated daily revenue by product category';
```

## Notes

- Comments are useful for documenting data lineage and business logic.
- Use the fully qualified name: `[workspace].[collection].[object_name]`.
- The `IF EXISTS` clause prevents errors when the object may not exist.
- Comments are typically retrieved through metadata queries or documentation tools.
