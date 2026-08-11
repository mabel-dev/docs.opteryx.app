---
title: DROP TRIGGER Statement — Opteryx Reference
description: SQL DROP TRIGGER statement syntax and examples for removing a materialized view's refresh trigger from a table in Opteryx
---

# DROP TRIGGER

The `DROP TRIGGER` statement removes one refresh trigger from a table. The materialized
view the trigger served stays queryable, but commits to that table no longer refresh it —
To stop a view refreshing, prefer
[ALTER MATERIALIZED VIEW ... SUSPEND](alter-materialized-view.md#suspend-and-resume):
a dropped trigger is indistinguishable from one that was never created or that broke,
whereas a suspended view records that it was switched off deliberately, when, and by whom.

## Basic Syntax

~~~sql
DROP TRIGGER [IF EXISTS] trigger_name ON [workspace].[collection].[table_name];
~~~

Trigger names are auto-generated as `refresh__<collection>__<view_name>__<suffix>` when a
materialized view is created. Use [SHOW TRIGGERS FOR](show-triggers.md) to list the
triggers on a table.

## Examples

### Drop a Refresh Trigger
~~~sql
DROP TRIGGER refresh__analytics__daily_totals ON my_workspace.sales.orders;
~~~

### Drop Only If It Exists
~~~sql
DROP TRIGGER IF EXISTS refresh__analytics__daily_totals ON my_workspace.sales.orders;
~~~

## Notes

- `IF EXISTS` skips the operation without error if the trigger does not exist.
- Requires the `writer` role on the table the trigger is attached to — removing a
  trigger is an update to that table.
- After the drop, the materialized view goes stale silently as its source changes. To
  resume refreshing, re-create the view with
  [CREATE OR REPLACE MATERIALIZED VIEW](create-materialized-view.md), which rebuilds its
  triggers.
- `CASCADE` and `RESTRICT` are **not supported** and are rejected when the query is
  planned.
- There is **no `CREATE TRIGGER` statement** — triggers only come into existence through
  [CREATE MATERIALIZED VIEW](create-materialized-view.md).
- Removing a materialized view entirely, triggers and all, is
  [DROP MATERIALIZED VIEW](drop-materialized-view.md).
