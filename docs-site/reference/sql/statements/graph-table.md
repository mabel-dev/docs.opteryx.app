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

The examples use `public.geopolitics.borders`, a graph of the world's land borders in the
public workspace, so you can run them as they are. It has `Country` vertices, with
properties `iso_alpha3`, `name`, `capital`, `region`, `subregion` and `area_km2`, and
`BORDERS` edges from each country to each of its neighbours. See
[CREATE PROPERTY GRAPH](create-property-graph) for its definition.

### Match One Edge
~~~sql
SELECT *
FROM GRAPH_TABLE (public.geopolitics.borders
       MATCH (a:Country)-[:BORDERS]->(b:Country)
       WHERE a.name = 'France'
       COLUMNS (b.name AS neighbour))
ORDER BY neighbour;
~~~

| neighbour |
|---|
| Andorra |
| Belgium |
| Germany |
| Italy |
| Luxembourg |
| Monaco |
| Spain |
| Switzerland |

### Aggregate the Matches
~~~sql
SELECT g.country, COUNT(*) AS neighbours
FROM GRAPH_TABLE (public.geopolitics.borders
       MATCH (a:Country)-[:BORDERS]->(b:Country)
       COLUMNS (a.name AS country, b.iso_alpha3 AS neighbour)) AS g
GROUP BY g.country
ORDER BY neighbours DESC, g.country
LIMIT 5;
~~~

| country | neighbours |
|---|---|
| China | 16 |
| Russia | 14 |
| Brazil | 10 |
| DR Congo | 9 |
| Germany | 9 |

### Filter Inside the Pattern
A `WHERE` inside a vertex's brackets filters that vertex. These are the borders between
Europe and Asia:
~~~sql
SELECT *
FROM GRAPH_TABLE (public.geopolitics.borders
       MATCH (a:Country WHERE a.region = 'Europe')-[:BORDERS]->(b:Country WHERE b.region = 'Asia')
       COLUMNS (a.name AS european, b.name AS asian))
ORDER BY european, asian;
~~~

| european | asian |
|---|---|
| Bulgaria | Türkiye |
| Greece | Türkiye |
| Russia | Azerbaijan |
| Russia | China |
| Russia | Georgia |
| Russia | Kazakhstan |
| Russia | Mongolia |
| Russia | North Korea |

### Follow Two Edges
~~~sql
SELECT *
FROM GRAPH_TABLE (public.geopolitics.borders
       MATCH (a:Country WHERE a.name = 'Portugal')-[:BORDERS]->(via:Country)-[:BORDERS]->(b:Country WHERE b.region = 'Africa')
       COLUMNS (via.name AS through, b.name AS reached));
~~~

| through | reached |
|---|---|
| Spain | Morocco |

### Follow an Edge Backwards
`<-[...]-` follows an edge from its destination to its source. This finds the countries
that list India as a neighbour:
~~~sql
SELECT *
FROM GRAPH_TABLE (public.geopolitics.borders
       MATCH (a:Country)<-[:BORDERS]-(b:Country)
       WHERE a.name = 'India'
       COLUMNS (b.name AS lists_india))
ORDER BY lists_india;
~~~

| lists_india |
|---|
| Bangladesh |
| Bhutan |
| China |
| Myanmar |
| Nepal |
| Pakistan |
| Sri Lanka |

Written forwards, as India's own neighbours, the same query returns six rows: Sri Lanka
lists India, but India doesn't list Sri Lanka. Patterns follow edges the way they're
stored.

### Join to a Table
~~~sql
SELECT c.country_name_common AS country, COUNT(*) AS neighbours
FROM public.geopolitics.countries AS c
JOIN GRAPH_TABLE (public.geopolitics.borders
       MATCH (a:Country)-[:BORDERS]->(b:Country)
       COLUMNS (a.iso_alpha3 AS code)) AS g
  ON g.code = c.iso_alpha3
WHERE c.landlocked = TRUE
GROUP BY c.country_name_common
ORDER BY neighbours DESC, country
LIMIT 5;
~~~

| country | neighbours |
|---|---|
| Austria | 8 |
| Serbia | 8 |
| Zambia | 8 |
| Hungary | 7 |
| Mali | 7 |

### Exactly Two Hops
~~~sql
SELECT DISTINCT reached
FROM GRAPH_TABLE (public.geopolitics.borders
       MATCH (a:Country WHERE a.name = 'Portugal')-[:BORDERS]->{2}(b:Country)
       COLUMNS (b.name AS reached))
ORDER BY reached;
~~~

| reached |
|---|
| Andorra |
| France |
| Gibraltar |
| Morocco |
| Portugal |

Portugal is in the list because Portugal to Spain and back is a two-hop walk.

### Up to Three Hops
~~~sql
SELECT COUNT(*) AS walks, COUNT(DISTINCT reached) AS countries
FROM GRAPH_TABLE (public.geopolitics.borders
       MATCH (a:Country WHERE a.name = 'Germany')-[:BORDERS]->{1,3}(b:Country)
       COLUMNS (b.name AS reached));
~~~

| walks | countries |
|---|---|
| 303 | 41 |

### Aggregate Inside COLUMNS
~~~sql
SELECT a.countries, b.borders
FROM GRAPH_TABLE (public.geopolitics.borders
       MATCH (c:Country) COLUMNS (COUNT(*) AS countries)) AS a
CROSS JOIN GRAPH_TABLE (public.geopolitics.borders
       MATCH (x:Country)-[:BORDERS]->(y:Country) COLUMNS (COUNT(*) AS borders)) AS b;
~~~

| countries | borders |
|---|---|
| 250 | 649 |

### In a CTE
~~~sql
WITH crossings AS (
  SELECT *
  FROM GRAPH_TABLE (public.geopolitics.borders
         MATCH (a:Country)-[:BORDERS]->(b:Country)
         WHERE a.region <> b.region
         COLUMNS (a.region AS from_region, b.region AS to_region))
)
SELECT from_region, to_region, COUNT(*) AS borders
FROM crossings
GROUP BY from_region, to_region
ORDER BY borders DESC, from_region, to_region;
~~~

| from_region | to_region | borders |
|---|---|---|
| Asia | Europe | 8 |
| Europe | Asia | 8 |
| Africa | Asia | 2 |
| Asia | Africa | 2 |
| Africa | Europe | 1 |
| Asia | Oceania | 1 |
| Europe | Africa | 1 |
| Oceania | Asia | 1 |

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
