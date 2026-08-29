---
title: CREATE TASK Statement — Opteryx Reference
description: SQL CREATE TASK statement syntax and examples for defining a statement the platform runs for you in Opteryx
---

# CREATE TASK

The `CREATE TASK` statement records a statement the platform can run on your behalf, either
on demand with [EXECUTE](execute) or automatically when a table changes.

A task is the general form of the machinery behind a materialized view. Where a view
re-runs one `SELECT` into its own backing table, a task runs any statement the engine can
plan — typically an `INSERT` that appends only what changed, which is what makes it
suitable for tables too large to rebuild.

A task runs as its owner, so creating one is not merely registering some SQL: it creates
something that executes with an identity. What you may define is therefore bounded by what
you could already run yourself — see [Notes](#notes).

## Syntax

~~~sql
CREATE [ OR REPLACE ] TASK <task_name>
    [ ON <table_name> ]
    AS <statement>;
~~~

## Parameters

- **`<task_name>`** — the name of the task, fully qualified as
  `<workspace>.<collection>.<task_name>`. A task shares its namespace with tables and
  views, so the name must be free.
- **`<table_name>`** — a table whose commits fire this task. Supplying it creates the
  trigger alongside the task, so one statement leaves nothing half-wired. Omit it and the
  task is defined but nothing fires it, which is what a backfill or a replay wants; add
  triggers later with [CREATE TRIGGER](create-trigger).
- **`<statement>`** — the SQL the task runs. It may contain `:name` placeholders, which are
  supplied when the task is executed rather than now.
- `OR REPLACE` — redefine an existing task instead of refusing. The previous statement is
  kept as an earlier version, and the task's owner is **not** changed.

## Examples

### Define a Task Run on Demand
~~~sql
CREATE TASK my_workspace.ops.rebuild_summary AS
    INSERT INTO my_workspace.ops.summary
    SELECT category, COUNT(*) FROM my_workspace.sales.orders GROUP BY category;
~~~

### Define a Task Fired by a Table
~~~sql
CREATE TASK my_workspace.ops.ingest_events
    ON my_workspace.raw.events
    AS INSERT INTO my_workspace.ops.event_log
       SELECT * FROM my_workspace.raw.events VERSION AS OF :current_version;
~~~

### Parameterize the Window
A task fired by a table is passed the committing snapshot and the one before it, so it can
process only what that commit added:

~~~sql
CREATE TASK my_workspace.ops.ingest_new
    ON my_workspace.raw.events
    AS INSERT INTO my_workspace.ops.event_log
       SELECT c.*
       FROM my_workspace.raw.events VERSION AS OF :current_version AS c
       LEFT ANTI JOIN my_workspace.raw.events VERSION AS OF :parent_version AS p
         ON c.event_id = p.event_id;
~~~

### Redefine an Existing Task
~~~sql
CREATE OR REPLACE TASK my_workspace.ops.ingest_events AS
    SELECT 1;
~~~

## Notes

- **You may only create a task you could run yourself.** Creating one requires `reader` on
  everything the statement reads and `writer` where it writes, checked against you at the
  time you create it and again every time you redefine it. Without that, a task would let
  anyone define work over data they cannot see and have a privileged identity run it.
- **The task runs as you.** There is no syntax for naming another principal — an argument
  that could is the escalation above, written out. Ownership survives `OR REPLACE`, so
  editing a task never quietly transfers whose authority it runs with.
- **Platform identities cannot own tasks.** They can read a great deal but have no billing
  account, so a task pinned to one would run on a schedule forever and land on nobody's
  bill. Own a task as a user or a service account.
- The statement is parsed when the task is created, so SQL that could never run is refused
  now rather than discovered when it fires. It is not fully planned — a task's placeholders
  have no values yet, and planning would demand them.
- A task cannot create, drop, or run another task.
- Relations inside the statement must be **fully qualified**. A task is planned with no
  implicit workspace, so a two-part name cannot be resolved.
