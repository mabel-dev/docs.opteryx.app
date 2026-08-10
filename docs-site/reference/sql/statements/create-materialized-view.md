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
- Any user data commit to a source table fires the trigger, and the platform's worker runs
  [REFRESH MATERIALIZED VIEW](refresh-materialized-view.md), which re-runs the defining
  query and atomically replaces the stored result. You can run that statement yourself to
  rebuild a view on demand.
- Rapid successive commits within roughly 60 seconds coalesce into a single refresh
  rather than one refresh per commit.
- The refresh runs with the permissions of the user whose commit triggered it (invoker
  semantics). If that user cannot read every source or write the materialized view, the
  refresh is denied and the view goes stale — visibly so: check `last_fired_status` in
  [information_schema.triggers](../advanced/adv-information-schema.md)
  and the view's refresh metadata.

## Permissions

- Creating or replacing a materialized view requires the `writer` role on the materialized
  view's own name. Note this makes `CREATE OR REPLACE MATERIALIZED VIEW` writer-tier where
  `CREATE OR REPLACE TABLE` stays owner-tier: a view's contents are rebuildable from its
  definition, so the blast radius genuinely is lower.
- It also requires the `writer` role on **every** source table the query reads — creating
  a refresh trigger is an update to that table.
- Refreshing is writer-tier too — see
  [REFRESH MATERIALIZED VIEW](refresh-materialized-view.md).

## Notes

- Use fully qualified names: `[workspace].[collection].[view_name]`.
- Every source the query reads must be a catalog-resident table. Virtual datasets such as
  `$planets`, `information_schema` views, and function sources like `read_parquet(...)`
  never commit data, so they cannot fire a refresh — the query must read at least one
  catalog table.
- **Materialized views do not stack.** Every source must be a plain table: registration is
  rejected if a source is itself a materialized view, and equally if the relation being
  registered is one that some other view already reads. Stacking would leave the outer view
  permanently a refresh behind the inner one, and a failed inner refresh would silently pin
  everything above it. Cycles are rejected at creation too, as the backstop behind that rule.
- **A materialized view is not a table.** Every table modifier — `CREATE TABLE ... AS
  SELECT`, [INSERT](insert.md), [TRUNCATE TABLE](truncate-table.md),
  [ALTER TABLE](alter-table.md), [DROP TABLE](drop-table.md) — is rejected against one, and
  the error names the statement that does apply. See
  [REFRESH MATERIALIZED VIEW](refresh-materialized-view.md#a-materialized-view-is-not-a-table)
  for the full list.
- Contrast with [CREATE VIEW](create-view.md): an ordinary view stores only the query
  text and plans it afresh on every reference; a materialized view stores the query's
  result as a physical table and refreshes it automatically.
