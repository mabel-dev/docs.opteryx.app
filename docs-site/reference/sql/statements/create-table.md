---
title: CREATE TABLE Statement — Opteryx Reference
description: SQL CREATE TABLE and CREATE TABLE AS SELECT (CTAS) statement syntax and examples for creating tables in Opteryx
---

# CREATE TABLE

The `CREATE TABLE` statement creates a new table, either with an explicit column list or by materializing the result of a query (`CREATE TABLE ... AS SELECT`, commonly called CTAS). `CREATE OR REPLACE TABLE ... AS SELECT` atomically replaces an existing table's contents with a new query result.

## Basic Syntax

~~~sql
CREATE TABLE [workspace].[collection].[table_name] (
  column1 TYPE,
  column2 TYPE,
  ...
);
~~~

~~~sql
CREATE [OR REPLACE] TABLE [workspace].[collection].[table_name] AS
SELECT ...;
~~~

## Examples

### Create a Table with Explicit Columns
~~~sql
CREATE TABLE my_workspace.my_collection.users (
  id BIGINT,
  name VARCHAR,
  email VARCHAR,
  active BOOLEAN
);
~~~

### Create a Table from a Query (CTAS)
~~~sql
CREATE TABLE my_workspace.my_collection.active_users AS
SELECT id, name, email
  FROM my_workspace.my_collection.users
 WHERE active = TRUE;
~~~

### Create a Table from an External File
~~~sql
CREATE TABLE my_workspace.my_collection.packages AS
SELECT *
  FROM read_parquet('https://example.com/data/packages-*.parquet');
~~~

### Skip Creation if the Table Already Exists
~~~sql
CREATE TABLE IF NOT EXISTS my_workspace.my_collection.active_users AS
SELECT id, name, email
  FROM my_workspace.my_collection.users
 WHERE active = TRUE;
~~~

### Replace an Existing Table's Contents
~~~sql
CREATE OR REPLACE TABLE my_workspace.my_collection.active_users AS
SELECT id, name, email
  FROM my_workspace.my_collection.users
 WHERE active = TRUE AND last_login > '2026-01-01';
~~~

## Notes

- Use fully qualified names: `[workspace].[collection].[table_name]`.
- `CREATE TABLE ... AS SELECT` cannot be combined with an explicit column list — the target's columns are always derived from the query.
- Every selected column must resolve to a concrete type; a column that is entirely `NULL` (with no other type information) is rejected.
- Plain `CREATE TABLE ... AS SELECT` fails if the target table already exists. Use `CREATE TABLE IF NOT EXISTS ... AS SELECT` to skip silently, or `CREATE OR REPLACE TABLE ... AS SELECT` to replace it.
- `CREATE OR REPLACE TABLE ... AS SELECT` creates the table if it doesn't exist yet, or atomically replaces its contents if it does. The replacement is all-or-nothing: if the query fails partway through, the existing table is left completely untouched.
- Replacing an existing table currently requires the new query's columns to match the existing table's columns exactly. Changing the column set with `CREATE OR REPLACE` is not yet supported.
- Creating a new table requires `writer` or `owner` access to the target. Replacing an existing table's contents requires `owner` access — the same requirement as `DROP TABLE`, since it discards the table's previous contents.
