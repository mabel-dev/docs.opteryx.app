---
title: ALTER TASK Statement — Opteryx Reference
description: SQL ALTER TASK statement syntax and examples for redefining what a task runs in Opteryx
---

# ALTER TASK

The `ALTER TASK` statement redefines what a task runs, and nothing else.

It is narrower than [CREATE OR REPLACE TASK](create-task) on purpose: it takes no
`ON <table_name>` clause, so it cannot repoint or create the trigger that fires the task.
A schedule trigger's next-due instant is recomputed on every `CREATE OR REPLACE TASK`,
even one that only changes the SQL body — see
[CREATE TRIGGER ... ON SCHEDULE](create-trigger). A statement that cannot see the trigger
at all cannot reset a clock it never touches, which is why this form exists rather than
sending every SQL-only edit through `CREATE OR REPLACE TASK`.

## Syntax

~~~sql
ALTER TASK <task_name>
    AS <statement>;
~~~

## Parameters

- **`<task_name>`** — the task to redefine, fully qualified as
  `<workspace>.<collection>.<task_name>`. Unlike `CREATE OR REPLACE TASK`, this does not
  create: a name that is not already a task is refused rather than silently registered.
- **`<statement>`** — the SQL the task runs from now on. May contain `:name`
  placeholders, supplied when the task is executed.

## Examples

### Redefine a Task's Statement
~~~sql
ALTER TASK my_workspace.ops.ingest_events
    AS INSERT INTO my_workspace.ops.event_log
       SELECT * FROM my_workspace.raw.events VERSION AS OF :current_version;
~~~

## Notes

- **Who a task runs as, and whether it runs, still belong to the trigger.** Move the
  owner with [ALTER TRIGGER ... OWNER TO](alter-trigger), pause it with
  [ALTER TRIGGER ... SUSPEND](alter-trigger), or set its firing floor with
  [ALTER TRIGGER ... SET MINIMUM INTERVAL TO](alter-trigger). None of those are reachable
  through `ALTER TASK`.
- **Does not reset a schedule trigger's due instant.** This is the whole reason the
  statement exists: redefining a task's SQL body with `ALTER TASK` leaves any trigger
  firing it — including its `next-due` clock — exactly as it was.
- The statement is parsed when it is applied, the same as at `CREATE TASK`, so SQL that
  could never run is refused now rather than discovered when it fires. What it reads and
  writes is checked against the author's own grants on every redefinition, the same
  authoring bound `CREATE OR REPLACE TASK` applies.
- A task cannot create, drop, or run another task.
- Relations inside the statement must be **fully qualified**, the same as at
  `CREATE TASK`.

## See Also

- [CREATE TASK](create-task)
- [DROP TASK](drop-task)
- [CREATE TRIGGER](create-trigger)
- [ALTER TRIGGER](alter-trigger)
