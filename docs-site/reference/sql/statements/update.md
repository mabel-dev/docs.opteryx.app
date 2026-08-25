---
title: UPDATE Statement — Opteryx Reference
description: SQL UPDATE statement syntax, examples and limitations for changing rows of a table in Opteryx
---

# UPDATE

The `UPDATE` statement changes the rows of a table that a condition names.

> Warning: UPDATE is experimental and only works against catalog-backed tables. It is not
> suitable for production use.

## Syntax

~~~sql
UPDATE <table> [ AS <alias> ]
   SET <column> = <expression> [, ...]
[ WHERE <predicate> ];
~~~

## Parameters

- **`<table>`** — the table being changed. Must be a catalog-backed table, fully qualified
  as `<workspace>.<collection>.<table>`.
- **`<alias>`** — optional. If given, expressions may qualify columns with it.
- **`<column>`** — a column of the target. Naming a column the table does not have is an
  error, not a silently ignored assignment.
- **`<expression>`** — the new value. It may read the row being replaced.
- **`<predicate>`** — which rows to change. **Omitting it changes every row.**

## Examples

### Change Rows Matching a Condition

~~~sql
UPDATE catalogue.inventory.stock
   SET quantity = 0
 WHERE sku = 'SKU-1042';
~~~

### Read the Row You Are Replacing

An assignment can use the column's existing value:

~~~sql
UPDATE catalogue.security.vulnerabilities
   SET revision = revision + 1,
       last_updated = CURRENT_TIMESTAMP
 WHERE cve = 'CVE-2024-0001';
~~~

Columns the `SET` list does not mention keep their existing values — `details` above is
carried through untouched.

### Several Columns at Once

~~~sql
UPDATE catalogue.inventory.stock AS s
   SET quantity = 0,
       status = 'discontinued'
 WHERE s.supplier_id = 42;
~~~

### Change Every Row

~~~sql
UPDATE catalogue.staging.batch SET imported_at = CURRENT_TIMESTAMP;
~~~

## How Rows Are Changed

There is no in-place mutation. The old version of each row is marked as deleted where it
sits and the new version is written alongside it, both in one commit. Files the statement
never touched are not rewritten, so the cost scales with how many rows change, not with the
size of the table. Removed rows are cleaned up by `OPTIMIZE TABLE`.

Because a partial `SET` list rebuilds a whole row, the statement reads every column of the
rows it changes — that is what makes the omitted columns keep their values.

Column names are matched without regard to case: `SET DETAILS = ...` assigns to a column
named `details`.

`UPDATE` reports how many rows it changed.

## Inspecting the Plan

`EXPLAIN` shows what an `UPDATE` will do without running it:

~~~sql
EXPLAIN UPDATE catalogue.inventory.stock SET quantity = 0 WHERE sku = 'SKU-1042';
~~~

`EXPLAIN ANALYZE` is **rejected**, because `ANALYZE` measures a statement by running it —
which would make inspecting a plan change your table.

## Concurrency

An `UPDATE` is built against the version of the table it read. If another writer commits to
that table first, the statement is refused rather than published, because publishing would
drop their work:

~~~
Another writer committed to <table> while this statement was preparing its own
commit, so it was refused. Nothing was written. Re-run the statement - it will be
rebuilt against the current state of the relation.
~~~

Nothing is written, and re-running rebuilds against whatever is now current. It is not
retried for you: whether the work is still valid depends on what the other writer did.

## Limitations

UPDATE is experimental. The following are rejected when the query is planned, not silently
ignored:

- **One table only.** `UPDATE ... FROM` and joins are refused. An update whose new values
  come from a second table is a [MERGE](merge).
- **No `RETURNING` or `OUTPUT`.** The statement reports a row count; it cannot return the
  rows it changed.
- **No `LIMIT`.** Rows are changed as a set, and there is no bounded update. Narrow the
  `WHERE` condition instead.
- **No `UPDATE OR ...` conflict clause.** `UPDATE OR REPLACE` and `UPDATE OR IGNORE` are
  not supported.
- **Each column assigned at most once** per statement.
- **Assignments must name a column of the target.** An unknown column is an error rather
  than an assignment quietly dropped on the floor.
- **Catalog-backed tables only.** A read-only or non-catalog connector is refused.
- **The table's schema is not changed.** `UPDATE` writes rows; it does not add, drop or
  retype columns, and an assignment must be compatible with the column's existing type.

There is also a memory ceiling. The statement holds the address of every row it changes
until it commits, because the commit is atomic. An extremely large update is refused rather
than partially applied:

~~~
UPDATE ran out of address budget tracking which rows of <table> it has acted on.
~~~

## Notes

- The whole statement is one commit. Readers see either all of its changes or none of them
  — never a half-applied update.
- An `UPDATE` that matches no rows is a success that does nothing — it writes no new
  version of the table.
- `UPDATE` needs the same authority as any other write to the table.
- A materialized view is **not** a table: this statement is rejected against one. Its
  contents come from its defining `SELECT` — see
  [REFRESH MATERIALIZED VIEW](refresh-materialized-view#a-materialized-view-is-not-a-table).
- To apply inserts, updates and deletes together from a table of changes, use
  [MERGE](merge) — one statement, one commit.

## See Also

- [DELETE](delete)
- [MERGE](merge)
- [INSERT](insert)
