---
title: DROP COLLECTION Statement — Opteryx Reference
description: SQL DROP COLLECTION statement syntax and examples for removing an empty collection in Opteryx
---

# DROP COLLECTION

The `DROP COLLECTION` statement removes an empty collection - the layer between a
workspace and its tables/views (`workspace.collection.table`).

## Syntax

~~~sql
DROP COLLECTION [ IF EXISTS ] <workspace>.<collection>;
~~~

## Parameters

- **`<workspace>.<collection>`** — the collection to drop, fully qualified by its workspace.
- `IF EXISTS` — skip the operation without error if the collection does not exist, instead
  of refusing the statement.

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

- The collection must be empty - drop every table and view in it first with
  [DROP TABLE](drop-table) / [DROP VIEW](drop-view). `DROP COLLECTION` never
  cascades and never removes tables or views on your behalf. `CASCADE` is rejected when
  the query is planned, rather than accepted and quietly not honoured.
- Collections come into existence implicitly, with the first table or view created in
  them. [CREATE COLLECTION](create-collection) makes one ahead of its first relation,
  but is never required.
- Requires the `owner` role on the collection *itself*, not just on the tables inside
  it - a grant like `workspace.staging.*` covers everything *in* the collection but
  does not match the collection's own name, so it does not grant `DROP COLLECTION`.
  You need a pattern that matches `workspace.staging` directly, such as an exact grant
  on `workspace.staging` or a workspace-wide `workspace.*`. See
  [Security & Permissions](/docs/core-concepts/access-and-permissions).

## See Also

- [CREATE COLLECTION](create-collection)
- [DROP TABLE](drop-table)
- [DROP VIEW](drop-view)
