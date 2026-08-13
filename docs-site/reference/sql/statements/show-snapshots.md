---
title: SHOW SNAPSHOTS FOR Statement — Opteryx Reference
description: SQL SHOW SNAPSHOTS FOR statement syntax and examples for listing a table's commit history in Opteryx
---

# SHOW SNAPSHOTS FOR

The `SHOW SNAPSHOTS FOR` statement lists a table's commit history — one row per snapshot, newest first, showing when each commit landed, who made it, what kind of operation it was, and how many records, files and bytes it added, deleted and left behind.

Each snapshot is a point the table can be read at with [TIMESTAMP AS OF](timestamp-as-of.md), so this is the statement that tells you which points those are, and what each one changed. Time travel selects a snapshot by its `committed_at` — it reads the table as of the most recent commit at or before the timestamp you give. It answers from catalog metadata; no data files are read.

## Syntax

~~~sql
SHOW SNAPSHOTS FOR <table_name>;
~~~

Bare `SHOW SNAPSHOTS` is **not supported** — a commit history belongs to one table, and there is no session default workspace to list histories across. Name the table with the `FOR` form.

## Parameters

- **`<table_name>`** — fully qualified as `<workspace>.<collection>.<table_name>`.

## Result Columns

| Column | Description |
|--------|-------------|
| `snapshot_id` | The snapshot's identifier |
| `committed_at` | When the commit landed, UTC |
| `is_current` | `true` for the snapshot a plain `SELECT` reads today; `false` for the rest |
| `operation_type` | What the commit did, e.g. `append`, `overwrite`, `compact` |
| `author` | The identity that made the commit |
| `user_created` | `true` for a commit made by a user statement, `false` for one the engine made itself (a refresh, a compaction) |
| `sequence_number` | Monotonic write sequence number |
| `parent_snapshot_id` | The snapshot this one was committed on top of; `null` for the first |
| `schema_id` | The schema this snapshot was written against |
| `commit_message` | The commit's message, when one was recorded |
| `added_records` / `added_data_files` / `added_files_size_in_bytes` | What the commit added |
| `deleted_records` / `deleted_data_files` / `deleted_files_size_in_bytes` | What the commit removed |
| `total_records` / `total_data_files` / `total_files_size_in_bytes` | What the table held after the commit |

A counter the catalog never recorded is `null`, not `0`. Zero would claim the commit added or deleted nothing; `null` says it was not written down. Older snapshots are the usual case.

## Examples

### List a Table's History
~~~sql
SHOW SNAPSHOTS FOR my_workspace.sales.orders;
~~~

### Find a Point to Read At
Look up the commit you want, then read the table as it was then:

~~~sql
SHOW SNAPSHOTS FOR my_workspace.sales.orders;

SELECT * FROM my_workspace.sales.orders
TIMESTAMP AS OF '2026-08-10 04:14:51';
~~~

`SHOW SNAPSHOTS FOR` is not a subquery source — it cannot be wrapped in
`FROM (...)`, filtered, or joined. Filter the returned rows client-side if you
only want part of the history.

## Notes

- **Requires read access.** A snapshot row is commit metadata about a table you can already read — it exposes no file paths and no storage layout — so `SHOW SNAPSHOTS FOR` needs the same access as a `SELECT` against the table. This is deliberately weaker than [SHOW MANIFEST FOR](show-manifest.md), which does expose storage layout and requires the `owner` role.
- **Catalog-backed tables only.** The history is the catalog's commit log. A table on a store that keeps no commit log reports that it has no snapshot history, rather than reporting an empty one — the two are different answers.
- **A table with nothing committed returns no rows.** That is an empty history, not an error.
- **Expired snapshots are not listed.** A snapshot retired by the retention policy leaves the history this statement returns, even during the window in which it may still be recoverable. What you see here is the history you can read, not every commit ever made.
- **Always returns the whole history.** `SHOW` statements have no `WHERE` clause or column list, and the result is not a subquery source, so there is nothing to filter or project with at the source.
- **Free to run.** No data files are read.

## See Also

- [TIMESTAMP AS OF](timestamp-as-of.md)
- [SHOW MANIFEST FOR](show-manifest.md)
- [SHOW COLUMNS](show-columns.md)
