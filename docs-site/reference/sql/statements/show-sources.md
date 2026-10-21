---
title: SHOW SOURCES FOR Statement — Opteryx Reference
description: SQL SHOW SOURCES FOR statement syntax and examples for listing which tables the current contents of an Opteryx table were built from
---

# SHOW SOURCES FOR

The `SHOW SOURCES FOR` statement lists the tables whose data is in a table **right now** — one row per source, most recently read first. It answers "what is this table made of?"

It is the short companion to [SHOW LINEAGE FOR](show-lineage). Lineage lists every commit's receipt, so it tells you what each version was built from over the table's whole history. Sources is those receipts rolled up for the current contents, and kept on the table itself, so it answers from a single read. No history is loaded and no data files are read.

## Syntax

~~~sql
SHOW SOURCES FOR <table_name>;
~~~

Bare `SHOW SOURCES` is **not supported**, and neither is `SHOW SOURCES FROM`. A source list belongs to one table, so name it with the `FOR` form.

## Parameters

- **`<table_name>`** — fully qualified as `<workspace>.<collection>.<table_name>`.

## Result Columns

| Column | Description |
|--------|-------------|
| `source_dataset` | The fully qualified name of a table whose data is in this table's current contents |
| `position` | `0` for the most recently read source, counting up. Stated explicitly so the order survives a client that re-sorts by name |
| `complete` | Whether the list is known to hold every source. See [Completeness](#completeness) |

`complete` is repeated on every row, not reported once, so the result has one shape.

## How the List Is Kept

The list is maintained by the commits themselves, from each commit's receipt (see [SHOW LINEAGE FOR](show-lineage#three-states-of-a-receipt)). What a commit does to it depends on what the commit did to the data:

| Commit | Effect on the list |
|--------|--------------------|
| An append, merge or update | The sources it read are added at the front; names already there move to the front |
| An overwrite, or a truncate that adds files | The list is **replaced** by the sources the commit read, because none of the old content remains |
| A truncate | The list is cleared |
| A delete that leaves no rows | The list is cleared |
| Compaction, statistics refresh | Unchanged. The content is the same content |
| A [rollback](alter-table#rollback-to-version) | Recomputed from the receipts along the chain the table now rests on |

A table is never in its own source list, even when the statement that wrote it read it, as a `MERGE` does when it matches against its target.

The list holds the **current** content's sources, not everything the table has ever read. A table that was rebuilt last night from a different source no longer lists the old one, though its lineage still does.

## Completeness

The list can be missing a name in two cases, and `complete` is `false` when either has happened:

- **The cap.** The list holds at most **64** names. If more than that contributed, the oldest are dropped.
- **A commit with no receipt.** A commit made before receipts existed, or through an engine older than the catalog, contributes nothing the list could record. Any table with history from before receipts is incomplete by definition.

`complete` returns to `true` after the next overwrite or truncate, because both start the list afresh.

`complete` can also be `null`: the catalog did not say, which is what a table from before the field existed reports. That is a different answer from `false`.

An empty list is one row, with `source_dataset` and `position` both `null`, so that `complete` can still be read:

| `source_dataset` | `complete` | Means |
|------------------|------------|-------|
| `null` | `true` | Built from nothing: literals, uploads, `INSERT ... VALUES` |
| `null` | `false` | Built from nothing that was recorded |

## Examples

### What Is This Table Made Of?
~~~sql
SHOW SOURCES FOR my_workspace.reports.monthly_summary;
~~~

### Which Version of Each Source?
`SHOW SOURCES FOR` names the tables but not the versions. For the snapshot of each that a commit read, use [SHOW LINEAGE FOR](show-lineage):

~~~sql
SHOW LINEAGE FOR my_workspace.reports.monthly_summary;
~~~

## Notes

- **Requires read access** to the table you name, the same as a `SELECT` against it. Every source is named, including one in a workspace you have no grant on. A name in a source list is a citation, not access, and reading the source still needs a grant of its own.
- **Catalog-backed tables only.** A table on a store that keeps no commit log reports that it has no source list, rather than an empty one.
- **Declared is not the same as read.** A materialized view's declared sources are what it is defined to read. This list is what its refreshes **have** read.
- **Always returns the whole list.** `SHOW` statements have no `WHERE` clause or column list, and the result is not a subquery source, so filter the rows client-side.
- **Free to run.** One document is read. No history is loaded and no data files are read.

## See Also

- [SHOW LINEAGE FOR](show-lineage) — the receipts behind this list, one row per source per commit.
- [SHOW SNAPSHOTS FOR](show-snapshots)
- [CREATE MATERIALIZED VIEW](create-materialized-view)
