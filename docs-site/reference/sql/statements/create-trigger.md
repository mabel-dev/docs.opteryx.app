---
title: CREATE TRIGGER Statement — Opteryx Reference
description: SQL CREATE TRIGGER statement syntax and examples for firing a task when a table changes in Opteryx
---

# CREATE TRIGGER

The `CREATE TRIGGER` statement attaches a firing condition to a [task](create-task): a
commit to a table, a clock schedule, or an application signal.

Use this when the firing condition is not simply "the table the task reads" — a task can be
fired by a table it does not itself read, or defined first and wired up later. Where a
commit trigger and the task's own read do coincide, `CREATE TASK ... ON <table>` creates
the trigger for you in one statement.

A task has **one** trigger at most, whatever its kind. Attaching a second is refused: a
commit trigger's fired run is windowed by a pair of snapshot ids from the firing table,
and two tables would push two unrelated version sequences through the same two
placeholders. Two tables that should cause the same work are two tasks, or a
[materialized view](create-materialized-view).

Triggers that refresh a **materialized view** are still created automatically by
[CREATE MATERIALIZED VIEW](create-materialized-view) and are not authored with this
statement.

## Syntax

Three forms, told apart by what follows `ON`:

~~~sql
-- Commit trigger: fires when <table_name> is committed to.
CREATE [ OR REPLACE ] TRIGGER [ IF NOT EXISTS ] <trigger_name>
    ON <table_name>
    EXECUTE <task_name>;

-- Schedule trigger: fires on a clock.
CREATE [ OR REPLACE ] TRIGGER [ IF NOT EXISTS ] <trigger_name>
    ON SCHEDULE '<cron_expression>' [ AT TIME ZONE '<zone>' ] [ OVER <table_name> ]
    EXECUTE <task_name>;

-- Signal trigger: fires on an inbound application signal.
CREATE [ OR REPLACE ] TRIGGER [ IF NOT EXISTS ] <trigger_name>
    ON SIGNAL [ OVER <table_name> ]
    EXECUTE <task_name>;
~~~

## Parameters

- **`<trigger_name>`** — a name for the trigger, unique among the triggers on its holder
  (the table, for a commit trigger; the task, for a schedule or signal trigger, which has
  no source table to live under).
- **`<table_name>`** (commit form) — the table whose commits fire it, fully qualified as
  `<workspace>.<collection>.<table_name>`. Only commits that write data fire a trigger;
  housekeeping such as compaction and expiration does not.
- **`ON SCHEDULE '<cron_expression>'`** — fire on a clock. The cron expression takes five
  whitespace-separated fields (minute, hour, day of month, month, day of week), e.g.
  `'0 * * * *'` for every hour.
- **`AT TIME ZONE '<zone>'`** (schedule form only) — the time zone the schedule is read in.
  Defaults to UTC.
- **`OVER <table_name>`** (schedule and signal forms only) — the table a clock or a signal
  has no commit to supply a window from. Omit it and the fired run has no window at all.
- **`ON SIGNAL`** — fire on an inbound signal rather than a commit or a clock.
- **`<task_name>`** — the task to run, fully qualified.
- `OR REPLACE` — repoint an existing trigger of this name. Without it, a trigger already
  pointing at a different task is left alone and the statement is refused, so one trigger
  cannot silently steal another's name. Cannot be combined with `IF NOT EXISTS`.
- `IF NOT EXISTS` — leave an existing trigger of this name untouched instead of failing.
  A true no-op: none of the incoming clauses take effect if the trigger already exists.
  Cannot be combined with `OR REPLACE`.

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

### Fire a Task on a Clock
~~~sql
CREATE TRIGGER hourly_rollup
    ON SCHEDULE '0 * * * *'
    OVER my_workspace.raw.events
    EXECUTE my_workspace.ops.rollup;
~~~

### Fire a Task on a Clock in a Named Time Zone
~~~sql
CREATE TRIGGER nightly_close
    ON SCHEDULE '0 2 * * *' AT TIME ZONE 'America/New_York'
    EXECUTE my_workspace.ops.close_books;
~~~

### Fire a Task on an Application Signal
~~~sql
CREATE TRIGGER on_upload_complete
    ON SIGNAL
    OVER my_workspace.raw.uploads
    EXECUTE my_workspace.ops.process_upload;
~~~

### Repoint an Existing Trigger
~~~sql
CREATE OR REPLACE TRIGGER ingest_on_events
    ON my_workspace.raw.events
    EXECUTE my_workspace.ops.ingest_v2;
~~~

### Create Only If It Doesn't Already Exist
~~~sql
CREATE TRIGGER IF NOT EXISTS ingest_on_events
    ON my_workspace.raw.events
    EXECUTE my_workspace.ops.ingest_new;
~~~

## Notes

- Requires the `writer` role on the table for a commit trigger's `writer` role, or
  ownership of the task for a schedule or signal trigger — the same tier `CREATE TASK`'s
  `ON <table>` form applies, since either way the statement lands a trigger.
- **The trigger's runs execute as its owner, which is pinned to you.** The trigger is what
  makes a run unattended, so the trigger is what names whose authority the run carries.
  The task's statement is gated against that owner every time it fires — nothing is
  settled once at creation and left to go stale. Move the owner with
  [ALTER TRIGGER ... OWNER TO](alter-trigger).
- **Platform identities cannot own triggers.** They can read a great deal but have no
  billing account, so work pinned to one would run on a schedule forever and land on
  nobody's bill. Own a trigger as a user or a service account.
- A commit trigger's fired run is passed the committing snapshot and its parent, as
  `:current_version` and `:parent_version`. The window is fixed when the trigger fires, so
  a run means the same thing however long afterwards it is picked up.
- **One trigger per task.** A `CREATE TRIGGER` naming a task that already has a trigger,
  whatever its kind, is refused, and the message names the trigger that holds it. Drop
  that one first with [DROP TRIGGER](drop-trigger) to move the task, or define a second
  task.
- A schedule trigger's next-due instant is recomputed on every registration — including a
  `CREATE OR REPLACE TRIGGER` whose cron expression did not change — because the due
  instant is a function of the schedule and the current time. To redefine what a task
  runs without touching its trigger's schedule at all, use [ALTER TASK](alter-task).
- `OVER` and `AT TIME ZONE` are rejected on the commit form: a commit supplies its own
  window and happens in no time zone.
- To stop a trigger without losing it, use
  [ALTER TRIGGER ... SUSPEND](alter-trigger).
