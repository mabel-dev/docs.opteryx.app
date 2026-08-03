---
title: CREATE COLLECTION Statement — Opteryx Reference
description: SQL CREATE COLLECTION statement syntax and examples for creating a collection in Opteryx
---

# CREATE COLLECTION

The `CREATE COLLECTION` statement creates a collection — the layer between a workspace
and its tables/views (`workspace.collection.table`).

Creating a collection is **optional**. A collection comes into existence anyway with the
first table or view placed in it. This statement exists so a collection can be made ahead
of its first relation, and so [DROP COLLECTION](drop-collection.md) has a counterpart.

## Basic Syntax

~~~sql
CREATE COLLECTION [IF NOT EXISTS] [workspace].[collection];
~~~

## Examples

### Create a Collection
~~~sql
CREATE COLLECTION workspace.staging;
~~~

### Create Only If It Does Not Exist
~~~sql
CREATE COLLECTION IF NOT EXISTS workspace.staging;
~~~

## Notes

- The name is always two parts, `[workspace].[collection]`. A bare name or a three-part
  name is rejected when the query is planned — a collection lives inside exactly one
  workspace, and a bare name would create it somewhere you did not name.
- Requires `writer` or `owner` on the collection. This is deliberately a lower tier than
  [DROP COLLECTION](drop-collection.md), which requires `owner`: creating a collection
  destroys nothing, dropping one does.
- Without `IF NOT EXISTS`, creating a collection that already exists is an error.
- A collection owns no storage of its own, so creating one writes no data — it registers a
  namespace and nothing more.
- Requires a connector with a catalog to register the collection in — not every backend
  supports this.
- `CREATE SCHEMA` is accepted as a synonym, matching `DROP SCHEMA` / `DROP COLLECTION`.
