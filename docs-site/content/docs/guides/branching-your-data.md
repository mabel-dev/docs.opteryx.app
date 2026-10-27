---
title: Branching Your Data — Clone, Tag, Roll Back
description: A walkthrough of Opteryx's data versioning — fork a table or a whole collection without copying data, tag a snapshot to keep it, compare versions with VERSION AS OF, and undo a bad write with ROLLBACK TO VERSION.
---

# Branching Your Data: Clone, Tag, Roll Back

A familiar situation: you want to try a change on real data — a cleanup, a backfill, a
migration — without putting the real table at risk, and if the change turns out to be wrong,
you want to get back to exactly where you were.

The usual answers are a full copy of the table, which costs time and storage in proportion to
its size, or a careful script and a backup you hope you never need. In Opteryx every commit
to a catalog-backed table is already a **snapshot**, and a handful of statements turn those
snapshots into a working toolkit:

| Statement | What it does | Moves data? |
|---|---|---|
| [`CREATE TABLE ... CLONE`](/docs/reference/sql/statements/clone) | A new table that starts as a copy of another | No |
| [`CREATE COLLECTION ... CLONE`](/docs/reference/sql/statements/clone#fork-a-whole-collection) | The same, for every table in a collection at once | No |
| [`ALTER TABLE ... CREATE TAG`](/docs/reference/sql/statements/alter-table#create-tag) | A name for one snapshot, which keeps it from being reclaimed | No |
| [`VERSION AS OF`](/docs/reference/sql/statements/version-as-of) / [`TIMESTAMP AS OF`](/docs/reference/sql/advanced/time-travel) | Read a table as it was at a snapshot, a tag, or a point in time | No |
| [`ALTER TABLE ... ROLLBACK TO VERSION`](/docs/reference/sql/statements/alter-table#rollback-to-version) | Make an older snapshot the current one again | No |
| [`ALTER TABLE ... RESYNC`](/docs/reference/sql/statements/alter-table#resync) | Bring a fork back up to its source's current contents | No |
| [`ALTER TABLE ... DETACH`](/docs/reference/sql/statements/alter-table#detach) | Turn a fork into a standalone table | **Yes** |

Cloning, tagging, rolling back and resyncing change metadata only, so each takes the same
time on a thousand rows as on a billion. `DETACH` is the one that copies files.

This guide walks through them in the order you would use them, on the TPC-H sample data.

## 1. Take a Copy

```sql
CREATE COLLECTION personal.tpch_sandbox CLONE samples.tpch_sf1;
```

That one statement forks every table in `samples.tpch_sf1` into a new collection,
`tpch_sandbox`, in the `personal` workspace. No
data is copied: each new table's first snapshot lists the same files its source's current
snapshot lists. The fork occupies no storage of its own until you write to it, and you are
billed only for what you add.

To fork a single table instead of the whole collection, use the table form:

```sql
CREATE TABLE personal.tpch_sandbox.lineitem CLONE samples.tpch_sf1.lineitem;
```

A fork is an **ordinary table**, not a branch held inside the source. You query it, write to
it, tag it and drop it exactly as you would any other table, and its writes land in its own
storage — the source, and every other fork of it, never see them.

## 2. Mark a Known-Good Point

```sql
ALTER TABLE personal.tpch_sandbox.lineitem
CREATE TAG before_cleanup;
```

A tag names one snapshot and **keeps it**. Snapshots are otherwise reclaimed on a schedule
you do not control, so a tag is the only reference guaranteed to still resolve next week.
Take one before any change you might want to undo.

## 3. Make the Change

```sql
DELETE FROM personal.tpch_sandbox.lineitem
 WHERE l_quantity < 5;
```

The delete commits a new snapshot on the fork. `samples.tpch_sf1.lineitem` is unchanged.

## 4. Compare Before and After

The tag is readable with `VERSION AS OF`, so the table before the change and the table after
it can sit in the same query:

```sql
SELECT
    (SELECT COUNT(*) FROM personal.tpch_sandbox.lineitem) AS after_cleanup,
    (SELECT COUNT(*) FROM personal.tpch_sandbox.lineitem VERSION AS OF 'before_cleanup') AS before_cleanup;
```

`VERSION AS OF PREVIOUS` reads the version of the data before the current one without a tag
or an id, and `TIMESTAMP AS OF` reads the table as it was at a point in time — see
[Time Travel](/docs/reference/sql/advanced/time-travel).

To see the history itself:

```sql
SHOW SNAPSHOTS FOR personal.tpch_sandbox.lineitem;
```

Each row is a commit, with its id, time, author and operation; the `tags` column shows which
snapshots a tag is holding.

## 5. Undo It

If the change was wrong:

```sql
ALTER TABLE personal.tpch_sandbox.lineitem
ROLLBACK TO VERSION before_cleanup;
```

The tagged snapshot becomes the current one again, for every reader, from the moment the
statement commits. Nothing is copied and nothing is deleted — the snapshot the table moved off
is still in `SHOW SNAPSHOTS FOR`, so a rollback can itself be undone by rolling forward to
that snapshot's id.

`ROLLBACK TO VERSION PREVIOUS` undoes the last change without a tag, as long as the previous
snapshot has not been reclaimed.

## 6. Catch Up With the Source

While you worked, the source may have moved on. To make the fork equal its source's current
contents again:

```sql
ALTER TABLE personal.tpch_sandbox.lineitem RESYNC;
```

Like the clone, this borrows the source's current files and copies nothing. If the fork has
commits of its own since it was last in sync, `RESYNC` is refused, because those commits are
what it would supersede. `RESYNC FORCE` goes ahead anyway; the superseded commits stay
readable through time travel until the fork's own retention retires them.

Nothing resyncs a fork on a schedule. If you want a table that keeps itself up to date, that
is a [materialized view](/docs/guides/when-a-materialized-view-replaces-a-pipeline).

## 7. Cut It Loose

A source cannot be dropped or renamed while forks of it exist. To make a fork stand alone:

```sql
ALTER TABLE personal.tpch_sandbox.lineitem DETACH;
```

This is the one statement in this guide that **moves data**: the files the fork's current
snapshot borrowed are copied into its own storage, and are stored and billed as yours from
then on. Only the current snapshot is copied, so the fork's older snapshots may stop resolving
once the source moves on.

## What It Costs

- **A clone** costs nothing until you write to it. You pay for the files your writes add.
- **A tag** keeps its snapshot's files from being reclaimed, and those files are billed to the
  table's workspace for as long as the tag exists. Dropping the tag is how you stop paying,
  and how you agree to lose that snapshot.
- **A rollback** and **a resync** move a pointer. Neither stores anything new.
- **A detach** copies the borrowed files, and they are billed as yours from then on.

## What This Is Not

- **Not unlimited history.** Snapshots that are not tagged are reclaimed, and may be reclaimed
  at any point. Time travel reaches back only as far as the snapshots that still exist. If a
  version matters, tag it.
- **Not a merge.** There is no statement that writes a fork's changes back into its source. To
  carry changes over, write them to the source as you would from any other table.
- **Not available on every table.** Forking, tagging and rolling back need a catalog-backed
  table with snapshot history. A table projected from an external catalog, such as Iceberg or
  PostgreSQL, cannot be forked — use
  [`CREATE TABLE AS SELECT`](/docs/reference/sql/statements/create-table) to take a copy
  instead.
- **Not for views.** `CREATE COLLECTION ... CLONE` forks the collection's tables and skips its
  views: a view is a query over table names, and a copy pointing at different tables would
  read the wrong data.

## Permissions

- Cloning needs `READ` on the source and `CREATE` on the target. Forking out of another
  workspace is refused while that workspace has `egress_protection` on — see
  [CREATE TABLE ... CLONE](/docs/reference/sql/statements/clone#permissions).
- Tagging, rolling back, resyncing and detaching need the `owner` role on the table, because
  each changes what every reader sees or what the workspace pays to keep.

## See Also

- [CREATE TABLE ... CLONE](/docs/reference/sql/statements/clone)
- [ALTER TABLE](/docs/reference/sql/statements/alter-table) — tags, rollback, resync and detach
- [VERSION AS OF](/docs/reference/sql/statements/version-as-of)
- [Time Travel](/docs/reference/sql/advanced/time-travel)
- [SHOW SNAPSHOTS FOR](/docs/reference/sql/statements/show-snapshots)
- [SHOW LINEAGE FOR](/docs/reference/sql/statements/show-lineage) — what each commit was built from
