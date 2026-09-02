---
title: CREATE TRIGGER Statement — Opteryx Reference
description: SQL CREATE TRIGGER statement syntax and examples for firing a task when a table changes in Opteryx
---

# CREATE TRIGGER

The `CREATE TRIGGER` statement attaches a trigger to a table so that committing to that
table runs a [task](create-task).

Use this when the firing condition is not simply "the table the task reads" — a task can be
fired by a table it does not itself read, or defined first and wired up later. Where the
two do coincide, `CREATE TASK ... ON <table>` creates the trigger for you in one statement.

A task has **one** trigger at most. Attaching a second is refused, because a fired run's
window is a pair of snapshot ids from the firing table, and two tables would push two
unrelated version sequences through the same two placeholders. Two tables that should
cause the same work are two tasks, or a [materialized view](create-materialized-view).

Triggers that refresh a **materialized view** are still created automatically by
[CREATE MATERIALIZED VIEW](create-materialized-view) and are not authored with this
statement.

## Syntax

~~~sql
CREATE [ OR REPLACE ] TRIGGER <trigger_name>
    ON <table_name>
    EXECUTE <task_name>;
~~~

## Parameters

- **`<trigger_name>`** — a name for the trigger, unique among the triggers on that table.
- **`<table_name>`** — the table whose commits fire it, fully qualified as
  `<workspace>.<collection>.<table_name>`. Only commits that write data fire a trigger;
  housekeeping such as compaction and expiration does not.
- **`<task_name>`** — the task to run, fully qualified.
- `OR REPLACE` — repoint an existing trigger of this name. Without it, a trigger already
  pointing at a different task is left alone and the statement is refused, so one trigger
  cannot silently steal another's name.

## Examples

### Fire a Task When a Table Changes
~~~sql
CREATE TRIGGER ingest_on_events
    ON my_workspace.raw.events
    EXECUTE my_workspace.ops.ingest_new;
~~~

### Fire a Task From a Table It Does Not Read
~~~sql
-- The task joins a small event table to a large reference table, and should
-- run when events land, not every time the reference data is reloaded.
CREATE TRIGGER reconcile_on_events
    ON my_workspace.raw.events
    EXECUTE my_workspace.ops.reconcile;
~~~

### Repoint an Existing Trigger
~~~sql
CREATE OR REPLACE TRIGGER ingest_on_events
    ON my_workspace.raw.events
    EXECUTE my_workspace.ops.ingest_v2;
~~~

## Notes

- Requires the `writer` role on the **table** the trigger is attached to — landing a
  trigger is an update to that table.
- **The trigger's runs execute as its owner, which is pinned to you.** The trigger is what
  makes a run unattended, so the trigger is what names whose authority the run carries.
  The task's statement is gated against that owner every time it fires — nothing is
  settled once at creation and left to go stale. Move the owner with
  [ALTER TRIGGER ... OWNER TO](alter-trigger).
- **Platform identities cannot own triggers.** They can read a great deal but have no
  billing account, so work pinned to one would run on a schedule forever and land on
  nobody's bill. Own a trigger as a user or a service account.
- A fired task is passed the committing snapshot and its parent, as `:current_version` and
  `:parent_version`. The window is fixed when the trigger fires, so a run means the same
  thing however long afterwards it is picked up.
- **One trigger per task.** A `CREATE TRIGGER` naming a task that already has a trigger on
  another table is refused, and the message names the trigger that holds it. Drop that
  one first with [DROP TRIGGER](drop-trigger) to move the task, or define a second task.
- Only **catalog events** — a commit to a table — can fire a trigger. Clock schedules and
  application signals are refused rather than stored, because nothing dispatches them yet
  and a trigger nothing fires is worse than none: the table it maintains stops updating
  while the trigger record still looks healthy.
- To stop a trigger without losing it, use
  [ALTER TRIGGER ... SUSPEND](alter-trigger).
