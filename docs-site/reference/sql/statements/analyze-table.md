---
title: ANALYZE TABLE Statement — Opteryx Reference
description: SQL ANALYZE TABLE statement syntax and examples for collecting table statistics in Opteryx
---

# ANALYZE TABLE

The `ANALYZE TABLE` statement collects statistics for a named relation. These statistics may be used by the query optimizer to improve query plans.

## Syntax

~~~sql
ANALYZE TABLE <table_name> [ FOR COLUMNS <column> [, ...] ];
~~~

## Parameters

- **`<table_name>`** — fully qualified as `<workspace>.<collection>.<table_name>`.
- `FOR COLUMNS <column> [, ...]` — narrow the work to the named columns, leaving other
  columns' existing statistics in place. Supported for local filesystem datasets only —
  see [Backend Support](#backend-support).

The `TABLE` keyword is required — `ANALYZE table_name` without it is rejected.

## Examples

### Analyze a Table
~~~sql
ANALYZE TABLE workspace.collection.large_dataset;
~~~

### Analyze Specific Columns
~~~sql
ANALYZE TABLE workspace.collection.large_dataset FOR COLUMNS region, created_at;
~~~

### Analyze Before Running Complex Queries
~~~sql
ANALYZE TABLE workspace.collection.orders;
ANALYZE TABLE workspace.collection.customers;

SELECT o.*, c.name
  FROM orders o
  JOIN customers c ON o.customer_id = c.id;
~~~

## Backend Support

| Dataset | Behaviour |
|---------|-----------|
| Catalog-backed (workspace) | Recomputes every column of every file and commits a new snapshot. `FOR COLUMNS` is **rejected** — the catalog's statistics builder has no column-subset concept, and honouring the clause would mean silently analyzing more than was asked. |
| Local filesystem | Computes statistics directly and rewrites the dataset manifest. `FOR COLUMNS` is supported. |
| Any other backend | Rejected — `ANALYZE / DROP STATISTICS is not supported for this dataset's storage backend.` |

Analyzing a catalog-backed dataset never rewrites, merges, or splits its data files; it is
a lighter operation than compaction.

## Notes

- Running `ANALYZE TABLE` gathers statistics that the optimizer uses for query planning.
- **Requires the `owner` role** on the table — the same tier as `ALTER TABLE`. It rewrites
  the metadata the optimizer plans from, which a `writer` grant does not cover.
- The cost and benefit of analyzing tables depends on the underlying data store.
- Regular analysis is recommended for large datasets that change frequently.

## See Also

- [DROP STATISTICS](drop-statistics)
- [ALTER TABLE](alter-table)
- [CREATE TABLE](create-table)
