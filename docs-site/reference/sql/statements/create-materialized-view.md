---
title: CREATE MATERIALIZED VIEW Statement — Opteryx Reference
description: SQL CREATE MATERIALIZED VIEW statement syntax and examples for creating self-refreshing materialized views in Opteryx
---

# CREATE MATERIALIZED VIEW

The `CREATE MATERIALIZED VIEW` statement runs a query, stores its result as a physical
table, and keeps that result up to date automatically: whenever data is committed to a
table the query reads, the platform re-runs the query and replaces the stored result.

A materialized view is queried exactly like a table — there is no query rewriting and no
per-query overhead. What you read is the stored result of the most recent refresh.

## Basic Syntax

~~~sql
CREATE [OR REPLACE] MATERIALIZED VIEW [workspace].[collection].[view_name] AS
SELECT ...;
~~~

- `OR REPLACE` replaces an existing materialized view's definition and stored result, and
  rebuilds its refresh triggers to match the new query's sources.
- `IF NOT EXISTS` is **not supported** for materialized views.
- An explicit column list is **not supported** — the columns are always derived from the
  query, as with [CREATE TABLE ... AS SELECT](create-table.md).

## Examples

### Create a Materialized View
~~~sql
CREATE MATERIALIZED VIEW my_workspace.analytics.daily_totals AS
SELECT order_date, SUM(amount) AS total
  FROM my_workspace.sales.orders
 GROUP BY order_date;
~~~

### Replace an Existing Materialized View
~~~sql
CREATE OR REPLACE MATERIALIZED VIEW my_workspace.analytics.daily_totals AS
SELECT order_date, region, SUM(amount) AS total
  FROM my_workspace.sales.orders
 GROUP BY order_date, region;
~~~

### Query a Materialized View
~~~sql
SELECT * FROM my_workspace.analytics.daily_totals;
~~~

## How Refresh Works

Refresh is automatic and event-driven, not scheduled:

- When the materialized view is created, a refresh trigger is created on **every** catalog
  table the query reads. Use [SHOW TRIGGERS FOR](show-triggers.md) to see them; trigger
  names are generated as `refresh__<collection>__<view_name>`.
- Any user data commit to a source table fires the trigger, and the platform's worker
  re-runs the defining query as a `CREATE OR REPLACE TABLE ... AS ...`, atomically
  replacing the stored result.
- Rapid successive commits within roughly 60 seconds coalesce into a single refresh
  rather than one refresh per commit.
- The refresh runs with the permissions of the user whose commit triggered it (invoker
  semantics). If that user cannot read every source or write the materialized view, the
  refresh is denied and the view goes stale — visibly so: check `last_fired_status` in
  [information_schema.triggers](../advanced/adv-information-schema.md)
  and the view's refresh metadata.

## Permissions

- Creating or replacing a materialized view requires the `owner` role on the materialized
  view's own name.
- It also requires the `writer` role on **every** source table the query reads — creating
  a refresh trigger is an update to that table.

## Notes

- Use fully qualified names: `[workspace].[collection].[view_name]`.
- Every source the query reads must be a catalog-resident table. Virtual datasets such as
  `$planets`, `information_schema` views, and function sources like `read_parquet(...)`
  never commit data, so they cannot fire a refresh — the query must read at least one
  catalog table.
- A materialized view may read other materialized views, forming a refresh chain. Cycles
  are rejected when the view is created.
- [DROP TABLE](drop-table.md) against a materialized view is rejected and points you to
  [DROP MATERIALIZED VIEW](drop-materialized-view.md) — and vice versa.
- Contrast with [CREATE VIEW](create-view.md): an ordinary view stores only the query
  text and plans it afresh on every reference; a materialized view stores the query's
  result as a physical table and refreshes it automatically.
