---
title: EXECUTE Statement — Opteryx Reference
description: SQL EXECUTE statement syntax and examples for running a task in Opteryx
---

# EXECUTE

The `EXECUTE` statement runs a task recorded by [CREATE TASK](create-task), supplying
values for any placeholders in its statement.

The task's statement is read when `EXECUTE` runs, so a task always runs its **current**
definition — redefining one takes effect on its next execution rather than at some later
moment nobody can point to.

## Syntax

~~~sql
EXECUTE <task_name>
    [ USING <value> AS <parameter_name> [, ...] ];
~~~

## Parameters

- **`<task_name>`** — the task to run, fully qualified as
  `<workspace>.<collection>.<task_name>`. There is no `TASK` keyword after `EXECUTE`; a
  word placed there would be read as the task's own name.
- **`<value> AS <parameter_name>`** — a constant bound to the `:parameter_name` placeholder
  in the task's statement. Arguments are matched by **name**, so their order carries no
  meaning, and every placeholder the statement uses must be supplied.

## Examples

### Run a Task With No Parameters
~~~sql
EXECUTE my_workspace.ops.rebuild_summary;
~~~

### Supply Named Arguments
~~~sql
EXECUTE my_workspace.ops.ingest_new
    USING 1785166801372 AS parent_version,
          1785166802104 AS current_version;
~~~

### Replay a Window
Because both boundaries are named rather than relative, any window can be re-run exactly:

~~~sql
EXECUTE my_workspace.ops.ingest_new
    USING 1785100000000 AS parent_version,
          1785166801372 AS current_version;
~~~

## Notes

- **The task runs as you.** `EXECUTE` is an attended run: the statement is gated against
  your own permissions, exactly as if you had typed it. Only an unattended run — a
  [trigger](create-trigger) firing — carries a pinned identity, the trigger's owner.
- Arguments must be **constants**. A column reference is refused: a task's arguments are
  bound when it runs, not evaluated against a relation.
- Values are substituted into the task's statement only after that statement has been
  parsed, so an argument can never change how the SQL parses.
- Positional arguments — `EXECUTE <task>(1, 2)` — are not accepted. Two snapshot ids of
  identical appearance are the shape most likely to be transposed silently, so parameters
  are named.
- A missing argument names the parameter it could not fill.
