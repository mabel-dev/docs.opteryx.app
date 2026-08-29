---
title: DROP TASK Statement — Opteryx Reference
description: SQL DROP TASK statement syntax and examples for removing a task in Opteryx
---

# DROP TASK

The `DROP TASK` statement removes a task. A task owns no storage, so nothing is reclaimed
and the drop is fully reversible by re-creating it.

## Syntax

~~~sql
DROP TASK [ IF EXISTS ] <task_name>;
~~~

## Parameters

- **`<task_name>`** — the task to remove, fully qualified as
  `<workspace>.<collection>.<task_name>`.
- `IF EXISTS` — skip the operation without error if the task does not exist, instead of
  refusing the statement.

## Examples

### Drop a Task
~~~sql
DROP TASK my_workspace.ops.ingest_events;
~~~

### Drop Only If It Exists
~~~sql
DROP TASK IF EXISTS my_workspace.ops.ingest_events;
~~~

## Notes

- Requires the `writer` role on the task.
- **Triggers that fire the task are not removed.** A trigger lives on the table that fires
  it, and deleting other tables' records from this statement is how a partial failure
  leaves a trigger nobody can see. Remove them with [DROP TRIGGER](drop-trigger).
- `DROP TASK` takes no other options — with no storage behind it, there is nothing for
  `CASCADE` or `RESTRICT` to decide.
