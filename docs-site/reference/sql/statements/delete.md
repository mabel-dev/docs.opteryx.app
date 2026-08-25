---
title: DELETE Statement — Opteryx Reference
description: SQL DELETE FROM statement syntax, examples and limitations for removing rows from a table in Opteryx
---

# DELETE

The `DELETE` statement removes the rows of a table that a condition names.

> Warning: DELETE is experimental and only works against catalog-backed tables. It is not
> suitable for production use.

## Syntax

~~~sql
DELETE FROM <table> [ AS <alias> ]
[ WHERE <predicate> ];
~~~

## Parameters

- **`<table>`** — the table being changed. Must be a catalog-backed table, fully qualified
  as `<workspace>.<collection>.<table>`.
- **`<alias>`** — optional. If given, the condition may qualify columns with it.
- **`<predicate>`** — which rows to remove. **Omitting it removes every row.**

## Examples

### Remove Rows Matching a Condition

~~~sql
DELETE FROM catalogue.sessions.active
 WHERE expires_at < CURRENT_TIMESTAMP;
~~~

### With an Alias

~~~sql
DELETE FROM catalogue.sessions.active AS a
 WHERE a.expires_at < CURRENT_TIMESTAMP;
~~~

### Using a Sub-query

The condition is an ordinary `WHERE` clause, so it can read other tables:

~~~sql
DELETE FROM catalogue.security.vulnerabilities
 WHERE cve IN (SELECT cve FROM catalogue.security.withdrawn);
~~~

### Remove Every Row

~~~sql
DELETE FROM catalogue.staging.batch;
~~~

[TRUNCATE TABLE](truncate-table) has the same end result and is cheaper — it discards the
table's files outright rather than marking every row in them.

## How Rows Are Removed

`DELETE` does not rewrite the files the rows live in. Each removed row is marked as deleted
where it sits, and readers skip it from that point on. The cost of the statement scales
with how many rows are removed, not with the size of the table, and a `DELETE` writes no
new data at all. Files whose every row has been removed leave the table entirely; the rest
are cleaned up by `OPTIMIZE TABLE`.

The statement reads only the columns its condition needs. Nothing else is decoded.

`DELETE` reports how many rows it removed.

## Inspecting the Plan

`EXPLAIN` shows what a `DELETE` will do without running it:

~~~sql
EXPLAIN DELETE FROM catalogue.sessions.active WHERE expires_at < CURRENT_TIMESTAMP;
~~~

`EXPLAIN ANALYZE` is **rejected**, because `ANALYZE` measures a statement by running it —
which would make inspecting a plan change your table.

## Concurrency

A `DELETE` is built against the version of the table it read. If another writer commits to
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

DELETE is experimental. The following are rejected when the query is planned, not silently
ignored:

- **One table only.** `USING`, a join, and the multi-table `DELETE a, b FROM ...` form are
  all refused. To delete rows based on another table, put a sub-query in the `WHERE`
  clause, or use [MERGE](merge).
- **No `RETURNING` or `OUTPUT`.** The statement reports a row count; it cannot return the
  rows it removed.
- **No `ORDER BY` or `LIMIT`.** Rows are removed as a set, not in an order, and there is no
  bounded delete. Narrow the `WHERE` condition instead.
- **Catalog-backed tables only.** A read-only or non-catalog connector is refused — a row
  that has no addressable file has nothing to mark.
- **The table's schema is not changed.** `DELETE` removes rows; it does not drop columns.

There is also a memory ceiling. The statement holds the address of every row it removes
until it commits, because the commit is atomic. An extremely large delete is refused rather
than partially applied:

~~~
DELETE FROM ran out of address budget tracking which rows of <table> it has acted on.
~~~

## Notes

- The whole statement is one commit. Readers see either all of its changes or none of them
  — never a half-applied delete.
- A `DELETE` that matches no rows is a success that does nothing — it writes no new version
  of the table.
- Re-running the same `DELETE` is safe: the second run finds nothing left to remove and
  writes nothing.
- `DELETE` needs the same authority as any other write to the table.
- A materialized view is **not** a table: this statement is rejected against one. Its
  contents come from its defining `SELECT` — see
  [REFRESH MATERIALIZED VIEW](refresh-materialized-view#a-materialized-view-is-not-a-table).

## See Also

- [UPDATE](update)
- [MERGE](merge)
- [INSERT](insert)
- [TRUNCATE TABLE](truncate-table)
- [DROP TABLE](drop-table)
