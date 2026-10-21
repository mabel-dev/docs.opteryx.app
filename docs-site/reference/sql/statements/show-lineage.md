---
title: SHOW LINEAGE FOR Statement — Opteryx Reference
description: SQL SHOW LINEAGE FOR statement syntax and examples for listing which tables, at which snapshots, each commit to an Opteryx table was built from
---

# SHOW LINEAGE FOR

The `SHOW LINEAGE FOR` statement lists what each commit to a table was built from — one row per source the commit read, newest commit first. For every source it gives the table's name, the exact snapshot that was read, and how that snapshot was chosen.

Every commit records a **receipt**: the catalog tables the statement that produced it read, and the snapshot of each. It is written once, with the commit, and never edited. This statement is how you read those receipts back. It answers "what was this table built from?", and, because each source is named by snapshot id, "what did it know when it was built?": the id can be read with [VERSION AS OF](version-as-of) for as long as that snapshot survives.

It answers from catalog metadata; no data files are read.

## Syntax

~~~sql
SHOW LINEAGE FOR <table_name>;
~~~

Bare `SHOW LINEAGE` is **not supported**, and neither is `SHOW LINEAGE FROM`. A receipt belongs to one table's commit history, so name the table with the `FOR` form.

## Parameters

- **`<table_name>`** — fully qualified as `<workspace>.<collection>.<table_name>`.

## Result Columns

