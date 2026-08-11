---
title: DROP VIEW Statement — Opteryx Reference
description: SQL DROP VIEW statement syntax and examples for removing views in Opteryx
---

# DROP VIEW

The `DROP VIEW` statement removes an existing view.

## Syntax

~~~sql
DROP VIEW [ IF EXISTS ] <view_name> [, ...];
~~~

## Parameters

- **`<view_name>`** — fully qualified as `<workspace>.<collection>.<view_name>`. Multiple
  names may be given, comma-separated, to drop several views in one statement.
- `IF EXISTS` — skip the operation without error if the view does not exist, instead of
  refusing the statement.

## Examples

### Drop a View
~~~sql
DROP VIEW workspace.collection.my_view;
~~~

### Drop Multiple Views
One statement can name several views:

~~~sql
DROP VIEW workspace.collection.view1, workspace.collection.view2;
~~~

### Only If It Exists
~~~sql
DROP VIEW IF EXISTS workspace.collection.my_view;
~~~

## Notes

- Requires the `owner` role on the view — a `writer` grant is not enough to remove it.
- `CASCADE` and `RESTRICT` are **not supported** and are rejected when the query is planned;
  Opteryx never drops dependants on your behalf.
- Any queries or views depending on this view will fail after the drop.
- Dropping a view does not affect the underlying data or relations it was based on.

## See Also

- [CREATE VIEW](create-view.md)
- [ALTER VIEW](alter-view.md)
- [DROP MATERIALIZED VIEW](drop-materialized-view.md)
- [DROP TABLE](drop-table.md)
