---
title: DROP TRIGGER Statement — Opteryx Reference
description: SQL DROP TRIGGER statement syntax and examples for removing a trigger from a table in Opteryx
---

# DROP TRIGGER

The `DROP TRIGGER` statement removes one trigger from a table. Whatever the trigger ran —
a [task](create-task), or the refresh of a [materialized view](create-materialized-view) —
stays where it is; commits to that table simply stop firing it.

To pause a trigger, prefer [ALTER TRIGGER ... SUSPEND](alter-trigger): a dropped trigger
is indistinguishable from one that was never created or that broke, whereas a suspended
one records that it was switched off deliberately, when, and by whom.

## Syntax

~~~sql
DROP TRIGGER [ IF EXISTS ] <trigger_name> ON <table_name>;
~~~

## Parameters

- **`<trigger_name>`** — the trigger to remove. A task trigger has the name it was given by
  [CREATE TRIGGER](create-trigger); a materialized view's refresh triggers are named
  `refresh__<collection>__<view_name>__<suffix>` when the view is created. Use
  [SHOW TRIGGERS FOR](show-triggers) to list the triggers on a table.
- **`<table_name>`** — the table the trigger is attached to, fully qualified as
  `<workspace>.<collection>.<table_name>`.
- `IF EXISTS` — skip the operation without error if the trigger does not exist, instead of
  refusing the statement.

## Examples

### Drop a Task Trigger
~~~sql
DROP TRIGGER ingest_on_events ON my_workspace.raw.events;
~~~

### Drop a Refresh Trigger
~~~sql
DROP TRIGGER refresh__analytics__daily_totals ON my_workspace.sales.orders;
~~~

### Drop Only If It Exists
~~~sql
DROP TRIGGER IF EXISTS ingest_on_events ON my_workspace.raw.events;
~~~

## Notes

- Requires the `writer` role on the table the trigger is attached to — removing a
  trigger is an update to that table.
- Dropping a task trigger leaves the task defined. It can still be run by hand with
  [EXECUTE](execute), and fired again by attaching a new trigger with
  [CREATE TRIGGER](create-trigger). A task has one trigger at a time, so dropping it is
  also how a task is moved from one table to another.
- Dropping a refresh trigger leaves the materialized view queryable, but it goes stale
  silently as its source changes. To resume refreshing, re-create the view with
  [CREATE OR REPLACE MATERIALIZED VIEW](create-materialized-view), which rebuilds its
  triggers. To stop a view refreshing on purpose, prefer
  [ALTER MATERIALIZED VIEW ... SUSPEND](alter-materialized-view#suspend-and-resume).
- `CASCADE` and `RESTRICT` are **not supported** and are rejected when the query is
  planned.
- Removing a materialized view entirely, triggers and all, is
  [DROP MATERIALIZED VIEW](drop-materialized-view).

## See Also

- [CREATE TRIGGER](create-trigger)
- [ALTER TRIGGER](alter-trigger)
- [SHOW TRIGGERS FOR](show-triggers)
- [CREATE TASK](create-task)
- [CREATE MATERIALIZED VIEW](create-materialized-view)
- [ALTER MATERIALIZED VIEW](alter-materialized-view)
- [DROP MATERIALIZED VIEW](drop-materialized-view)
