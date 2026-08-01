---
title: DROP TABLE Statement — Opteryx Reference
description: SQL DROP TABLE statement syntax and examples for removing tables in Opteryx
---

# DROP TABLE

The `DROP TABLE` statement removes a table.

## Basic Syntax

~~~sql
DROP TABLE [IF EXISTS] [workspace].[collection].[table_name];
~~~

## Examples

### Drop a Table
~~~sql
DROP TABLE workspace.collection.staging_data;
~~~

### Drop Multiple Tables
~~~sql
DROP TABLE workspace.collection.table1, workspace.collection.table2;
~~~

### Drop Only If It Exists
~~~sql
DROP TABLE IF EXISTS workspace.collection.staging_data;
~~~

## Notes

- `IF EXISTS` skips the operation without error if the table does not exist.
- Requires the `owner` role on the table, and a connector that supports dropping — not every backend does.
- Dropping a table removes the data it holds; this cannot be undone.
