---
title: REFRESH MATERIALIZED VIEW Statement — Opteryx Reference
description: SQL REFRESH MATERIALIZED VIEW statement syntax and examples for rebuilding a materialized view from its defining SELECT in Opteryx
---

# REFRESH MATERIALIZED VIEW

Rebuilds a materialized view by re-running the `SELECT` it is defined by, replacing its
contents with the result.

## Syntax

~~~sql
REFRESH MATERIALIZED VIEW <view>;
~~~

`<view>` is fully qualified as `<workspace>.<collection>.<view_name>`. It takes no options.
There is nothing to specify: what a refresh does is entirely determined by the view's own
definition.

## Examples

~~~sql
REFRESH MATERIALIZED VIEW analytics.daily_orders;
~~~

## What It Does

The view's **current** definition is read and re-executed, and the result replaces the
view's contents. Two consequences worth knowing:

- If the view was redefined with `CREATE OR REPLACE MATERIALIZED VIEW` since it was last
  refreshed, the refresh runs the new definition. A redefinition takes effect on the next
  refresh, not at some later moment nobody can point to.
- The replacement is atomic. The new contents are written durably first and swapped in with
  a single commit, so readers see either the old contents or the new ones, never a partial
  rebuild. A refresh that fails leaves the previous contents in place.
- A successful refresh records that it ran, updating the view's `last-refreshed-at-ms` and
  `last-refresh-status`. That holds for a manual `REFRESH MATERIALIZED VIEW` as well as an
  automatic one, so running this statement to recover from a failed refresh also clears the
  stale timestamp it left behind.

## You Rarely Need To Run It

Materialized views refresh **automatically**. A view carries a trigger on each table it
reads, and a user-created write to any of them queues a refresh — that is the normal way a
view stays current, and it needs no statement from you.

`REFRESH MATERIALIZED VIEW` is for the cases automatic refresh does not cover:

- rebuilding after a refresh failed (a permissions problem, an
  [egress protection](alter-workspace.md#egress-protection) refusal) once the cause is fixed
- forcing a rebuild after a redefinition, rather than waiting for the next source write
- refreshing a view whose sources are updated by something outside Opteryx

## A Materialized View Is Not A Table

A view's contents come from its defining `SELECT`. Nothing writes to one directly, so every
table modifier is **refused** when its target is a materialized view:

| Statement | Result on a materialized view |
|-----------|-------------------------------|
| `CREATE TABLE ... AS SELECT` / `CREATE OR REPLACE TABLE` | Refused |
| [INSERT](insert.md) | Refused |
| [TRUNCATE TABLE](truncate-table.md) | Refused |
| [ALTER TABLE ... RENAME TO](alter-table.md#rename-to) | Refused |
| `ALTER TABLE ... CLUSTER BY` | Refused |
| [DROP TABLE](drop-table.md) | Refused — use `DROP MATERIALIZED VIEW` |

This is not a permissions rule and cannot be granted around. A write that landed on a view
would either be erased by the next refresh or, worse, survive and leave the view disagreeing
with its own definition — which is the one thing a materialized view is supposed to
guarantee against.

The three statements that *do* change a materialized view:

- `CREATE OR REPLACE MATERIALIZED VIEW` — change what it is defined as
- `REFRESH MATERIALIZED VIEW` — rebuild it from that definition
- `DROP MATERIALIZED VIEW` — remove it

Reading a materialized view is unrestricted: it is queried exactly like a table.

## Notes

- Requires the `writer` role on the view, **not** `owner` — a refresh is its own permission
  tier. Mechanically it is a `CREATE OR REPLACE`, which is owner-tier for a hand-written
  table, but the decision to have this relation at all was authorized when the view was
  created, and its contents are derived rather than authored. Charging the owner tier here
  would let a `writer` create a materialized view that only an `owner` could ever keep
  fresh — exactly the trap this statement exists to avoid.
- Refused if the named relation is not a materialized view. A table's contents are changed
  with `INSERT` or `CREATE OR REPLACE TABLE`.
- Refused if the view has no recorded defining `SELECT`; recreate it with
  `CREATE OR REPLACE MATERIALIZED VIEW`.
- Subject to [egress protection](alter-workspace.md#egress-protection) like any other write:
  if the view reads from a workspace that restricts egress, the refresh is refused.
- Requires a connector with a catalog. Not every backend supports materialized views.

## See Also

- [CREATE MATERIALIZED VIEW](create-materialized-view.md)
- [ALTER MATERIALIZED VIEW](alter-materialized-view.md)
- [DROP MATERIALIZED VIEW](drop-materialized-view.md)
