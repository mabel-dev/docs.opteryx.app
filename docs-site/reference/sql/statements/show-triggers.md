---
title: SHOW TRIGGERS FOR Statement — Opteryx Reference
description: SQL SHOW TRIGGERS FOR statement syntax and examples for listing the triggers attached to a table in Opteryx
---

# SHOW TRIGGERS FOR

The `SHOW TRIGGERS FOR` statement lists the triggers attached to a table: what a commit to
this table will fire, whose identity the run carries, and how the most recent firing went.

A trigger is one of two kinds. A **task trigger**, created with
[CREATE TRIGGER](create-trigger) or `CREATE TASK ... ON`, runs a [task](create-task). A
**refresh trigger**, created for you by
[CREATE MATERIALIZED VIEW](create-materialized-view), re-runs a materialized view's
query. Both kinds are listed together.

## Syntax

~~~sql
SHOW TRIGGERS FOR <table_name>;
~~~

Bare `SHOW TRIGGERS` is **not supported** — name the table with the `FOR` form, or query
[information_schema.triggers](../advanced/adv-information-schema)
for a workspace-wide listing:

~~~sql
SELECT * FROM my_workspace.information_schema.triggers;
~~~

## Parameters

- **`<table_name>`** — fully qualified as `<workspace>.<collection>.<table_name>`.

## Result Columns

The columns returned are those of
[information_schema.triggers](../advanced/adv-information-schema). The ones to read first:

- `action_kind` — `task` or `materialized_view_refresh`.
- `target` — what the trigger fires: the task it executes, or the materialized view it
  refreshes.
- `runs_as` — whose identity an unattended run carries.
- `last_fired_at` and `last_fired_status` — when a commit last reached it and how that
  went, the place to look when a task has not run or a materialized view seems stale.
  `throttled` means the commit landed inside the trigger's minimum interval and was
  deliberately not fired.
- `suspended_at` and `suspended_by` — set while the trigger is paused with
  [ALTER TRIGGER ... SUSPEND](alter-trigger), `NULL` otherwise.
- `minimum_interval_seconds` — the floor between two firings, set with
  [ALTER TRIGGER ... SET MINIMUM INTERVAL TO](alter-trigger). `NULL` for a trigger that
  fires on every commit.

## Examples

### List Triggers on a Table
~~~sql
SHOW TRIGGERS FOR my_workspace.sales.orders;
~~~

## Notes

- A task trigger has the name it was given when it was created. Refresh trigger names
  are auto-generated as `refresh__<collection>__<view_name>__<suffix>`.
- Only triggers you could alter are listed — the same gate `CREATE`, `ALTER` and
  `DROP TRIGGER` apply.
- Pause, rate-limit or repoint a listed trigger with [ALTER TRIGGER](alter-trigger) and
  [CREATE OR REPLACE TRIGGER](create-trigger); remove it with
  [DROP TRIGGER](drop-trigger).

## See Also

- [CREATE TRIGGER](create-trigger)
- [ALTER TRIGGER](alter-trigger)
- [DROP TRIGGER](drop-trigger)
- [CREATE TASK](create-task)
- [CREATE MATERIALIZED VIEW](create-materialized-view)
