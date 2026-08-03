---
title: DROP COLLECTION Statement — Opteryx Reference
description: SQL DROP COLLECTION statement syntax and examples for removing an empty collection in Opteryx
---

# DROP COLLECTION

The `DROP COLLECTION` statement removes an empty collection - the layer between a
workspace and its tables/views (`workspace.collection.table`).

## Basic Syntax

~~~sql
DROP COLLECTION [IF EXISTS] [workspace].[collection];
~~~

## Examples

### Drop a Collection
~~~sql
DROP COLLECTION workspace.staging;
~~~

### Drop Only If It Exists
~~~sql
DROP COLLECTION IF EXISTS workspace.staging;
~~~

## Notes

- `IF EXISTS` skips the operation without error if the collection does not exist.
- The collection must be empty - drop every table and view in it first with
  [DROP TABLE](drop-table.md) / [DROP VIEW](drop-view.md). `DROP COLLECTION` never
  cascades and never removes tables or views on your behalf. `CASCADE` is rejected when
  the query is planned, rather than accepted and quietly not honoured.
- Collections come into existence implicitly, with the first table or view created in
  them; there is no `CREATE COLLECTION` statement.
- Requires the `owner` role on the collection *itself*, not just on the tables inside
  it - a grant like `workspace.staging.*` covers everything *in* the collection but
  does not match the collection's own name, so it does not grant `DROP COLLECTION`.
  You need a pattern that matches `workspace.staging` directly, such as an exact grant
  on `workspace.staging` or a workspace-wide `workspace.*`. See
  [Security & Permissions](/docs/core-concepts/access-and-permissions).
