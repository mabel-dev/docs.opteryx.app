---
title: Time Travel Queries in Opteryx - Query Historical Data
description: Use Opteryx time travel to query data as it existed at a specific point in time using TIMESTAMP AS OF, or a specific snapshot using VERSION AS OF.
---

# Time Travel

Opteryx can query a catalog-backed table as it existed at a specific point in time. Each
commit to a table writes a **snapshot**; `TIMESTAMP AS OF` selects the most recent snapshot
committed at or before the timestamp you give, and reads the table as of that commit.
[`VERSION AS OF`](#version-as-of) selects a snapshot directly, by id or by its relation to
the current one, and is covered further down this page.

```sql
SELECT *
  FROM my_table
   TIMESTAMP AS OF <expression>;
```

The expression after `AS OF` is evaluated before the query runs and must resolve to a single
scalar temporal value — a literal, or an expression over constants and the current time. It
cannot reference a column.

**Notes:**

- Requires a store that keeps a commit log. A plain filesystem/Parquet connection has no snapshot history to travel through.
- If no `TIMESTAMP AS OF` clause is provided, the query reads the current snapshot.
- `FOR SYSTEM_TIME AS OF` is not accepted; the spelling is `TIMESTAMP AS OF`.

> Warning: **Older snapshots are reclaimed, and may be reclaimed at any point.** Time travel reaches back only as far as the snapshots that still exist, which is not something to plan against — see [Snapshot Reclamation](#snapshot-reclamation) below. A timestamp that resolved yesterday may not resolve today.

## Examples

**Query data as at a specific timestamp:**

```sql
SELECT *
  FROM my_table
   TIMESTAMP AS OF '2024-12-15 00:00:00'::TIMESTAMP;
```

**Query data from seven days ago:**

```sql
SELECT *
  FROM my_table
   TIMESTAMP AS OF CURRENT_DATE - INTERVAL '7' DAY;
```

**Query data from the start of the current month:**

```sql
SELECT *
  FROM my_table
   TIMESTAMP AS OF TRUNC(CURRENT_DATE, 'month');
```

**Query data from one day ago using an interval (interpreted as current time minus the interval):**

```sql
SELECT *
  FROM my_table
   TIMESTAMP AS OF INTERVAL '1' DAY;
```

## Finding a Point to Read At

`TIMESTAMP AS OF` picks a snapshot by timestamp, so the first question is usually *which
snapshots exist*. [`SHOW SNAPSHOTS FOR`](/docs/reference/sql/statements/show-snapshots)
answers it — one row per commit, newest first, with the commit time, who made it, what
operation it was, and what it added and removed:

```sql
SHOW SNAPSHOTS FOR my_workspace.sales.orders;
```

Read the `committed_at` of the commit you want, then travel to it:

```sql
SELECT *
  FROM my_workspace.sales.orders
   TIMESTAMP AS OF '2026-08-10 04:14:51'::TIMESTAMP;
```

`SHOW SNAPSHOTS FOR` answers from catalog metadata alone — no data files are read, so it is
free to run. It needs the same read access as a `SELECT` against the table, is not a subquery
source, and always returns the whole history.

**It lists only snapshots that still exist.** A reclaimed snapshot leaves this history, so
what you see is exactly the range time travel can still reach.

## VERSION AS OF

`VERSION AS OF` reads a snapshot directly, by `snapshot_id`, instead of by timestamp:

```sql
SELECT *
  FROM my_workspace.sales.orders
   VERSION AS OF 1755000000000;
```

The id is whatever [`SHOW SNAPSHOTS FOR`](/docs/reference/sql/statements/show-snapshots)
reports in its `snapshot_id` column for the commit you want.

For the common case of "the version before this one", `VERSION AS OF PREVIOUS` resolves it
without a `SHOW SNAPSHOTS FOR` lookup at all:

```sql
SELECT *
  FROM my_workspace.sales.orders
   VERSION AS OF PREVIOUS;
```

This walks the catalog's `parent_snapshot_id` chain — it reads the current snapshot and the
one immediately behind it, never the table's whole history, so it costs the same as an
ordinary read plus one extra snapshot lookup.

**Notes:**

- `0` is not a usable snapshot id — it is reserved so `PREVIOUS` has an unambiguous internal
  form, and `VERSION AS OF 0` is refused even if a real snapshot happened to have that id.
- `PREVIOUS` is exactly one snapshot back; there is no `PREVIOUS 2` or similar.
- `PREVIOUS` errors, rather than returning something unexpected, if the current snapshot has
  no parent (the table's first snapshot) or the parent has been reclaimed — see
  [Snapshot Reclamation](#snapshot-reclamation).
- Requires the same catalog-backed table with a commit log that `TIMESTAMP AS OF` requires.

See [VERSION AS OF](/docs/reference/sql/statements/version-as-of) for full syntax.

## Snapshot Reclamation

Snapshots do not accumulate forever. A background maintenance process reclaims older ones,
and a reclaimed snapshot is **immediately invisible to time travel** — it drops out of
`SHOW SNAPSHOTS FOR`, a `TIMESTAMP AS OF` that would have landed on it no longer resolves to
it, and a `VERSION AS OF` naming it directly (including `PREVIOUS`, if the reclaimed snapshot
was the parent) errors instead. Its data files are then released, passing through a
quarantine period before deletion.

Reclamation is not configurable per table, and there is no way to pin a snapshot or query how
long one will survive. Treat reachable history as **best-effort and unbounded in neither
direction**: it exists until maintenance runs.

The practical consequences:

- **A snapshot can disappear between two runs of the same query.** A dashboard or scheduled job pinned to a fixed old timestamp will start returning nothing for it. Pin to a recent relative offset instead.
- **Time travel is not a backup or an undo.** It is a read of history that still happens to be there. Recovery after reclamation is an operational restore, not something a query can reach.
- **`SHOW SNAPSHOTS FOR` is the only honest answer** to how far back a given table reaches, and it is only true at the moment you run it.

If you need a point in time to survive, copy it out —
`CREATE TABLE ... AS SELECT ... TIMESTAMP AS OF ...` — rather than relying on the snapshot
still being there later.

## Temporal Self-Joins

Two `TIMESTAMP AS OF` clauses on the same table let you compare snapshots. To find rows
present today that were not present a week ago:

```sql
SELECT current.id
  FROM orders TIMESTAMP AS OF CURRENT_DATE AS current
  LEFT ANTI JOIN orders TIMESTAMP AS OF CURRENT_DATE - INTERVAL '7' DAY AS previous
    ON previous.id = current.id;
```

Both sides are subject to reclamation: if the older timestamp reaches past the oldest
surviving snapshot, the join silently compares against that snapshot rather than failing.

## Limitations

- Requires a catalog-backed table with a commit log; there is no time travel over a plain object-store path.
- Snapshots are reclaimed, so reachable history may shrink at any point.
- Timestamps are evaluated in UTC.
- Backfilled data is visible: reading at a past timestamp returns the snapshot as it was committed, including any corrections that commit carried.
- The `TIMESTAMP AS OF` expression must be resolvable before the query runs — it cannot reference a column.
- `VERSION AS OF` takes a bare snapshot id (or `PREVIOUS`) — no expressions, and no *n*-back offset beyond one.
