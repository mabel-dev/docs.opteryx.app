---
title: ALTER TABLE Statement — Opteryx Reference
description: SQL ALTER TABLE syntax and examples for setting a table's clustering columns, and for renaming or moving a table, in Opteryx
---

# ALTER TABLE

The `ALTER TABLE` statement changes a table's physical layout or its name. Opteryx supports two operations:

| Operation | Purpose |
|-----------|---------|
| [`CLUSTER BY`](#cluster-by) | Set the columns a catalog-backed table should be sorted/clustered by |
| [`RENAME TO`](#rename-to) | Rename a table, optionally moving it to another collection |

Any other `ALTER TABLE` operation (`ADD COLUMN`, `DROP COLUMN`, ...) is rejected when the query is planned.

## Syntax

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
CLUSTER BY ( <column> [, ...] );

ALTER TABLE [ IF EXISTS ] <table_name>
RENAME TO <new_table_name>;
~~~

`<table_name>` and `<new_table_name>` are fully qualified as
`<workspace>.<collection>.<table_name>`.

## CLUSTER BY

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
CLUSTER BY ( <column> [, ...] );
~~~

### Parameters

- **`<column>`** — a column already present in the table's current schema. Given more than
  one, order matters: the first is the primary clustering key, the rest are secondary, in
  the order listed.
- `IF EXISTS` — skip the operation without error if the table does not exist.

### Cluster by a Single Column
~~~sql
ALTER TABLE workspace.collection.observations
CLUSTER BY (name);
~~~

### Cluster by Multiple Columns
~~~sql
ALTER TABLE workspace.collection.observations
CLUSTER BY (region, name);
~~~

Columns are stored in priority order; `region` is the primary clustering key above, `name` the secondary.

### Only If It Exists
~~~sql
ALTER TABLE IF EXISTS workspace.collection.observations
CLUSTER BY (name);
~~~

### Notes

- Requires the `owner` role on the table - the same tier as `DROP TABLE`, since clustering changes what the table fundamentally is, not just what's in it. See [Security & Permissions](/docs/core-concepts/access-and-permissions).
- `CLUSTER BY` replaces the table's entire clustering configuration; it does not add to a previous one.
- Requires a connector with a catalog to persist the clustering configuration in - not every backend supports this.
- Setting clustering columns declares intent for future compaction; it does not itself reorder existing data files. Data locality improves as the table is compacted.

## RENAME TO

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
RENAME TO <new_table_name>;
~~~

### Parameters

- **`<new_table_name>`** — fully qualified as `<workspace>.<collection>.<table_name>`. The
  workspace must match `<table_name>`'s; only the collection, the table name, or both may
  change.
- `IF EXISTS` — skip the operation without error if the source table does not exist.

### Rename Within a Collection
~~~sql
ALTER TABLE workspace.collection.observations
RENAME TO workspace.collection.readings;
~~~

### Move to Another Collection
~~~sql
ALTER TABLE workspace.collection.observations
RENAME TO workspace.archive.observations;
~~~

A rename may change the collection, the table name, or both.

### Only If It Exists
~~~sql
ALTER TABLE IF EXISTS workspace.collection.observations
RENAME TO workspace.collection.readings;
~~~

### Notes

- The workspace must be the same on both sides. Moving a table between workspaces is rejected when the query is planned - two workspaces are two catalogs, and moving data between them is a copy, not a rename.
- Requires the `owner` role on the source table (the same tier as `DROP TABLE` - the table stops existing under its old name) **and** create permission at the target. Owning the source does not let you move a table into a collection you have no grant on.
- The target must not already exist. A rename never absorbs an existing table, which would destroy that table's data and history with no `DROP` anywhere in the statement.
- Renaming a table to its own name is rejected rather than reported as a successful rename that changed nothing.

### Performance

A rename is not a metadata-only operation. The table's data files, every snapshot's manifest, and its catalog entry all move, so that its storage location keeps matching its name.

That means the cost scales with the size of the table, not with the length of the statement. Copies happen server-side, but a large table is still a long-running operation behind a statement that reads as instant. Snapshot history is preserved, so time travel keeps working across a rename; the cost also scales with how much history the table has.

The vacated storage location is reclaimed by the same background sweep that reclaims dropped tables, not deleted immediately.

## Materialized Views

`ALTER TABLE` is rejected against a materialized view, both `RENAME TO` and `CLUSTER BY`. A view is defined by its `SELECT`, not authored as a table — change it with `CREATE OR REPLACE MATERIALIZED VIEW`, rebuild it with [REFRESH MATERIALIZED VIEW](refresh-materialized-view.md), or remove it with [DROP MATERIALIZED VIEW](drop-materialized-view.md).

## See Also

- [CREATE TABLE](create-table.md)
- [DROP TABLE](drop-table.md)
- [TRUNCATE TABLE](truncate-table.md)
- [ALTER MATERIALIZED VIEW](alter-materialized-view.md)
