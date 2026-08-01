---
title: SHOW CREATE VIEW Statement — Opteryx Reference
description: SQL SHOW CREATE VIEW statement syntax and examples for inspecting a view's definition in Opteryx
---

# SHOW CREATE VIEW

The `SHOW CREATE VIEW` statement returns the query a view was created from.

## Basic Syntax

~~~sql
SHOW CREATE VIEW [workspace].[collection].[view_name];
~~~

## Examples

### View a Definition
~~~sql
SHOW CREATE VIEW workspace.collection.active_customers;
~~~

## Result Columns

The result has one row and two columns: the fully qualified view name (used
as the column name itself) holding the view name again, and
`create_statement`, holding the `SELECT` the view was defined with.

## Notes

- Only views are supported — `SHOW CREATE TABLE` is not implemented.
- Raises an error if the named view does not exist.
