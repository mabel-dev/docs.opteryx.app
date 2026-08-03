---
title: SQL Statements — Opteryx Reference
description: Complete SQL statements reference for Opteryx, covering SELECT, WHERE, GROUP BY, ORDER BY, LIMIT, and more.
---

# Statements

This section covers SQL statements and clauses supported by Opteryx. Click on any topic below for detailed syntax, examples, and usage notes.

## Query Clauses

The following clauses are used to construct SQL queries for retrieving and transforming data:

| Clause | Purpose |
|--------|---------|
| [SELECT](statements/select.md) | Specify columns and expressions to retrieve |
| [WHERE](statements/where.md) | Filter rows based on conditions |
| [GROUP BY](statements/group-by.md) | Group rows by one or more columns for aggregation |
| [HAVING](statements/having.md) | Filter groups after aggregation |
| [ORDER BY](statements/order-by.md) | Sort results by one or more columns |
| [LIMIT / OFFSET](statements/limit.md) | Paginate results |
| [WITH (CTE)](statements/with.md) | Define named subqueries (Common Table Expressions) |
| [DISTINCT](statements/distinct.md) | Remove duplicate rows from results |

## Set Operations

Combine results from multiple queries:

| Operation | Purpose |
|-----------|---------|
| [UNION / INTERSECT / EXCEPT](statements/union.md) | Combine, intersect, or find differences between result sets |

## Data Modification

Statements for inserting data, and row-level statements Opteryx does not yet support:

| Statement | Purpose |
|-----------|---------|
| [INSERT](statements/insert.md) | Add new rows to a table |
| [UPDATE](statements/update.md) | *Not supported* — see the page for a working alternative |
| [DELETE](statements/delete.md) | *Not supported* — see the page for a working alternative |

## Query Analysis

Understand and optimize query execution:

| Statement | Purpose |
|-----------|---------|
| [EXPLAIN](statements/explain.md) | Display query plans and execution metrics |

## Introspection

Inspect schemas, definitions, session state, and dataset metadata:

| Statement | Purpose |
|-----------|---------|
| [SHOW COLUMNS](statements/show-columns.md) | List a dataset's columns, types, and nullability |
| [SHOW CREATE VIEW](statements/show-create.md) | Show the query a view was created from |
| [SHOW MANIFEST FOR](statements/show-manifest.md) | Inspect a dataset's file-level manifest and per-file statistics |
| [SHOW VARIABLES](statements/show-variables.md) | List session and system variables |
| [SHOW USER](statements/show-user.md) | Show the current connection's identity |

## Session State

| Statement | Purpose |
|-----------|---------|
| [SET](statements/set.md) | Assign a session or system variable |

## View Management

Create and manage views:

| Statement | Purpose |
|-----------|---------|
| [CREATE VIEW](statements/create-view.md) | Create a new named view |
| [ALTER VIEW](statements/alter-view.md) | Modify an existing view definition |
| [DROP VIEW](statements/drop-view.md) | Remove a view |

## Workspace Management

Manage workspaces - the top level of the naming hierarchy:

| Statement | Purpose |
|-----------|---------|
| [ALTER WORKSPACE](statements/alter-workspace.md) | Set a workspace property, such as `delete_protection` |

Workspaces themselves are created and deleted through the platform, not through SQL.

## Collection Management

Manage collections - the layer between a workspace and its tables/views:

| Statement | Purpose |
|-----------|---------|
| [DROP COLLECTION](statements/drop-collection.md) | Remove an empty collection |

Collections are created implicitly by the first table or view placed in them; there is no `CREATE COLLECTION` statement.

## Table Management

Manage tables, table properties, and statistics:

| Statement | Purpose |
|-----------|---------|
| [CREATE TABLE](statements/create-table.md) | Create a table, or materialize a query as a new or replaced table |
| [ALTER TABLE](statements/alter-table.md) | Set a table's clustering columns, or rename/move a table |
| [DROP TABLE](statements/drop-table.md) | Remove a table |
| [TRUNCATE TABLE](statements/truncate-table.md) | Remove all rows from a table |
| [ANALYZE TABLE](statements/analyze-table.md) | Collect statistics for query optimization |
| [DROP STATISTICS](statements/drop-statistics.md) | Discard statistics collected by `ANALYZE TABLE` |
| [COMMENT](statements/comment.md) | Add descriptive comments to tables and views |

## Advanced Features

Special clauses and time-based queries:

| Feature | Purpose |
|---------|---------|
| [AT (Time Travel)](statements/timestamp-as-of.md) | Query data as it existed at a specific point in time |

## JOIN Operations

For detailed information on joining tables, see the [Joins](statements/joins.md) reference page.



... (truncated)
