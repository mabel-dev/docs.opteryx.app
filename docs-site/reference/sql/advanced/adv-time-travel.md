---
title: Time Travel Queries in Opteryx - Query Historical Data
description: Use Opteryx time travel to query data as it existed at a specific point in time using TIMESTAMP AS OF.
---

# Time Travel

Opteryx can query a catalog-backed table as it existed at a specific point in time. Each
commit to a table writes a **snapshot**; `TIMESTAMP AS OF` selects the most recent snapshot
committed at or before the timestamp you give, and reads the table as of that commit.

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

> Warning: **Snapshots are garbage collected and may be reclaimed at any time.** Time travel reaches back only as far as the retention policy has kept, which is not a guarantee you can plan against — see [Snapshot Retention](#snapshot-retention) below. A timestamp that resolved yesterday may not resolve today.

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

**It lists only snapshots that still exist.** A snapshot retired by the retention policy
leaves this history, so what you see is exactly the range time travel can still reach.

## Snapshot Retention

Snapshots do not accumulate forever. A maintenance process expires them on a retention
policy, and an expired snapshot is **immediately invisible to time travel** — it drops out of
`SHOW SNAPSHOTS FOR` and a `TIMESTAMP AS OF` landing on it no longer resolves to it. Its data
files are then released for reclamation, passing through an orphan quarantine before deletion.

The practical consequences:

- **Reachable history is bounded, and the bound is a maintenance setting, not a contract.** How far back you can travel depends on the table's configured retention; a table with none keeps only its current snapshot.
- **A snapshot can disappear between two runs of the same query.** A dashboard or scheduled job pinned to a fixed old timestamp will start failing to find it. Pin to a recent relative offset, or materialize the result you need.
- **Expiry is not undo.** Recovery after expiry is an operational restore, not something a query can reach.

If you need a point in time to survive indefinitely, copy it out —
`CREATE TABLE ... AS SELECT ... TIMESTAMP AS OF ...` — rather than relying on the snapshot
still being there.

## Temporal Self-Joins

Two `TIMESTAMP AS OF` clauses on the same table let you compare snapshots. To find rows
present today that were not present a week ago:

```sql
SELECT current.id
  FROM orders TIMESTAMP AS OF CURRENT_DATE AS current
  LEFT ANTI JOIN orders TIMESTAMP AS OF CURRENT_DATE - INTERVAL '7' DAY AS previous
    ON previous.id = current.id;
```

Both sides are subject to retention: if the older timestamp falls outside the retained
window, the join silently compares against whatever the oldest surviving snapshot holds
rather than failing.

## Limitations

- Requires a catalog-backed table with a commit log; there is no time travel over a plain object-store path.
- Snapshots are garbage collected, so reachable history is bounded and may shrink at any time.
- Timestamps are evaluated in UTC.
- Backfilled data is visible: reading at a past timestamp returns the snapshot as it was committed, including any corrections that commit carried.
- The `AS OF` expression must be resolvable before the query runs — it cannot reference a column.
