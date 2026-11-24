---
title: GRAPH_TABLE — Opteryx Reference
description: SQL/PGQ GRAPH_TABLE syntax and examples for matching a graph pattern in the FROM clause of a query in Opteryx
---

# GRAPH_TABLE

`GRAPH_TABLE` matches a pattern against a [property graph](create-property-graph) and
returns one row per match. It is a table in the `FROM` clause, so its result can be
filtered, joined, aggregated, put in a CTE, or kept in a view like any other table.

## Syntax

~~~sql
SELECT ...
FROM GRAPH_TABLE ( <graph_name>
       MATCH <path_pattern> [, ...]
       [ WHERE <condition> ]
       COLUMNS ( <expression> [ AS <column> ] [, ...] ) ) [ [ AS ] <alias> ]
~~~

Where a `<path_pattern>` is a vertex, followed by any number of edge-and-vertex pairs:

~~~sql
( [ <variable> ] [ :<label> ] [ WHERE <condition> ] )
  -[ [ <variable> ] [ :<label> ] [ WHERE <condition> ] ]->  [ { <m> | <m>, <n> } ]
  ( ... )
~~~

An edge can point either way: `-[...]->` follows the edge from source to destination, and
`<-[...]-` follows it from destination to source.

## Parameters

- **`<graph_name>`** — the graph to match against, fully qualified as
  `<workspace>.<collection>.<graph_name>`.
- **`MATCH <path_pattern> [, ...]`** — one or more paths. Paths separated by commas are
  matched together, and a variable used in more than one path refers to the same element.
- **`<variable>`** — a name for a matched vertex or edge, used to read its properties
  (`p.name`) in `WHERE` and `COLUMNS`. Optional.
- **`:<label>`** — the vertex or edge label to match. A vertex without a label takes one
  from an adjacent edge, when the graph makes that unambiguous.
- `WHERE <condition>` — a filter. Inside a vertex's or edge's brackets it applies to that
  element. After the pattern it can refer to any variable.
- **`{ <m> }` / `{ <m>, <n> }`** — after an edge, match a chain of `m` (or `m` to `n`)
  repeats of it, each starting where the last ended. `1 <= m <= n <= 16`.
- **`COLUMNS ( ... )`** — what each row returns: properties (`p.name`), expressions over
  them, or aggregates. An item that is not a plain property needs `AS <column>`. It must
  be the last clause.
- `<alias>` — a name for the result, used to qualify its columns in the rest of the
  statement.

## Examples

The examples use this graph: `Person` vertices, `Team` vertices, `MANAGES` edges between
people, and `MEMBER_OF` edges from a person to a team. See
[CREATE PROPERTY GRAPH](create-property-graph) for its definition.

### Match One Edge
~~~sql
SELECT *
FROM GRAPH_TABLE (acme.hr.org
       MATCH (m:Person)-[:MANAGES]->(r:Person)
       COLUMNS (m.name AS manager, r.name AS report));
~~~

### Aggregate the Matches
~~~sql
SELECT g.manager, COUNT(*) AS reports
FROM GRAPH_TABLE (acme.hr.org
       MATCH (m:Person)-[:MANAGES]->(r:Person)
       COLUMNS (m.name AS manager, r.id AS report_id)) AS g
GROUP BY g.manager
ORDER BY reports DESC;
~~~

### Follow Two Edges, with a Filter
~~~sql
SELECT *
FROM GRAPH_TABLE (acme.hr.org
       MATCH (m:Person)-[:MANAGES]->(r:Person)-[:MEMBER_OF]->(t:Team WHERE t.name = 'Platform')
       COLUMNS (m.name AS manager, r.name AS report));
~~~

### Follow an Edge Backwards
~~~sql
SELECT *
FROM GRAPH_TABLE (acme.hr.org
       MATCH (r:Person)<-[:MANAGES]-(m:Person)
       WHERE r.name = 'Ada'
       COLUMNS (m.name AS manager));
