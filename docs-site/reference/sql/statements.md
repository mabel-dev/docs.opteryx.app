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
| [SELECT](statements/select) | Specify columns and expressions to retrieve |
| [WHERE](statements/where) | Filter rows based on conditions |
| [GROUP BY](statements/group-by) | Group rows by one or more columns for aggregation |
| [HAVING](statements/having) | Filter groups after aggregation |
| [ORDER BY](statements/order-by) | Sort results by one or more columns |
| [LIMIT / OFFSET](statements/limit) | Paginate results |
| [WITH (CTE)](statements/with) | Define named subqueries (Common Table Expressions) |
| [DISTINCT](statements/distinct) | Remove duplicate rows from results |

## Set Operations

Combine results from multiple queries:

| Operation | Purpose |
|-----------|---------|
| [UNION / INTERSECT / EXCEPT](statements/union) | Combine, intersect, or find differences between result sets |

## Data Modification

Statements for adding and changing data, and row-level statements Opteryx does not yet support:

| Statement | Purpose |
|-----------|---------|
| [INSERT](statements/insert) | Add new rows to a table |
| [MERGE](statements/merge) | Apply a set of changes — update, insert and delete — in one atomic statement |
| [UPDATE](statements/update) | *Not supported* — see the page for a working alternative |
| [DELETE](statements/delete) | *Not supported* — see the page for a working alternative |

## Query Analysis

Understand and optimize query execution:

| Statement | Purpose |
|-----------|---------|
| [EXPLAIN](statements/explain) | Display query plans and execution metrics |

## Introspection

Inspect schemas, definitions, session state, and dataset metadata:

| Statement | Purpose |
|-----------|---------|
| [SHOW COLUMNS](statements/show-columns) | List a dataset's columns, types, and nullability |
| [SHOW CREATE VIEW](statements/show-create) | Show the query a view was created from |
| [SHOW MANIFEST FOR](statements/show-manifest) | Inspect a dataset's file-level manifest and per-file statistics |
| [SHOW SNAPSHOTS FOR](statements/show-snapshots) | List a table's commit history, newest first |
| [SHOW TRIGGERS FOR](statements/show-triggers) | List the refresh triggers attached to a table |
| [SHOW VARIABLES](statements/show-variables) | List session and system variables |
| [SHOW USER](statements/show-user) | Show the current connection's identity |
| [SHOW GRANTS](statements/show-grants) | List the access policies the current connection holds |

## Session State

| Statement | Purpose |
|-----------|---------|
| [SET](statements/set) | Assign a session or system variable |

## View Management

Create and manage views:

| Statement | Purpose |
|-----------|---------|
| [CREATE VIEW](statements/create-view) | Create a new named view |
| [ALTER VIEW](statements/alter-view) | Modify an existing view definition |
| [DROP VIEW](statements/drop-view) | Remove a view |

## Materialized Views & Triggers

Materialized views store a query's result as a physical table and refresh it automatically when a source table changes:

| Statement | Purpose |
|-----------|---------|
| [CREATE MATERIALIZED VIEW](statements/create-materialized-view) | Materialize a query as a self-refreshing table |
| [DROP MATERIALIZED VIEW](statements/drop-materialized-view) | Remove a materialized view and its refresh triggers |
| [REFRESH MATERIALIZED VIEW](statements/refresh-materialized-view) | Rebuild a materialized view from its defining SELECT |
| [DROP TRIGGER](statements/drop-trigger) | Remove one refresh trigger from a table |
| [SHOW TRIGGERS FOR](statements/show-triggers) | List the refresh triggers attached to a table |

There is no `CREATE TRIGGER` — triggers only come into existence through `CREATE MATERIALIZED VIEW`.

## Workspace Management

Manage workspaces - the top level of the naming hierarchy:

| Statement | Purpose |
|-----------|---------|
| [ALTER WORKSPACE](statements/alter-workspace) | Set a workspace property, such as `deletion_protection` |

Workspaces themselves are created and deleted through the platform, not through SQL.

## Collection Management

Manage collections - the layer between a workspace and its tables/views:

| Statement | Purpose |
|-----------|---------|
| [CREATE COLLECTION](statements/create-collection) | Create a collection |
| [DROP COLLECTION](statements/drop-collection) | Remove an empty collection |

Creating a collection is optional — one comes into existence anyway with the first table or view placed in it.

## Table Management

Manage tables, table properties, and statistics:

| Statement | Purpose |
|-----------|---------|
| [CREATE TABLE](statements/create-table) | Create a table, or materialize a query as a new or replaced table |
| [ALTER TABLE](statements/alter-table) | Add, drop, rename or widen a column; set a table's clustering columns; rename/move a table |
| [DROP TABLE](statements/drop-table) | Remove a table |
| [TRUNCATE TABLE](statements/truncate-table) | Remove all rows from a table |
| [ANALYZE TABLE](statements/analyze-table) | Collect statistics for query optimization |
| [DROP STATISTICS](statements/drop-statistics) | Discard statistics collected by `ANALYZE TABLE` |
| [COMMENT](statements/comment) | Add descriptive comments to tables and views |

## Advanced Features

Special clauses and time-based queries:

| Feature | Purpose |
|---------|---------|
| [AT (Time Travel)](statements/timestamp-as-of) | Query data as it existed at a specific point in time |

## JOIN Operations

For detailed information on joining tables, see the [Joins](statements/joins) reference page.



... (truncated)