| Column | Description |
|--------|-------------|
| `snapshot_id` | The commit the row belongs to |
| `committed_at` | When the commit landed, UTC |
| `is_current` | `true` for the snapshot a plain `SELECT` reads today. After a [rollback](alter-table#rollback-to-version) this is **not** the newest commit |
| `produced_by` | What made the commit: `task:<name>`, `view:<name>`, or `upload:<channel>`. `null` for a statement someone ran by hand |
| `how` | One phrase combining what happened to the data with what made it happen, e.g. `appended, by task cat.coll1.ingest` or `appended, by hand`. See [The `how` Column](#the-how-column) |
| `source_dataset` | The fully qualified name of a table the commit read |
| `source_snapshot_id` | The snapshot of that table the commit read |
| `resolved_by` | How that snapshot was chosen: `current`, `version`, `previous`, `tag` or `date` |
| `source_exists` | Whether that snapshot can still be read. See [Whether a Source Still Exists](#whether-a-source-still-exists) |
| `recorded` | `false` only on the single row of a commit that has no receipt. See [Three States of a Receipt](#three-states-of-a-receipt) |

A commit that read several tables has one row per table, ordered by `source_dataset`. The commit-level columns (`snapshot_id`, `committed_at`, `is_current`, `produced_by`, `how`) repeat on each of its rows.

`resolved_by` records how the read was phrased, and `source_snapshot_id` is always the concrete snapshot it landed on. A source read with no time-travel clause has `resolved_by = current` and the id of whatever snapshot was current at that moment; reading it again today would find a different one, so use `source_snapshot_id` rather than the word.

| `resolved_by` | The statement read the source… |
|---------------|--------------------------------|
| `current` | with no time-travel clause |
| `version` | with `VERSION AS OF <snapshot_id>` |
| `previous` | with `VERSION AS OF PREVIOUS` |
| `tag` | with `VERSION AS OF '<tag>'` |
| `date` | with `TIMESTAMP AS OF <timestamp>` |

## Three States of a Receipt

A commit can have no source rows for two different reasons, and the result keeps them apart:

| State | Rows | `recorded` | Source columns |
|-------|------|------------|----------------|
| **Read these** | One per source | `true` | Filled in |
| **Read nothing** | One | `true` | All `null` |
| **Not recorded** | One | `false` | All `null` |

- **Read nothing** is a fact. `INSERT ... VALUES`, an upload, a `CREATE TABLE ... AS SELECT` over literals, and a compaction read no catalog table, so there is nothing to list.
- **Not recorded** means the writer did not report a receipt: commits made before receipts existed, or through an engine older than the catalog. The commit is still listed, with a single row, so a history with a gap shows the gap.

Collapsing the two into "no rows" would make a table whose provenance was never recorded look like one built from nothing.

A source that had a schema but no commits when it was read has a `source_dataset` and a `null` `source_snapshot_id`. The statement did read it, and found nothing.

## Whether a Source Still Exists

A receipt names a snapshot; it does **not** hold it. Snapshots are reclaimed on a schedule, so the version a table was built from may be gone by the time you ask. `source_exists` says which:

| Value | Meaning |
|-------|---------|
| `true` | The snapshot can still be read |
| `false` | It has been reclaimed, or the source table no longer exists |
| `null` | The statement could not tell: the source's workspace was unreachable, or the source had no snapshot to look for |

`null` is not an error and not `false`. A source in a workspace that cannot be reached does not stop the history from being listed.

To keep a source version readable for as long as you need it, [tag it](alter-table#create-tag). The tag, not the receipt, is what holds it.

## The `how` Column

`how` is derived, not stored, so it can't disagree with the commit. It reads the operation and the producer together:

| Operation | Reads as |
|-----------|----------|
| `append`, `add-files` | `appended` |
| `overwrite` | `overwritten` |
| `truncate-and-add-files` | `replaced` |
| `truncate` | `truncated` |
| `merge` | `merged` |
| `update` | `updated` |
| `delete`, `delete-files` | `rows deleted` |
| `compact` | `compacted` |
| `statistics-refresh` | `statistics refreshed` |

Followed by who or what did it:

- `, by hand` when nothing registered made it, which is what a statement someone ran looks like
- `, by task <name>` or `, by view <name>` for a [task](create-task) run or a [materialized view](create-materialized-view) refresh
- `, uploaded via <channel>` for data that arrived from outside the catalog

Compaction and statistics refresh are the engine's own maintenance. They get the verb alone, because nobody ran them.

An operation the table above doesn't list is shown as itself.

## Examples

### List What a Table Was Built From
~~~sql
SHOW LINEAGE FOR my_workspace.reports.monthly_summary;
~~~

### Read a Source at the Version a Commit Used
Take `source_dataset` and `source_snapshot_id` from a row where `source_exists` is `true`, and read the source as it was:

~~~sql
SHOW LINEAGE FOR my_workspace.reports.monthly_summary;

SELECT *
  FROM my_workspace.sales.orders
   VERSION AS OF 1786421691019;
~~~

This is how you replay what a commit saw. If `source_exists` is `false`, that version has been reclaimed and cannot be read. Tag the sources you may need to replay before they expire.

## Notes

- **Requires read access** to the table you name, the same as a `SELECT` against it. Nothing more is asked about the sources: every source is named, including one in a workspace you have no grant on. A name in a receipt is a citation, not access, and reading the source still needs a grant of its own.
- **Catalog-backed tables only.** Receipts are part of the catalog's commit log. A table on a store that keeps none reports that it has no lineage, rather than an empty one.
- **A table with nothing committed returns no rows.** That is an empty history, not an error.
- **Always returns the whole history.** `SHOW` statements have no `WHERE` clause or column list, and the result is not a subquery source, so filter the rows client-side.
- **Cost.** The statement reads the table's snapshot history, and makes one catalog lookup per distinct source snapshot to fill in `source_exists`. A source named by many commits is looked up once. No data files are read.
- **A receipt is capped at 256 sources per commit.** A statement that reads more than that is truncated, and this statement does not report that it was.
- **The commit order matches [SHOW SNAPSHOTS FOR](show-snapshots).** Use that statement for what each commit added and removed; use this one for what it read.

## See Also

- [SHOW SOURCES FOR](show-sources) — the same receipts rolled up into what the table's current contents are made of.
- [SHOW SNAPSHOTS FOR](show-snapshots)
- [VERSION AS OF](version-as-of)
- [TIMESTAMP AS OF](timestamp-as-of)
- [ALTER TABLE ... CREATE TAG](alter-table#create-tag) — hold a source snapshot so a receipt can still be replayed.
- [Time Travel Queries](../advanced/adv-time-travel)