~~~

### Join to a Table
~~~sql
SELECT t.name, COUNT(*) AS members
FROM acme.hr.teams AS t
JOIN GRAPH_TABLE (acme.hr.org
       MATCH (p:Person)-[:MEMBER_OF]->(team:Team)
       COLUMNS (team.id AS team_id)) AS g
  ON g.team_id = t.id
GROUP BY t.name;
~~~

### Up to Three Hops
~~~sql
SELECT manager, COUNT(DISTINCT below) AS people
FROM GRAPH_TABLE (acme.hr.org
       MATCH (m:Person)-[:MANAGES]->{1,3}(r:Person)
       COLUMNS (m.name AS manager, r.id AS below))
GROUP BY manager;
~~~

### Aggregate Inside COLUMNS
~~~sql
SELECT a.people, b.teams
FROM GRAPH_TABLE (acme.hr.org MATCH (p:Person) COLUMNS (COUNT(*) AS people)) AS a
CROSS JOIN GRAPH_TABLE (acme.hr.org MATCH (t:Team) COLUMNS (COUNT(*) AS teams)) AS b;
~~~

### In a CTE
~~~sql
WITH pairs AS (
  SELECT *
  FROM GRAPH_TABLE (acme.hr.org
         MATCH (m:Person)-[:MANAGES]->(r:Person)
         COLUMNS (m.name AS manager, r.name AS report))
)
SELECT COUNT(*) FROM pairs;
~~~

## Notes

- **Same answer as the joins.** A pattern is planned as the joins it stands for: each
  vertex is a scan of its table, and each edge is a join on its `SOURCE` and `DESTINATION`
  keys. It returns the rows the equivalent hand-written SQL returns, and it is optimized
  the same way.
- **Edges can repeat.** A path may use the same edge more than once, and no rule stops two
  variables matching the same element. If you need two variables to be different
  elements, add a `WHERE` that says so.
- **A quantified edge returns every walk.** If two routes reach the same vertex, that is
  two rows. Use `DISTINCT` or `COUNT(DISTINCT ...)` to count vertices. A quantified edge's
  own variable can't be used outside its brackets, and it can only repeat between a vertex
  table and itself (except `{1}`).
- **Permissions.** Requires `READ` on the graph, which is checked before the definition is
  read, and `READ` on every table the pattern reads. A graph grants no access to its
  tables: a pattern that uses an edge whose table you can't read fails with a permission
  error naming that table.
- **Views.** A view that uses `GRAPH_TABLE` reads the graph's current definition each time
  it runs, so `CREATE OR REPLACE PROPERTY GRAPH` affects it. `SHOW CREATE VIEW` shows the
  pattern in its internal form, `GRAPH_TABLE('<graph>', 'MATCH ...')`, which runs the same
  as what you wrote.
- **Errors** in the pattern (an unknown label or property, or an edge written against the
  direction its graph declares) name the graph and the problem, but don't yet point at a
  position in the statement.
- **Not supported yet** (each is refused with an error naming it): abbreviated (`->`) and
  undirected edges, label expressions (`:A|B`), `IS Label` (write `:Label`), property maps
  (`{key: value}`), path variables, `SHORTEST` / `ANY` path modes, unbounded quantifiers
  (`*`, `+`, `{m,}`), `{0,n}`, returning a whole vertex or edge (`COLUMNS (p)`), and any
  clause after `COLUMNS`.
- Needs the [`gqlparser`](https://pypi.org/project/gqlparser/) package, which translates
  the pattern. Without it, `GRAPH_TABLE` is refused by name and nothing else is affected.

## See Also

- [Querying graphs](/docs/guides/querying-graphs)
- [CREATE PROPERTY GRAPH](create-property-graph)
- [GQL](../advanced/adv-gql)
- [Joins](joins)
- [WITH](with)
