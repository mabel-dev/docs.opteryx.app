---
title: SHOW CREATE Statement — Opteryx Reference
description: SQL SHOW CREATE statement syntax and examples for inspecting how a table, view, materialized view, task or trigger was defined in Opteryx
---

# SHOW CREATE

The `SHOW CREATE` statement returns the DDL that creates an object: a table, a view, a
materialized view, a task, or a trigger.

A view, a materialized view and a task each kept the statement that defined them, so
showing one returns that statement verbatim rather than a re-printed normalisation of it.
A table kept none — its shape is the catalog's, not a statement anybody stored — so its
DDL is **reconstructed** from its columns, their nullability, the relationships declared
on it and its clustering. A trigger kept only its own fields (target, event, schedule);
owner, suspend state and the minimum firing interval have no `CREATE TRIGGER` clause of
their own — they are exclusively [ALTER TRIGGER](alter-trigger) forms — so a trigger whose
owner, suspend state or interval differs from what a fresh registration would set renders
as the `CREATE TRIGGER` plus trailing `ALTER TRIGGER` statements for each, the way a
clustered table's `SHOW CREATE TABLE` renders a trailing `ALTER TABLE ... CLUSTER BY`.

## Syntax

~~~sql
SHOW CREATE TABLE <table_name>;
SHOW CREATE VIEW <view_name>;
SHOW CREATE MATERIALIZED VIEW <view_name>;
SHOW CREATE TASK <task_name>;
SHOW CREATE TRIGGER <trigger_name> ON <table_name>;
~~~

## Parameters

- **`<table_name>` / `<view_name>` / `<task_name>`** — fully qualified as
  `<workspace>.<collection>.<name>`.
- **`<trigger_name>`** — the trigger to show. A trigger name is only unique per holder, so
  `ON <table_name>` names it — the same convention [ALTER TRIGGER](alter-trigger) and
  [DROP TRIGGER](drop-trigger) use.

## Result Columns

The result has one row and two columns: a label (the object name for
`TABLE`/`VIEW`/`MATERIALIZED VIEW`/`TASK`, or `<trigger_name> ON <table_name>` for a
trigger, used as the column name itself, holding that same label again) and
`create_statement`, holding the DDL.

## Examples

### A View's Definition
~~~sql
SHOW CREATE VIEW workspace.collection.active_customers;
~~~

### A Table's Shape, Reconstructed
~~~sql
SHOW CREATE TABLE my_workspace.raw.events;
~~~

### A Task's Statement
~~~sql
SHOW CREATE TASK my_workspace.ops.ingest_events;
~~~

### A Trigger's Definition
~~~sql
SHOW CREATE TRIGGER ingest_on_events ON my_workspace.raw.events;
~~~

## Notes

- A clustered table returns **two** statements — a `CREATE TABLE` followed by an
  `ALTER TABLE ... CLUSTER BY` — because `CREATE TABLE` has no `CLUSTER BY` clause to carry
  it. Constraints need no such split: `CREATE TABLE` takes them. A column `DEFAULT` is
  never rendered, because none is stored — `ADD COLUMN ... DEFAULT` is a backfill value,
  not state a later `INSERT` consults.
- A table created by `CTAS` renders as an explicit-column `CREATE TABLE`, because the
  defining query was never kept — unlike a materialized view's, which is.
- A task's `ON <table>` clause is not rendered: it creates a trigger rather than belonging
  to the task, and `SHOW CREATE TRIGGER` / [SHOW TRIGGERS FOR](show-triggers) show those.
- Requires read access to the object: `WRITE` for a view or materialized view (its body
  names the relations it reads, so showing it is treated the same as running it would be),
  and `AUTOMATE` for a task or trigger (the same tier that creates or drops one — a
  trigger's definition names the identity its unattended runs carry).
- Naming an object of the wrong kind is **not found**, rather than answered from whatever
  holds the name — `SHOW CREATE TABLE` on a materialized view's backing store is refused
  by name, not silently described as a plain table.
- `FUNCTION`, `PROCEDURE` and `EVENT` parse but are refused: Opteryx has no such object to
  define.
- Raises an error if the named object does not exist.

## See Also

- [CREATE TABLE](create-table)
- [CREATE VIEW](create-view)
- [CREATE MATERIALIZED VIEW](create-materialized-view)
- [CREATE TASK](create-task)
- [CREATE TRIGGER](create-trigger)
- [SHOW COLUMNS](show-columns)
- [SHOW TRIGGERS FOR](show-triggers)
