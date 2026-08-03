---
title: EXPLAIN Statement — Opteryx Reference
description: SQL EXPLAIN statement syntax and examples for query planning and analysis in Opteryx
---

# EXPLAIN

The `EXPLAIN` statement displays the logical query plan. The `EXPLAIN ANALYZE` variant executes the query and shows runtime metrics.

## Basic Syntax

~~~sql
EXPLAIN [ ANALYZE [ FORMAT format ] ] statement;
~~~

## Display Query Plan

Show the logical plan for a query without executing it:

~~~sql
EXPLAIN SELECT * FROM orders WHERE id = 1;
~~~

## EXPLAIN ANALYZE

Execute the query and display both the plan and runtime metrics:

~~~sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE id = 1;
~~~

## Output Formats

By default, `EXPLAIN` produces tabular output (equivalent to `FORMAT TEXT`). The `FORMAT` clause works with or without `ANALYZE`.

`TEXT` and `MERMAID` are the only supported formats — `FORMAT GRAPHVIZ` and `FORMAT JSON` are rejected rather than quietly answered in a different format.

### MERMAID
Generate a Mermaid diagram of the query plan:

~~~sql
EXPLAIN ANALYZE FORMAT MERMAID SELECT * FROM orders;
~~~

## Examples

### Analyzing a Simple Query
~~~sql
EXPLAIN ANALYZE SELECT id, name FROM users WHERE active = TRUE;
~~~

### Analyzing a Complex Join
~~~sql
EXPLAIN ANALYZE
SELECT o.id, c.name, o.amount
  FROM orders o
  JOIN customers c ON o.customer_id = c.id
 WHERE o.created_at > '2024-01-01'
 ORDER BY o.amount DESC
 LIMIT 10;
~~~

## Notes

- Default `EXPLAIN` output is tabular and does not execute the query.
- `EXPLAIN ANALYZE` executes the query, so use with caution on large datasets.
- `FORMAT MERMAID` produces diagram output suitable for visualization, with or without `ANALYZE`.
- Output format may change across versions and is not intended for machine parsing.
- Use `EXPLAIN` to understand query plans and identify potential optimizations.
