---
title: TRUNCATE TABLE Statement — Opteryx Reference
description: SQL TRUNCATE TABLE statement syntax and examples for removing all rows from a table in Opteryx
---

# TRUNCATE TABLE

The `TRUNCATE TABLE` statement removes all rows from a table, leaving the table itself (and its schema) in place.

## Syntax

~~~sql
TRUNCATE TABLE [ IF EXISTS ] <table_name>;
~~~

## Parameters

- **`<table_name>`** — fully qualified as `<workspace>.<collection>.<table_name>`. Only one
  table name is accepted per statement.
- `IF EXISTS` — skip the operation without error if the table does not exist.

## Examples

### Empty a Table
~~~sql
TRUNCATE TABLE workspace.collection.staging_data;
~~~

### Truncate Only If It Exists
~~~sql
TRUNCATE TABLE IF EXISTS workspace.collection.staging_data;
~~~

## Notes

- The `TABLE` keyword is required — `TRUNCATE table_name` without it is rejected.
- Requires a connector that supports truncation — not every backend does.
- Removing all rows this way cannot be undone.
- A materialized view is **not** a table: this statement is rejected against one. Its contents come from its defining `SELECT` — see [REFRESH MATERIALIZED VIEW](refresh-materialized-view#a-materialized-view-is-not-a-table).

## See Also

- [DELETE](delete)
- [DROP TABLE](drop-table)
