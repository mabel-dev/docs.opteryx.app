---
title: DROP MATERIALIZED VIEW Statement — Opteryx Reference
description: SQL DROP MATERIALIZED VIEW statement syntax and examples for removing materialized views in Opteryx
---

# DROP MATERIALIZED VIEW

The `DROP MATERIALIZED VIEW` statement removes a materialized view: the physical backing
table is dropped **and** the view's refresh triggers are removed from all of its source
tables.

## Syntax

~~~sql
DROP MATERIALIZED VIEW [ IF EXISTS ] <workspace>.<collection>.<view_name>;
~~~

## Parameters

- **`<workspace>.<collection>.<view_name>`** — the materialized view to drop, fully
  qualified.
- `IF EXISTS` — skip the operation without error if the materialized view does not exist,
  instead of refusing the statement.

## Examples

### Drop a Materialized View
~~~sql
DROP MATERIALIZED VIEW my_workspace.analytics.daily_totals;
~~~

### Drop Only If It Exists
~~~sql
DROP MATERIALIZED VIEW IF EXISTS my_workspace.analytics.daily_totals;
~~~

## Notes

- Requires the `owner` role on the materialized view.
- [DROP TABLE](drop-table.md) against a materialized view is rejected and points you
  here; equally, `DROP MATERIALIZED VIEW` against a plain table is rejected and points
  you to `DROP TABLE`.
- To stop a materialized view refreshing without removing it, drop one of its refresh
  triggers with [DROP TRIGGER](drop-trigger.md) instead — the view stays queryable but
  no longer updates.
- Dropping a materialized view removes the stored result it holds; this cannot be undone.

## See Also

- [CREATE MATERIALIZED VIEW](create-materialized-view.md)
- [ALTER MATERIALIZED VIEW](alter-materialized-view.md)
- [REFRESH MATERIALIZED VIEW](refresh-materialized-view.md)
- [DROP TABLE](drop-table.md)
- [DROP TRIGGER](drop-trigger.md)
