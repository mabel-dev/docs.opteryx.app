---
title: SHOW COLUMNS Statement — Opteryx Reference
description: SQL SHOW COLUMNS statement syntax and examples for inspecting a dataset's schema in Opteryx
---

# SHOW COLUMNS

The `SHOW COLUMNS` statement lists the columns of a dataset, along with each column's type and nullability.

## Basic Syntax

~~~sql
SHOW COLUMNS FROM [workspace].[collection].[table_name];
~~~

## Examples

### List a Table's Columns
~~~sql
SHOW COLUMNS FROM workspace.collection.orders;
~~~

### List Columns of a Virtual Dataset
~~~sql
SHOW COLUMNS FROM $planets;
~~~

## Result Columns

| Column | Description |
|--------|-------------|
| `name` | Column name |
| `type` | Column's data type |
| `nullable` | Whether the column can contain `NULL` |
| `aliases` | Alternative names the column is also known by |

## Notes

- `SHOW FULL COLUMNS FROM ...` and `SHOW EXTENDED COLUMNS FROM ...` are accepted but currently return the same result as the bare form — the extended output is not yet implemented.
- Use the fully qualified name: `[workspace].[collection].[table_name]`.
