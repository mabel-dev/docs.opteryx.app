---
title: DROP VIEW Statement — Opteryx Reference
description: SQL DROP VIEW statement syntax and examples for removing views in Opteryx
---

# DROP VIEW

The `DROP VIEW` statement removes an existing view.

## Basic Syntax

~~~sql
DROP VIEW [IF EXISTS] [workspace].[collection].[view_name] [, ...];
~~~

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

## Notes

- `DROP VIEW IF EXISTS` is supported for conditional drops — it skips the operation without error if the view does not exist.
- Use the fully qualified name: `[workspace].[collection].[view_name]`.
- Requires the `owner` role on the view — a `writer` grant is not enough to remove it.
- `CASCADE` and `RESTRICT` are **not supported** and are rejected when the query is planned; Opteryx never drops dependants on your behalf.
- Any queries or views depending on this view will fail after the drop.
- Dropping a view does not affect the underlying data or relations it was based on.
