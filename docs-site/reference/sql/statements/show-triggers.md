---
title: SHOW TRIGGERS FOR Statement — Opteryx Reference
description: SQL SHOW TRIGGERS FOR statement syntax and examples for listing the refresh triggers attached to a table in Opteryx
---

# SHOW TRIGGERS FOR

The `SHOW TRIGGERS FOR` statement lists the triggers attached to a table — the refresh
triggers created by [CREATE MATERIALIZED VIEW](create-materialized-view.md), showing
which materialized views a commit to this table will refresh, and how the most recent
firing went.

## Basic Syntax

~~~sql
SHOW TRIGGERS FOR [workspace].[collection].[table_name];
~~~

Bare `SHOW TRIGGERS` is **not supported** — name the table with the `FOR` form, or query
[information_schema.triggers](../advanced/adv-information-schema.md)
for a workspace-wide listing:

~~~sql
SELECT * FROM my_workspace.information_schema.triggers;
~~~

## Example

~~~sql
SHOW TRIGGERS FOR my_workspace.sales.orders;
~~~

## Notes

- Trigger names are auto-generated as `refresh__<collection>__<view_name>__<suffix>`.
- The columns returned are those of
  [information_schema.triggers](../advanced/adv-information-schema.md),
  including `target_view`, `last_fired_at`, and `last_fired_status` — the place to look
  when a materialized view seems stale.
- Remove a listed trigger with [DROP TRIGGER](drop-trigger.md).
