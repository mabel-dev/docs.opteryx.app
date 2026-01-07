---
title: ANALYZE TABLE Statement — Opteryx Reference
description: SQL ANALYZE TABLE statement syntax and examples for collecting table statistics in Opteryx
---

# ANALYZE TABLE

The `ANALYZE TABLE` statement collects statistics for a named relation. These statistics may be used by the query optimizer to improve query plans.

## Basic Syntax

```sql
ANALYZE TABLE [workspace].[collection].[table_name];
```

## Examples

### Analyze a Table
```sql
ANALYZE TABLE workspace.collection.large_dataset;
```

### Analyze Before Running Complex Queries
```sql
ANALYZE TABLE workspace.collection.orders;
ANALYZE TABLE workspace.collection.customers;

SELECT o.*, c.name
  FROM orders o
  JOIN customers c ON o.customer_id = c.id;
```

## Notes

- Use the fully qualified name: `[workspace].[collection].[table_name]`.
- Running `ANALYZE TABLE` gathers statistics that the optimizer uses for query planning.
- The cost and benefit of analyzing tables depends on the underlying data store.
- Regular analysis is recommended for large datasets that change frequently.
