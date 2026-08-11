---
title: SHOW CREATE VIEW Statement — Opteryx Reference
description: SQL SHOW CREATE VIEW statement syntax and examples for inspecting a view's definition in Opteryx
---

# SHOW CREATE VIEW

The `SHOW CREATE VIEW` statement returns the query a view was created from.

## Syntax

~~~sql
SHOW CREATE VIEW <view_name>;
~~~

## Parameters

- **`<view_name>`** — fully qualified as `<workspace>.<collection>.<view_name>`.

## Result Columns

The result has one row and two columns: the fully qualified view name (used
as the column name itself) holding the view name again, and
`create_statement`, holding the `SELECT` the view was defined with.

## Examples

### View a Definition
~~~sql
SHOW CREATE VIEW workspace.collection.active_customers;
~~~

## Notes

- Only views are supported. `SHOW CREATE TABLE` is rejected when the query is planned — a
  table has no stored `CREATE` statement to show; its schema lives in the catalog. Use
  [SHOW COLUMNS](show-columns.md) to inspect a table's columns and types.
- Requires read access to the view. A view's body names the relations it reads, so showing
  it is treated as a read of the view — the same tier as selecting from it.
- Raises an error if the named view does not exist.

## See Also

- [CREATE VIEW](create-view.md)
- [DROP VIEW](drop-view.md)
- [SHOW COLUMNS](show-columns.md)
