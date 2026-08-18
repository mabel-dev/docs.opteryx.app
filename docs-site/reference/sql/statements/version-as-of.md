---
title: VERSION AS OF (Time Travel) — Opteryx Reference
description: SQL VERSION AS OF syntax and examples for reading a specific snapshot, or the one before the current, in Opteryx
---

# VERSION AS OF (Time Travel)

The `VERSION AS OF` clause reads a catalog-backed table as of a specific **snapshot id**,
rather than a timestamp. `VERSION AS OF PREVIOUS` reads the snapshot immediately before the
current one, without you having to look up its id or commit time first.

## Syntax

~~~sql
SELECT ...
  FROM <table_name> VERSION AS OF <snapshot_id>
 WHERE ...;

SELECT ...
  FROM <table_name> VERSION AS OF PREVIOUS
 WHERE ...;
~~~

## Parameters

- **`<table_name>`** — the catalog-backed table to query as of the given snapshot.
- **`<snapshot_id>`** — a non-negative whole number identifying a snapshot, as reported by
  [`SHOW SNAPSHOTS FOR`](show-snapshots.md). `0` is reserved and is refused if you type it
  literally — use `PREVIOUS` instead.
- **`PREVIOUS`** — the snapshot that is the parent of the current one. Resolved from the
  catalog at query time; you never need to know its id or timestamp.

## Examples

### Query a Specific Snapshot
~~~sql
SELECT * FROM my_workspace.sales.orders VERSION AS OF 1755000000000;
~~~

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
  [`TIMESTAMP AS OF`](timestamp-as-of.md); a plain filesystem/Parquet connection has no
  snapshots to travel through.
- `VERSION AS OF 0` is always refused, whether or not `0` happens to be a real snapshot id —
  it is reserved so `PREVIOUS` has an unambiguous internal form to resolve.
- `PREVIOUS` has no *n*-back form (there is no `PREVIOUS 2`); it always means exactly one
  snapshot back from current.
- `PREVIOUS` fails if the current snapshot has no parent (the table's first snapshot) or if
  the parent has since been reclaimed — see [Snapshot Reclamation](../advanced/adv-time-travel.md#snapshot-reclamation).
  Both are query errors, not empty results.
- Resolving `PREVIOUS` only ever touches the current snapshot and the one before it — it does
  not read the table's full commit history, unlike `SHOW SNAPSHOTS FOR`.

## See Also

- [SELECT](select.md)
- [TIMESTAMP AS OF](timestamp-as-of.md) — the timestamp-based form of time travel.
- [SHOW SNAPSHOTS FOR](show-snapshots.md) — lists the snapshot ids a table has.
- [Time Travel Queries](../advanced/adv-time-travel.md) — advanced topic covering
  reclamation, temporal self-joins, and partitioning requirements.
