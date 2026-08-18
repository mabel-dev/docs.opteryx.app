---
title: SHOW TRIGGERS FOR Statement — Opteryx Reference
description: SQL SHOW TRIGGERS FOR statement syntax and examples for listing the refresh triggers attached to a table in Opteryx
---

# SHOW TRIGGERS FOR

The `SHOW TRIGGERS FOR` statement lists the triggers attached to a table — the refresh
triggers created by [CREATE MATERIALIZED VIEW](create-materialized-view), showing
which materialized views a commit to this table will refresh, and how the most recent
firing went.

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
[information_schema.triggers](../advanced/adv-information-schema),
including `target_view`, `last_fired_at`, and `last_fired_status` — the place to look
when a materialized view seems stale.

## Examples

### List Triggers on a Table
~~~sql
SHOW TRIGGERS FOR my_workspace.sales.orders;
~~~

## Notes

- Trigger names are auto-generated as `refresh__<collection>__<view_name>__<suffix>`.
- Remove a listed trigger with [DROP TRIGGER](drop-trigger).

## See Also

- [DROP TRIGGER](drop-trigger)
- [CREATE MATERIALIZED VIEW](create-materialized-view)
