---
title: ALTER TABLE Statement — Opteryx Reference
description: SQL ALTER TABLE syntax and examples for adding, dropping, renaming and retyping columns, setting a table's clustering columns, and renaming or moving a table, in Opteryx
---

# ALTER TABLE

The `ALTER TABLE` statement changes a table's columns, its physical layout, or its name. Opteryx supports six operations:

| Operation | Purpose |
|-----------|---------|
| [`ADD COLUMN`](#add-column) | Append a column, backfilling the rows already stored |
| [`DROP COLUMN`](#drop-column) | Remove a column and its data |
| [`RENAME COLUMN`](#rename-column) | Change a column's name |
| [`ALTER COLUMN ... TYPE`](#alter-column-type) | Widen a column's type |
| [`CLUSTER BY`](#cluster-by) | Set the columns a catalog-backed table should be sorted/clustered by |
| [`RENAME TO`](#rename-to) | Rename a table, optionally moving it to another collection |

Any other `ALTER TABLE` operation — `ADD CONSTRAINT`, `SET DEFAULT`, `SET NOT NULL`, and the rest — is rejected when the query is planned. Opteryx does not enforce integrity constraints, so a statement that only declares one would change nothing; it is refused rather than accepted and silently ignored.

## Syntax

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
ADD COLUMN <column_name> <data_type> [ DEFAULT <literal> ];

ALTER TABLE [ IF EXISTS ] <table_name>
DROP COLUMN <column_name>;

ALTER TABLE [ IF EXISTS ] <table_name>
RENAME COLUMN <column_name> TO <new_column_name>;

ALTER TABLE [ IF EXISTS ] <table_name>
ALTER COLUMN <column_name> TYPE <data_type>;

ALTER TABLE [ IF EXISTS ] <table_name>
CLUSTER BY ( <column> [, ...] );

ALTER TABLE [ IF EXISTS ] <table_name>
RENAME TO <new_table_name>;
~~~

`<table_name>` and `<new_table_name>` are fully qualified as
`<workspace>.<collection>.<table_name>`.

## Column Operations

The four column operations share one implementation and one cost model, described
under [Performance](#performance-column-operations) below. All four require the
`owner` role, and all four are rejected against a materialized view.

### ADD COLUMN

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
ADD COLUMN <column_name> <data_type> [ DEFAULT <literal> ];
~~~

#### Parameters

- **`<column_name>`** — must not already exist in the table.
- **`<data_type>`** — any type [CREATE TABLE](create-table.md) accepts.
- **`DEFAULT <literal>`** — the value written into the rows that already exist. Must be a
  literal. Omitted, existing rows are filled with `NULL`.

#### Add a Column
~~~sql
ALTER TABLE workspace.collection.observations
ADD COLUMN reviewed_by VARCHAR;
~~~

Every row already stored reads back `NULL` for `reviewed_by`, typed as `VARCHAR` rather than an untyped null.

#### Add a Column With a Backfill Value
~~~sql
ALTER TABLE workspace.collection.observations
ADD COLUMN source VARCHAR DEFAULT 'legacy';
~~~

Every row already stored reads back `'legacy'`.

#### Notes

- **`DEFAULT` is a backfill value, not a constraint.** It answers one question — what goes
  in the file for the rows that exist right now — and nothing consults it afterwards. A
  later `INSERT` that omits the column writes `NULL`, not the default. This is why
  `ALTER COLUMN ... SET DEFAULT` is rejected: there is no later reader for it, so accepting
  it would imply a behaviour the engine does not have.
- The default must be a literal. An expression (`DEFAULT (price * 2)`) is rejected when the
  query is planned — it would have to be evaluated once per existing row, which is exactly
  the per-value work this operation avoids.
- A backfilled column costs almost nothing on disk however many rows the table has: one
  repeated value encodes to a constant chunk, not to one stored value per row.
- Columns are appended. There is no `FIRST` or `AFTER` positioning.

### DROP COLUMN

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
DROP COLUMN <column_name>;
~~~

#### Drop a Column
~~~sql
ALTER TABLE workspace.collection.observations
DROP COLUMN scratch_notes;
~~~

#### Notes

- The dropped column's data is not carried into the rewritten files, so the operation
  reclaims its space rather than merely hiding it.
- Dropping the last remaining column is rejected — a table with no columns is not a table.
- `CASCADE` and `RESTRICT` are rejected; Opteryx has no dependent objects to cascade to.
- Only one column per statement. `DROP COLUMN a, b` does not parse.
- Older snapshots still have the column, values and all. A
  [TIMESTAMP AS OF](timestamp-as-of.md) query pointing before the drop reads it back
  exactly as it was.

### RENAME COLUMN

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
RENAME COLUMN <column_name> TO <new_column_name>;
~~~

#### Rename a Column
~~~sql
ALTER TABLE workspace.collection.observations
RENAME COLUMN ts TO observed_at;
~~~

#### Notes

- The new name must not already be in use in the table.
- This is the cheapest of the four: not one byte of stored data changes, only each file's
  footer and the catalog's schema entry.
- The column keeps its identity in the catalog, so statistics gathered under the old name
  stay attached to it.

### ALTER COLUMN TYPE

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
ALTER COLUMN <column_name> TYPE <data_type>;
~~~

#### Widen a Column
~~~sql
ALTER TABLE workspace.collection.observations
ALTER COLUMN counter TYPE INT64;
~~~

#### Permitted Changes

Only **widening within a type family** is allowed. Every other change is rejected when the
query is planned, before any file is touched:

| From | To |
|------|-----|
| `INT8` | `INT16`, `INT32`, `INT64` |
| `INT16` | `INT32`, `INT64` |
| `INT32` | `INT64` |
| `UINT8` | `UINT16`, `UINT32`, `UINT64` |
| `UINT16` | `UINT32`, `UINT64` |
| `UINT32` | `UINT64` |
| `FLOAT32` | `FLOAT64` |

#### Notes

- **Narrowing is rejected** (`INT64` to `INT32`). It would have to either fail on the first
  value that does not fit or silently corrupt it, and neither belongs behind a statement
  that reads as a declaration.
- **Integer to floating point is rejected** (`INT64` to `FLOAT64`). It is not exact across
  the whole `INT64` range, so it is a lossy conversion wearing a widening's clothes.
- Changes across type families (`INT64` to `VARCHAR`), between signed and unsigned, and
  between temporal units are all rejected.
- A no-op (`ALTER COLUMN c TYPE INT64` on a column already `INT64`) is rejected rather than
  reported as a successful change that changed nothing.
- There is no `USING <expr>` clause. A conversion needing an expression is a rewrite of the
  table, not a type change — see [UPDATE](update.md).

### Performance (Column Operations)

All four operations rewrite every one of the table's current data files once and commit the
result as a new snapshot. That sounds expensive and mostly is not, because Parquet stores a
file's schema and its per-column byte offsets in a footer that is separate from the encoded
data pages. A column change is therefore, for almost every column involved, a footer edit
over bytes that are copied verbatim:

| Operation | What happens to the data |
|-----------|--------------------------|
| `RENAME COLUMN` | Nothing. Every column's pages, including the renamed one's, are copied byte-for-byte. |
| `DROP COLUMN` | The dropped column's pages are not copied; every other column's are, verbatim. |
| `ADD COLUMN` | Every existing page is copied verbatim; one small constant chunk is appended. |
| `ALTER COLUMN ... TYPE` | Usually nothing — Parquet has no 8- or 16-bit integer type, so `INT8`, `INT16` and `INT32` are all stored the same way and widening between them changes only the annotation. Widening to `INT64` or `UINT64` re-encodes **that one column**; every other column is still copied verbatim. |

So the cost scales with the table's SIZE, not with the number of values in it — close to
what moving the bytes costs — and no column's values are decoded except in the one retyping
case above.

Two consequences worth planning around:

- It is still real I/O over every current file. On a large table this is a long-running
  operation behind a statement that reads as instant.
- Files are written to new locations and only the new snapshot points at them. The
  superseded files stay put so older snapshots keep reading the shape they were written
  under, and are reclaimed by the same background sweep that reclaims dropped tables.

### Time Travel Across a Column Change

Each snapshot records the schema it was written under, and schema history is kept
indefinitely, so [TIMESTAMP AS OF](timestamp-as-of.md) resolves the shape the table had at
that moment — not the shape it has now:

~~~sql
-- the table today
SELECT * FROM workspace.collection.observations;
-- id | name | diameter | moons

-- the same table before the column changes
SELECT * FROM workspace.collection.observations
TIMESTAMP AS OF '2026-08-13 15:57:50';
-- id | name | diameter | gravity | number_of_moons
~~~

A dropped column is fully readable in a snapshot that predates the drop, and a renamed
column answers to its old name there. This is why a column change writes new files rather
than editing the existing ones.

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

`ALTER TABLE` is rejected against a materialized view — every operation, the column ones included. A view is defined by its `SELECT`, not authored as a table, so its columns are whatever that query returns; changing them means changing the query. Use `CREATE OR REPLACE MATERIALIZED VIEW`, rebuild it with [REFRESH MATERIALIZED VIEW](refresh-materialized-view.md), or remove it with [DROP MATERIALIZED VIEW](drop-materialized-view.md).

## See Also

- [CREATE TABLE](create-table.md)
- [DROP TABLE](drop-table.md)
- [TRUNCATE TABLE](truncate-table.md)
- [ALTER MATERIALIZED VIEW](alter-materialized-view.md)
