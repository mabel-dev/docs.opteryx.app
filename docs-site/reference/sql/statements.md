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

Statements for inserting, updating, and deleting data:

| Statement | Purpose |
|-----------|---------|
| [INSERT](statements/insert.md) | Add new rows to a table |
| [UPDATE](statements/update.md) | Modify existing rows |
| [DELETE](statements/delete.md) | Remove rows from a table |

## Query Analysis

Understand and optimize query execution:

| Statement | Purpose |
|-----------|---------|
| [EXPLAIN](statements/explain.md) | Display query plans and execution metrics |

## View Management

Create and manage views:

| Statement | Purpose |
|-----------|---------|
| [CREATE VIEW](statements/create-view.md) | Create a new named view |
| [ALTER VIEW](statements/alter-view.md) | Modify an existing view definition |
| [DROP VIEW](statements/drop-view.md) | Remove a view |

## Table Management

Manage table properties and statistics:

| Statement | Purpose |
|-----------|---------|
| [ANALYZE TABLE](statements/analyze-table.md) | Collect statistics for query optimization |
| [COMMENT](statements/comment.md) | Add descriptive comments to tables and views |

## Advanced Features

Special clauses and time-based queries:

| Feature | Purpose |
|---------|---------|
| [AT (Time Travel)](statements/at.md) | Query data as it existed at a specific point in time |

## JOIN Operations

For detailed information on joining tables, see the [Joins](../joins.md) reference page.



... (truncated)
