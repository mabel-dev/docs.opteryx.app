---
title: ALTER TABLE Statement — Opteryx Reference
description: SQL ALTER TABLE ... CLUSTER BY statement syntax and examples for setting a table's clustering columns in Opteryx
---

# ALTER TABLE

The `ALTER TABLE` statement changes a table's physical layout. Opteryx currently supports one operation: `CLUSTER BY`, which sets the columns a catalog-backed table should be sorted/clustered by.

## Basic Syntax

~~~sql
ALTER TABLE [IF EXISTS] [workspace].[collection].[table_name]
CLUSTER BY (column [, column ...]);
~~~

## Examples

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

## Notes

- Requires the `owner` role on the table - the same tier as `DROP TABLE`, since clustering changes what the table fundamentally is, not just what's in it. See [Security & Permissions](/docs/core-concepts/access-and-permissions).
- `CLUSTER BY` replaces the table's entire clustering configuration; it does not add to a previous one.
- Columns must already exist in the table's current schema.
- `IF EXISTS` skips the operation without error if the table does not exist.
- Requires a connector with a catalog to persist the clustering configuration in - not every backend supports this.
- Setting clustering columns declares intent for future compaction; it does not itself reorder existing data files. Data locality improves as the table is compacted.
