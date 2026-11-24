---
title: DROP PROPERTY GRAPH Statement — Opteryx Reference
description: SQL/PGQ DROP PROPERTY GRAPH syntax and examples for removing a property graph definition in Opteryx
---

# DROP PROPERTY GRAPH

The `DROP PROPERTY GRAPH` statement removes a property graph's definition. The tables the graph names, and their data, are not touched.

## Syntax

~~~sql
DROP PROPERTY GRAPH [ IF EXISTS ] <graph_name>;
~~~

## Parameters

- **`<graph_name>`** — fully qualified as `<workspace>.<collection>.<graph_name>`.
- `IF EXISTS` — do nothing, without an error, if no graph has this name.

## Examples

### Drop a Graph
~~~sql
DROP PROPERTY GRAPH acme.hr.org;
~~~

### Only If It Exists
~~~sql
DROP PROPERTY GRAPH IF EXISTS acme.hr.org;
~~~

## Notes

- Requires `WRITE` on the graph, the same tier as [DROP VIEW](drop-view). A graph is only
  its definition, and [CREATE PROPERTY GRAPH](create-property-graph) can always put it back.
- Views and saved queries that use the graph in a [GRAPH_TABLE](graph-table) fail the next
  time they run, with an error naming the missing graph.
- Drops one graph per statement. `CASCADE` and `RESTRICT` are refused: nothing depends on a
  graph in a way that they would change.
- Raises an error if the graph does not exist and `IF EXISTS` is not given.

## See Also

- [CREATE PROPERTY GRAPH](create-property-graph)
- [SHOW CREATE](show-create)
- [Querying graphs](/docs/guides/querying-graphs)
