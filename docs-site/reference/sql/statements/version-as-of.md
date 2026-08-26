---
title: VERSION AS OF (Time Travel) — Opteryx Reference
description: SQL VERSION AS OF syntax and examples for reading a specific snapshot by id, by tag name, or the one before the current, in Opteryx
---

# VERSION AS OF (Time Travel)

The `VERSION AS OF` clause reads a catalog-backed table as of a specific **snapshot**, rather
than a timestamp. Name the snapshot three ways: by its id, by a **tag** bound to it, or as
`PREVIOUS` — the snapshot immediately before the current one, without you having to look up
its id or commit time first.

## Syntax

~~~sql
SELECT ...
  FROM <table_name> VERSION AS OF <snapshot_id>
 WHERE ...;

SELECT ...
  FROM <table_name> VERSION AS OF '<tag_name>'
 WHERE ...;

SELECT ...
  FROM <table_name> VERSION AS OF PREVIOUS
 WHERE ...;
~~~

## Parameters

- **`<table_name>`** — the catalog-backed table to query as of the given snapshot.
- **`<snapshot_id>`** — a non-negative whole number identifying a snapshot, as reported by
  [`SHOW SNAPSHOTS FOR`](show-snapshots). `0` is reserved and is refused if you type it
  literally — use `PREVIOUS` instead.
- **`'<tag_name>'`** — the name of a tag on this table, created with
  [`ALTER TABLE ... CREATE TAG`](alter-table#create-tag) and listed in the `tags` column of
  [`SHOW SNAPSHOTS FOR`](show-snapshots). Tag names fold to lowercase, so the casing you
  type does not matter.
- **`PREVIOUS`** — the snapshot that is the parent of the current one. Resolved from the
  catalog at query time; you never need to know its id or timestamp.

## Examples

### Query a Specific Snapshot
~~~sql
SELECT * FROM my_workspace.sales.orders VERSION AS OF 1755000000000;
~~~

### Query a Tagged Snapshot
~~~sql
SELECT * FROM my_workspace.sales.orders VERSION AS OF 'report_202602';
~~~

Unlike an id, a tag is guaranteed to still be there: a tag holds its snapshot from
reclamation for as long as the tag exists. This is the only form of time travel that is safe
to hard-code in a scheduled job or a dashboard.

### Query the Version Before the Current One
~~~sql
SELECT * FROM my_workspace.sales.orders VERSION AS OF PREVIOUS;
~~~

### Find a Snapshot Id, Then Read It
~~~sql
SHOW SNAPSHOTS FOR my_workspace.sales.orders;

SELECT * FROM my_workspace.sales.orders VERSION AS OF 1755000000000;
~~~

## Notes

- Requires a catalog-backed table with a commit log — the same requirement as
  [`TIMESTAMP AS OF`](timestamp-as-of); a plain filesystem/Parquet connection has no
  snapshots to travel through.
- `VERSION AS OF 0` is always refused, whether or not `0` happens to be a real snapshot id —
  it is reserved so `PREVIOUS` has an unambiguous internal form to resolve.
- `PREVIOUS` has no *n*-back form (there is no `PREVIOUS 2`); it always means exactly one
  snapshot back from current.
- `PREVIOUS` fails if the current snapshot has no parent (the table's first snapshot) or if
  the parent has since been reclaimed — see [Snapshot Reclamation](../advanced/adv-time-travel#snapshot-reclamation).
  Both are query errors, not empty results.
- Resolving `PREVIOUS` only ever touches the current snapshot and the one before it — it does
  not read the table's full commit history, unlike `SHOW SNAPSHOTS FOR`.
- **A tag is resolved by name, in one catalog lookup**, and costs the same as naming the id
  directly. It does not read the table's commit history.
- **An unknown tag is an error**, not an empty result and never a silent fall back to current
  data — which would answer a question about February with March's numbers. The message names
  the table and the tag, and deliberately does not list the tags that do exist: someone who
  cannot see a table's tags should not learn them from a failed guess.
- A tag name may be written bare (`VERSION AS OF report_202602`) as well as quoted, and both
  mean the same thing. `VERSION AS OF CURRENT` is **not** accepted — reading the current
  snapshot is just a read with no clause at all; `CURRENT` is only meaningful when *creating*
  a tag.
- A tag can never name a reclaimed snapshot, because holding it from reclamation is what a
  tag does. If one somehow fails to resolve, that is reported as the broken guarantee it is,
  not degraded into a read of something else.

## See Also

- [SELECT](select)
- [TIMESTAMP AS OF](timestamp-as-of) — the timestamp-based form of time travel.
- [SHOW SNAPSHOTS FOR](show-snapshots) — lists the snapshot ids a table has, and their tags.
- [ALTER TABLE ... CREATE TAG](alter-table#create-tag) — bind a name to a snapshot and hold
  it from reclamation.
- [Time Travel Queries](../advanced/adv-time-travel) — advanced topic covering
  reclamation, temporal self-joins, and partitioning requirements.
