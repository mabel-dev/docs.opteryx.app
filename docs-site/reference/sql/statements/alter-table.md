---
title: ALTER TABLE Statement — Opteryx Reference
description: SQL ALTER TABLE syntax and examples for adding, dropping, renaming and retyping columns, setting a table's clustering columns, renaming or moving a table, creating or dropping snapshot tags, and declaring informational foreign keys, in Opteryx
---

# ALTER TABLE

The `ALTER TABLE` statement changes a table's columns, its physical layout, its name, which of its snapshots are held from reclamation, or what it records about how its columns relate to other tables. Opteryx supports eleven operations:

| Operation | Purpose |
|-----------|---------|
| [`ADD COLUMN`](#add-column) | Append a column, backfilling the rows already stored |
| [`DROP COLUMN`](#drop-column) | Remove a column and its data |
| [`RENAME COLUMN`](#rename-column) | Change a column's name |
| [`ALTER COLUMN ... TYPE`](#alter-column-type) | Widen a column's type |
| [`CLUSTER BY`](#cluster-by) | Set the columns a catalog-backed table should be sorted/clustered by |
| [`RENAME TO`](#rename-to) | Rename a table, optionally moving it to another collection |
| [`CREATE TAG`](#create-tag) | Name a snapshot, and hold it from reclamation for as long as the name exists |
| [`DROP TAG`](#drop-tag) | Remove the name, releasing the snapshot it held |
| [`ROLLBACK TO VERSION`](#rollback-to-version) | Make an older snapshot the current one, for every reader |
| [`ADD CONSTRAINT`](#add-constraint) | Declare, without enforcing, that a column corresponds to a column of another table |
| [`DROP CONSTRAINT`](#drop-constraint) | Remove one of those declarations by name |

Any other `ALTER TABLE` operation — `SET DEFAULT`, `SET NOT NULL`, `PRIMARY KEY`, an enforcing `FOREIGN KEY`, and the rest — is rejected when the query is planned. Opteryx enforces no integrity constraints, so accepting one would imply behaviour it does not have; it is refused rather than accepted and silently ignored. The single exception is the `NOT ENFORCED` foreign key below, which says on its face that nothing is checked and so promises nothing.

## Syntax

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
ADD COLUMN [ IF NOT EXISTS ] <column_name> <data_type> [ DEFAULT <literal> ];

ALTER TABLE [ IF EXISTS ] <table_name>
DROP COLUMN [ IF EXISTS ] <column_name>;

ALTER TABLE [ IF EXISTS ] <table_name>
RENAME COLUMN <column_name> TO <new_column_name>;

ALTER TABLE [ IF EXISTS ] <table_name>
ALTER COLUMN <column_name> TYPE <data_type>;

ALTER TABLE [ IF EXISTS ] <table_name>
CLUSTER BY ( <column> [, ...] );

ALTER TABLE [ IF EXISTS ] <table_name>
RENAME TO <new_table_name>;

ALTER TABLE [ IF EXISTS ] <table_name>
CREATE TAG <tag_name> [ AS OF VERSION { <snapshot_id> | CURRENT | PREVIOUS } ];

ALTER TABLE [ IF EXISTS ] <table_name>
DROP TAG <tag_name>;

ALTER TABLE [ IF EXISTS ] <table_name>
ROLLBACK TO VERSION { <snapshot_id> | <tag_name> | PREVIOUS };

ALTER TABLE [ IF EXISTS ] <table_name>
ADD CONSTRAINT <constraint_name>
FOREIGN KEY ( <column> ) REFERENCES <table_name> ( <column> ) NOT ENFORCED;

ALTER TABLE [ IF EXISTS ] <table_name>
DROP CONSTRAINT [ IF EXISTS ] <constraint_name>;
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
ADD COLUMN [ IF NOT EXISTS ] <column_name> <data_type> [ DEFAULT <literal> ];
~~~

#### Parameters

- **`IF NOT EXISTS`** — do nothing, without error, if the table already has a column of
  this name. Omitted, an already-present name is an error.
- **`<column_name>`** — must not already exist in the table, unless `IF NOT EXISTS` is given.
- **`<data_type>`** — any type [CREATE TABLE](create-table) accepts.
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

#### Add a Column Only If It Is Missing
~~~sql
ALTER TABLE workspace.collection.observations
ADD COLUMN IF NOT EXISTS source VARCHAR DEFAULT 'legacy';
~~~

Run once, this adds `source`. Run again, it does nothing and reports success — which is
what makes a migration script re-runnable.

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
- `IF NOT EXISTS` matches on the column NAME alone. A column that is already there is left
  exactly as it is — the statement does not check, or change, its type or its default.
- The two guards are independent. `IF EXISTS` on the `ALTER TABLE` forgives a missing
  table; `IF NOT EXISTS` on the `ADD COLUMN` forgives a column that is already there.
  Write both to make the statement unconditionally re-runnable.

### DROP COLUMN

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
DROP COLUMN [ IF EXISTS ] <column_name>;
~~~

#### Parameters

- **`IF EXISTS`** — do nothing, without error, if the table has no column of this name.
  Omitted, an unknown name is an error.

#### Drop a Column
~~~sql
ALTER TABLE workspace.collection.observations
DROP COLUMN scratch_notes;
~~~

#### Drop a Column Only If It Is There
~~~sql
ALTER TABLE workspace.collection.observations
DROP COLUMN IF EXISTS scratch_notes;
~~~

The mirror of `ADD COLUMN IF NOT EXISTS`, and re-runnable for the same reason.

#### Notes

- The dropped column's data is not carried into the rewritten files, so the operation
  reclaims its space rather than merely hiding it.
- Dropping the last remaining column is rejected — a table with no columns is not a table.
- `CASCADE` and `RESTRICT` are rejected; Opteryx has no dependent objects to cascade to.
- Only one column per statement. `DROP COLUMN a, b` does not parse.
- Older snapshots still have the column, values and all. A
  [TIMESTAMP AS OF](timestamp-as-of) query pointing before the drop reads it back
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
  table, not a type change — see [UPDATE](update).

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
indefinitely, so [TIMESTAMP AS OF](timestamp-as-of) resolves the shape the table had at
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

## CREATE TAG

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
CREATE TAG <tag_name> [ AS OF VERSION { <snapshot_id> | CURRENT | PREVIOUS } ];
~~~

A tag is a **name bound to one snapshot, which keeps that snapshot alive**. Snapshots are
otherwise reclaimed on a schedule you do not control — see
[Snapshot Reclamation](/docs/reference/sql/advanced/adv-time-travel#snapshot-reclamation) —
so without a tag there is no way to say "the data the February report was built from" and
still be able to read it in March. The name is the small half of the feature; the
keeping-alive is the point.

### Parameters

- **`<tag_name>`** — starts with a letter, then letters, digits and underscores, up to 128
  characters. No dots, no hyphens. It may be written bare or single-quoted —
  `CREATE TAG report_202602` and `CREATE TAG 'report_202602'` mean the same thing — and it
  **folds to lowercase**: `MyTag` and `mytag` are one tag with one spelling.
- **`AS OF VERSION <snapshot_id>`** — a snapshot id, as reported by
  [`SHOW SNAPSHOTS FOR`](show-snapshots).
- **`AS OF VERSION CURRENT`** — the snapshot a plain `SELECT` reads today. This is the
  default when the clause is omitted entirely. (`LATEST` was the old spelling and is
  refused, with a message naming `CURRENT`.)
- **`AS OF VERSION PREVIOUS`** — the previous version of the *data*, exactly the one
  [`VERSION AS OF PREVIOUS`](version-as-of) would read. It steps over the compaction and
  statistics commits that changed no rows.
- `IF EXISTS` — skip the operation without error if the table does not exist.

### Tag the Current Version
~~~sql
ALTER TABLE workspace.collection.observations
CREATE TAG report_202602;
~~~

Equivalent to `AS OF VERSION CURRENT`. The commonest form: name what is there right now,
before something else lands on top of it.

### Tag a Specific Snapshot
~~~sql
ALTER TABLE workspace.collection.observations
CREATE TAG report_202602 AS OF VERSION 1755000000000;
~~~

### Tag the Version Before the Current One
~~~sql
ALTER TABLE workspace.collection.observations
CREATE TAG before_the_backfill AS OF VERSION PREVIOUS;
~~~

### Notes (CREATE TAG)

- **A tag resolves to an id at creation, and stores that id.** `CURRENT` and `PREVIOUS` are
  looked up once, when the statement runs. A tag holding the word "current" would silently
  mean something different tomorrow, which is the opposite of what a tag is for.
- **`current` and `previous` cannot be used as tag names.** Both already resolve on the read
  path — `current` is the virtual tag `SHOW SNAPSHOTS FOR` shows against the head — and a
  real, immutable tag of either name would take the word over and then never move again.
- **A tag is immutable.** Re-creating a name that already exists is refused, not silently
  rebound. To move a name, [`DROP TAG`](#drop-tag) it and create it again — the drop is the
  visible act that releases the old snapshot.
- **A tag lives until it is dropped.** Nothing ages it out, no retention setting reaches it,
  and no refresh supersedes it.
- **The storage a tag holds is charged.** A tag stops bytes from being reclaimed, and those
  bytes are billed to the table's workspace like any other stored data, for as long as the
  tag exists. This is the cost of the guarantee, and it is open-ended by design.
- **A reclaimed snapshot cannot be tagged.** Its files are already on their way out of
  storage, so the statement fails rather than creating a name that promises data nobody can
  produce. Tag it before it ages out, not after.
- **A table can hold 100 tags.** Nothing ages a tag out, so the limit is the only bound on
  how much history one table can pin. The hundred-and-first is an error naming the limit,
  never a silent drop of an older one.
- **A table with nothing committed to it has no version to tag**, and says so.
- Requires the `owner` role on the table — the same tier as every other `ALTER TABLE`
  operation. Creating a tag commits the table's owner to an open-ended storage cost, and
  dropping one is how data stops being kept; neither is a writer's call. See
  [Security & Permissions](/docs/core-concepts/access-and-permissions).
- Requires a catalog-backed table with snapshot history. There is nothing to tag on a
  connector without one, and the statement is rejected when the query is planned.
- Accepted against a materialized view — see [Materialized Views](#materialized-views).

## DROP TAG

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
DROP TAG <tag_name>;
~~~

Removes the name and **releases the snapshot it was holding**.

### Drop a Tag
~~~sql
ALTER TABLE workspace.collection.observations
DROP TAG report_202602;
~~~

### Notes (DROP TAG)

- **Dropping a tag is how you agree to lose the data it was holding.** The snapshot returns
  to the ordinary retention rules immediately, and if it is already older than the retention
  window it is reclaimed on the next maintenance run — possibly within minutes. There is no
  grace period, and the data is not recoverable by re-creating the tag afterwards.
- There is no `IF EXISTS` for the tag itself. A name that is not there is an error, so a
  typo cannot be mistaken for a successful drop. (The `IF EXISTS` in the syntax above
  forgives a missing *table*, not a missing tag.)
- The name becomes reusable at once, which is what makes drop-then-create the sanctioned way
  to move a tag to a different snapshot.
- Requires the `owner` role, as `CREATE TAG` does.

## ROLLBACK TO VERSION

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
ROLLBACK TO VERSION { <snapshot_id> | <tag_name> | PREVIOUS };
~~~

Makes an older snapshot the **current** one. Every read of the table with no version clause
returns that snapshot from the moment the statement commits — for every reader, not just the
session that ran it.

Nothing is copied and nothing is deleted. A rollback moves one pointer, so it takes the same
time on a table of a thousand rows and a table of a billion.

### Parameters

- **`<snapshot_id>`** — a snapshot id, as reported by [`SHOW SNAPSHOTS FOR`](show-snapshots).
- **`<tag_name>`** — a tag on this table. The most reliable form: a tag is the only reference
  guaranteed to still resolve, because holding its snapshot from reclamation is what a tag
  does.
- **`PREVIOUS`** — the previous version of the data, exactly what
  [`VERSION AS OF PREVIOUS`](version-as-of) would read. It steps over the compaction and
  statistics commits that changed no rows, so rolling back `PREVIOUS` always undoes a change
  somebody made.
- `IF EXISTS` — skip the operation without error if the table does not exist.

### Undo the Last Change
~~~sql
ALTER TABLE workspace.collection.observations
ROLLBACK TO VERSION PREVIOUS;
~~~

### Roll Back to a Tagged Snapshot
~~~sql
ALTER TABLE workspace.collection.observations
CREATE TAG before_the_migration;

-- ... the migration goes wrong ...

ALTER TABLE workspace.collection.observations
ROLLBACK TO VERSION before_the_migration;
~~~

Tagging before a risky change is the pattern this statement is built around: the tag
guarantees the snapshot is still there to go back to, and gives the rollback a name a person
can recognise months later.

### Roll Forward Again
~~~sql
SHOW SNAPSHOTS FOR workspace.collection.observations;

ALTER TABLE workspace.collection.observations
ROLLBACK TO VERSION 1755000000000;
~~~

A rollback is undone by rolling *forward* — the snapshot it moved off is still in the
history, and naming its id makes it the current one again.

### Notes (ROLLBACK TO VERSION)

- **Nothing is deleted.** The snapshots the head moves off keep their data files, stay in
  [`SHOW SNAPSHOTS FOR`](show-snapshots), and can still be read by id with
  [`VERSION AS OF`](version-as-of). That is what makes a rollback reversible.
- **They are not held from reclamation, though.** Ordinary retention still applies, and once
  a rolled-off snapshot ages out the rollback can no longer be undone. If you may want to go
  back, [`CREATE TAG`](#create-tag) the current version *before* rolling back.
- **The `current` name follows the head.** After a rollback, `SHOW SNAPSHOTS FOR` reports
  `is_current` and the virtual `current` tag against the snapshot you rolled back to, which is
  not the newest row in the list.
- **`TIMESTAMP AS OF` will not return a rolled-off version.** A point-in-time read is bounded
  by the current snapshot, so it never answers with a version the table's owner has rolled
  back. Naming a rolled-off snapshot's id explicitly still works.
- **The schema pointer moves with the head.** Rolling back past an `ADD COLUMN` restores the
  schema that snapshot was written with, so the table does not advertise columns its files do
  not have.
- **It is a compare-and-swap.** If a commit lands between the statement reading the head and
  moving it, the rollback is refused rather than discarding that commit. Re-run it.
- **Rolling back to where the head already is succeeds and changes nothing** — so a rollback
  that has to be retried is safe to retry.
- **A locked table is refused**, as it is for a drop: a lock is two people agreeing not to
  change a table, and replacing every row in it is a change.
- **A reclaimed snapshot cannot be rolled back to**, and neither can one with no manifest —
  pointing the head at either would present the table as empty rather than as rolled back.
- Requires the `owner` role on the table — the same tier as every other `ALTER TABLE`
  operation. A rollback changes what every reader of the table sees; it is not a writer's
  call. See [Security & Permissions](/docs/core-concepts/access-and-permissions).
- Requires a catalog-backed table with snapshot history. There is nothing to roll back to on
  a connector without one, and the statement is rejected when the query is planned.

## Reading a Tag

A tag is read with [`VERSION AS OF`](version-as-of), naming it instead of a snapshot id:

~~~sql
SELECT * FROM workspace.collection.observations
VERSION AS OF 'report_202602';
~~~

[`SHOW SNAPSHOTS FOR`](show-snapshots) reports the tags on each snapshot in its `tags`
column, which is also the answer to "why is this old snapshot still here".

## ADD CONSTRAINT

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
ADD CONSTRAINT <constraint_name>
FOREIGN KEY ( <column> ) REFERENCES <table_name> ( <column> ) NOT ENFORCED;
~~~

Records that a column holds values corresponding to a column of another table — a
customer reference that matches a customer id, an order line that matches an order.
**Nothing is enforced.** A write that breaks the relationship succeeds, no error is
raised, and the engine never consults the declaration when planning a query. It is
recorded so that people and tools can see how your tables fit together.

`NOT ENFORCED` is required and is never assumed. A plain `FOREIGN KEY` is an enforcing
one, and Opteryx will not accept a statement whose ordinary meaning is a rule it has no
intention of applying.

### Parameters

| Parameter | Description |
|-----------|-------------|
| `<constraint_name>` | Names the declaration. It is the only handle `DROP CONSTRAINT` has, so it is required, and it must be unique on the table |
| `FOREIGN KEY ( <column> )` | The column on this table. Exactly one |
| `REFERENCES <table_name> ( <column> )` | The table and column it corresponds to. Exactly one column, and the table must be in the same workspace |

### Declare a Relationship
~~~sql
ALTER TABLE support.helpdesk.tickets
ADD CONSTRAINT tickets_customer_fk
FOREIGN KEY (customer_ref) REFERENCES support.crm.customers (id) NOT ENFORCED;
~~~

### Notes (ADD CONSTRAINT)

- **Nothing is ever checked.** Not on `INSERT`, not on `UPDATE`, not on `DELETE`, and not
  when the constraint is created — a table already full of values with no match on the
  other side accepts the declaration without complaint.
- **The engine does not use it.** It will not turn a join into a different one, prune a
  read, or change a plan. Tools read it; the engine records it.
- **Both columns must exist**, on both tables, and both tables must be in the same
  workspace. A relationship is held by the workspace it is declared in, so it cannot point
  at another one.
- **One relationship per statement**, since `ALTER TABLE` takes one operation at a time.
  A composite key is not supported: what is recorded is that one column corresponds to one
  column.
- **The form implies `many_to_one`.** That is what a foreign key means, and it is recorded
  as declared rather than checked against the data.
- Clauses that describe enforcement are rejected: `ON DELETE`, `ON UPDATE`, `MATCH`,
  `DEFERRABLE`, `INITIALLY` and `NOT VALID`. There is no rule here for them to qualify.
- Requires the `owner` role on the table being altered, **and at least `reader` on the
  table being referenced** — which stops a relationship being declared into data the
  author has never seen.
- Read the declarations back from
  [`information_schema.column_relationships`](/docs/reference/sql/advanced/adv-information-schema),
  where a row appears only if you can see both of its tables.

## DROP CONSTRAINT

~~~sql
ALTER TABLE [ IF EXISTS ] <table_name>
DROP CONSTRAINT [ IF EXISTS ] <constraint_name>;
~~~

Removes one declaration by name. Nothing else changes: no data is touched, because none
ever depended on it.

### Drop a Declaration
~~~sql
ALTER TABLE support.helpdesk.tickets
DROP CONSTRAINT tickets_customer_fk;
~~~

### Notes (DROP CONSTRAINT)

- A name that is not there is an error, so a typo cannot be mistaken for a successful drop.
  `DROP CONSTRAINT IF EXISTS` makes it quiet.
- `CASCADE` and `RESTRICT` are rejected. Nothing references a declaration, so there is
  nothing for either to decide.
- Requires the `owner` role, as `ADD CONSTRAINT` does. Only the near table is checked —
  removing a declaration discloses nothing about the table it referenced.
- Dropping either table removes the declarations on it. A declaration pointing *at* a
  dropped or renamed table is left in place, naming something that is no longer there.

## Materialized Views

`ALTER TABLE` is rejected against a materialized view for every operation that changes the table's shape, layout or name — the four column operations, `CLUSTER BY`, `RENAME TO`, and the two constraint operations. A view is defined by its `SELECT`, not authored as a table, so its columns are whatever that query returns; changing them means changing the query. Use `CREATE OR REPLACE MATERIALIZED VIEW`, rebuild it with [REFRESH MATERIALIZED VIEW](refresh-materialized-view), or remove it with [DROP MATERIALIZED VIEW](drop-materialized-view).

`CREATE TAG` and `DROP TAG` are the exception: they are **accepted** against a materialized view. A view's backing table has an ordinary snapshot history, and a tag on one pins it exactly as it would on any other table. A refresh that supersedes the tagged snapshot does not release it — so a view refreshing every fifteen minutes can hold an unbounded amount of history if it is tagged, bounded only by the hundred-tag limit. See [Notes](#notes-create-tag) below.

## See Also

- [CREATE TABLE](create-table)
- [DROP TABLE](drop-table)
- [TRUNCATE TABLE](truncate-table)
- [ALTER MATERIALIZED VIEW](alter-materialized-view)
- [SHOW SNAPSHOTS FOR](show-snapshots) — lists a table's snapshots, and the tags on each
- [VERSION AS OF](version-as-of) — read a snapshot by tag name
- [Time Travel](/docs/reference/sql/advanced/adv-time-travel) — how long snapshots last, and what a tag changes about that
