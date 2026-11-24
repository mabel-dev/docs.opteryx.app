---
title: Querying Graphs - Property Graphs, GRAPH_TABLE and GQL
description: How to query the relationships in your tables as a graph in Opteryx. Define a property graph over tables you already have, then ask path questions with GRAPH_TABLE inside SQL, or with GQL through the Jobs API.
---

# Querying Graphs

Some questions are about how rows are connected rather than about the rows themselves. Which countries can you reach in three border crossings? Which services run as an account that can impersonate other accounts? Which suppliers are two steps away from a customer? You can write these as SQL joins, but the joins hide the question. Each hop adds a join and two key columns, and the path you meant gets lost among them.

Opteryx lets you name the connections once, as a **property graph**, and then ask path questions directly. This query finds the countries with the most neighbours:

~~~sql
SELECT country, COUNT(*) AS neighbours
FROM GRAPH_TABLE (public.geopolitics.borders
       MATCH (a:Country)-[:BORDERS]->(b:Country)
       COLUMNS (a.name AS country, b.iso_alpha3 AS neighbour))
GROUP BY country
ORDER BY neighbours DESC, country
LIMIT 5;
~~~

| country | neighbours |
|---|---|
| China | 16 |
| Russia | 14 |
| Brazil | 10 |
| DR Congo | 9 |
| Germany | 9 |

Every example on this page runs against `public.geopolitics.borders`, a graph of the world's land borders in the public workspace. Sign in to [opteryx.app](https://opteryx.app) and you can run them as they are.

A property graph holds no data of its own. Its vertices and edges are the rows of tables you already have, so there is nothing to load, sync or keep up to date. A query over the graph reads those tables, and gets the same rows that the equivalent hand-written joins would.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- describe a property graph as a set of vertex tables and edge tables over existing data
- define one with `CREATE PROPERTY GRAPH`, and read it back
- query it with `GRAPH_TABLE` inside SQL, and combine the result with joins, aggregates, CTEs and views
- submit a query written in GQL, the ISO graph query language
- follow paths of more than one hop with bounded quantified edges
- say what a graph does and does not grant access to

## The Model

A property graph has two kinds of element:

- A **vertex table** is a table whose rows are things: countries, people, services, accounts. It has a `KEY` that identifies each vertex and a `LABEL` you use in patterns (`Country`).
- An **edge table** is a table whose rows are connections. Each edge has a **source** and a **destination**, given as key columns that reference a vertex table, and a `LABEL` of its own (`BORDERS`).

Each element exposes the columns you list as **properties**, which patterns read as `a.name`.

Edge tables are often join tables, such as `memberships (person_id, team_id)` between people and teams. The same table can also play more than one part: a `people` table with a `manager_id` column is a vertex table (each row is a person) and also an edge table (each row with a manager is an edge from the manager to the person). An edge table can be a view, too, which is how the borders graph gets its edges.

## Defining a Graph

`public.geopolitics.countries` has one row per country, keyed by its three-letter ISO code. Each country's neighbours are in a `borders` column as a comma-separated list of those codes. Afghanistan's is `IRN,PAK,TKM,UZB,TJK,CHN`.

That list isn't something an edge can reference, so a view turns it into one row per border, from a country to one neighbour:

~~~sql
CREATE VIEW public.geopolitics.country_borders AS
SELECT iso_alpha3 AS country, neighbour
FROM public.geopolitics.countries
CROSS JOIN UNNEST(SPLIT(borders, ',')) AS neighbour;
~~~

The graph then has one vertex label over the countries and one edge label over the view:

~~~sql
CREATE PROPERTY GRAPH public.geopolitics.borders
  VERTEX TABLES (
    public.geopolitics.countries AS countries KEY (iso_alpha3) LABEL Country
      PROPERTIES (iso_alpha3, country_name_common AS name, capital, region, subregion, area_km2)
  )
  EDGE TABLES (
    public.geopolitics.country_borders AS borders KEY (country, neighbour)
      SOURCE      KEY (country)   REFERENCES countries (iso_alpha3)
      DESTINATION KEY (neighbour) REFERENCES countries (iso_alpha3)
      LABEL BORDERS NO PROPERTIES
  );
~~~

Both already exist in the public workspace, so you don't need to run these to try the examples. To define a graph of your own, use a workspace you can write to.

A border runs both ways, so each one is two edges: France to Spain, and Spain to France. The data has one exception: Sri Lanka lists India as a neighbour, but India doesn't list Sri Lanka. A pattern follows edges in the direction they're stored, so a query starting from Sri Lanka finds India, but not the other way round.

When the graph is created, Opteryx checks the definition against the tables. Every table must exist and be readable by you. Every key, endpoint and property column must exist. Every `REFERENCES` must name a vertex table in this graph, and labels must be unique. A mistake is reported when you create the graph, not later when someone queries it.

What gets stored is the definition with everything written out: `PROPERTIES ALL COLUMNS` becomes the column list, and an endpoint that came from a foreign key is spelled out in full. `SHOW CREATE PROPERTY GRAPH` returns exactly that text:

~~~sql
SHOW CREATE PROPERTY GRAPH public.geopolitics.borders;
~~~

~~~sql
CREATE PROPERTY GRAPH public.geopolitics.borders
  VERTEX TABLES (
    public.geopolitics.countries AS countries KEY (iso_alpha3)
      LABEL Country PROPERTIES (iso_alpha3, country_name_common AS name, capital, region, subregion, area_km2)
  )
  EDGE TABLES (
    public.geopolitics.country_borders AS borders KEY (country, neighbour)
      SOURCE KEY (country) REFERENCES countries (iso_alpha3)
      DESTINATION KEY (neighbour) REFERENCES countries (iso_alpha3)
      LABEL BORDERS NO PROPERTIES
  );
~~~

You only need `READ` on a graph to see its definition. It's how you find the labels and properties to write patterns with.

A graph's name shares the namespace with tables and views. You can't create a graph called `public.geopolitics.countries` while that table exists, and you can't create a table or view with a graph's name.

See [CREATE PROPERTY GRAPH](/docs/reference/sql/statements/create-property-graph) for the full syntax and every rule.

### Seeing a Graph's Shape

On [opteryx.app](https://opteryx.app), reading a graph's own name returns its **structure**: one row per vertex table and per edge table, with its label, key, properties and endpoints. It never returns the contents of those tables.

~~~sql
SELECT element_kind, element_name, label, table_name
FROM public.geopolitics.borders;
~~~

| element_kind | element_name | label | table_name |
|---|---|---|---|
| vertex | countries | Country | public.geopolitics.countries |
| edge | borders | BORDERS | public.geopolitics.country_borders |

The Studio uses these rows to draw the graph as a diagram in the dataset browser. The SQL editor uses them to suggest labels and properties while you write a `GRAPH_TABLE` pattern.

## Querying with GRAPH_TABLE

`GRAPH_TABLE` is a table you put in a `FROM` clause. It takes a graph, a `MATCH` pattern and a `COLUMNS` list, and it produces an ordinary result that the rest of the statement can use:

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

The pattern reads left to right:
- `(a:Country)` is a vertex with the label `Country`, named `a`.
- `-[:BORDERS]->` is an edge with the label `BORDERS`, followed from source to destination.
- `(b:Country)` is the vertex at the other end.

Each match is one row. `WHERE` filters the matches, and `COLUMNS` says what each row holds.

Because it is a table, everything else in SQL works around it.

**Aggregate over it.** A filter can also go inside a vertex's brackets. These are the European countries with the most neighbours:
~~~sql
SELECT g.country, COUNT(*) AS neighbours
FROM GRAPH_TABLE (public.geopolitics.borders
       MATCH (a:Country WHERE a.region = 'Europe')-[:BORDERS]->(b:Country)
       COLUMNS (a.name AS country, b.iso_alpha3 AS neighbour)) AS g
GROUP BY g.country
ORDER BY neighbours DESC, g.country
LIMIT 5;
~~~

| country | neighbours |
|---|---|
| Russia | 14 |
| Germany | 9 |
| Austria | 8 |
| France | 8 |
| Serbia | 8 |

**Join it to a table.** `landlocked` isn't one of the graph's properties, but it is a column of `countries`, so join to it. These are the landlocked countries with the most neighbours:
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

**Follow more than one edge.** Which country do you cross to get from Spain to Germany?
~~~sql
SELECT *
FROM GRAPH_TABLE (public.geopolitics.borders
       MATCH (a:Country)-[:BORDERS]->(via:Country)-[:BORDERS]->(b:Country)
       WHERE a.name = 'Spain' AND b.name = 'Germany'
       COLUMNS (via.name AS through));
~~~

| through |
|---|
| France |

**Keep it as a view.** Views go in a workspace you can write to, so replace `my_workspace.my_collection` with your own:
~~~sql
CREATE VIEW my_workspace.my_collection.borders_within_region AS
SELECT region, COUNT(*) AS borders
FROM GRAPH_TABLE (public.geopolitics.borders
       MATCH (a:Country)-[:BORDERS]->(b:Country)
       WHERE a.region = b.region
       COLUMNS (a.region AS region, b.iso_alpha3 AS neighbour))
GROUP BY region;
~~~

A view over a graph is planned again on every read, like any view. If the graph is later redefined with `CREATE OR REPLACE`, the view uses the new definition.

See [GRAPH_TABLE](/docs/reference/sql/statements/graph-table) for the full syntax.

## Paths of More Than One Hop

An edge followed by `{m,n}` matches a chain of `m` to `n` repeats of that edge. Each repeat starts at the vertex where the last one ended. This query finds the countries you can reach from Germany in up to three border crossings:

~~~sql
SELECT COUNT(*) AS walks, COUNT(DISTINCT reached) AS countries
FROM GRAPH_TABLE (public.geopolitics.borders
       MATCH (a:Country WHERE a.name = 'Germany')-[:BORDERS]->{1,3}(b:Country)
       COLUMNS (b.name AS reached));
~~~

| walks | countries |
|---|---|
| 303 | 41 |

`{2}` is exactly two hops. `{1,3}` is one, two or three. Some things to know:

- **Every walk is a row.** If two different routes reach the same country, that is two rows, so `COUNT(*)` counts walks. Use `COUNT(DISTINCT ...)` to count countries.
- **A walk can come back.** Germany to France and back to Germany is a two-hop walk, so Germany is one of the 41. Add `WHERE b.name <> 'Germany'` to the end vertex to leave it out, and the count is 40.
- **Bounds are 1 to 16.** `{0,n}` (which would include the start vertex itself), and open-ended `*`, `+` and `{m,}`, are refused. Unbounded paths need a dedicated path operator in the engine, which does not exist yet.
- **A quantified edge has to start and end on the same vertex table**, because each repeat has to continue from where the last one ended. `{1}` is the exception.
- A `WHERE` inside the edge's brackets applies to every repeat.

## Querying with GQL

`GRAPH_TABLE` puts a graph pattern inside SQL. You can also write the whole query in **GQL** ([ISO/IEC 39075](https://www.iso.org/standard/76120.html)), the ISO graph query language. GQL is not GraphQL, and it is not Cypher, although its patterns look like Cypher's.

These are the African countries with the most neighbours:

~~~
USE public.geopolitics.borders
MATCH (a:Country)-[:BORDERS]->(b:Country)
WHERE a.region = 'Africa'
RETURN a.name AS country, COUNT(*) AS neighbours
GROUP BY country
ORDER BY neighbours DESC, country
LIMIT 5
~~~

| country | neighbours |
|---|---|
| DR Congo | 9 |
| Tanzania | 8 |
| Zambia | 8 |
| Algeria | 7 |
| Mali | 7 |

A GQL query starts with `USE` and the graph's full name, and ends with `RETURN` in place of `COLUMNS`.

On opteryx.app, submit it through the [Jobs API](/docs/reference/api/jobs-api) with `"language": "gql"`:

~~~json
{
  "sql_text": "USE public.geopolitics.borders MATCH (a:Country)-[:BORDERS]->(b:Country) WHERE a.name = 'France' RETURN b.name AS neighbour ORDER BY neighbour",
  "language": "gql"
}
~~~

The query is translated to SQL when you submit it, and that SQL is what runs, is permission-checked and is billed. The job keeps both versions: `source_text` is the GQL you wrote, and `sql_text` is the SQL it ran as. For the query above, `sql_text` is:

~~~sql
SELECT "b".country_name_common AS "neighbour"
FROM public.geopolitics.countries AS "a"
INNER JOIN public.geopolitics.country_borders AS "$e1" ON "$e1".country = "a".iso_alpha3
INNER JOIN public.geopolitics.countries AS "b" ON "$e1".neighbour = "b".iso_alpha3
WHERE "a".country_name_common = 'France'
ORDER BY "neighbour"
~~~

(It comes back on one line. It's split here to read.) Each vertex is a scan of its table, and the edge is the join between them.

In an embedded engine, the [`gqlparser`](https://pypi.org/project/gqlparser/) package does the same translation in your own code. See [GQL](/docs/reference/sql/advanced/adv-gql) for the parts of GQL that are supported.

### GRAPH_TABLE or GQL?

They use the same pattern language and produce the same SQL underneath. Choose by where the rest of your question lives:

- **Use `GRAPH_TABLE`** when the graph is part of a bigger question: you join the matches to other tables, put them in a CTE or a view, or the query is going into something that only speaks SQL.
- **Use GQL** when the whole question is about the graph, or when the query comes from a tool or a person that already writes GQL.

## Access and Permissions

A graph is a definition, like a view, so it is governed the same way:

| To | You need |
|---|---|
| Create, replace or drop a graph | `WRITE` on the graph's name, and `READ` on every table it names (checked at create) |
| Read its definition (`SHOW CREATE PROPERTY GRAPH`, or its structure) | `READ` on the graph |
| Query it (`GRAPH_TABLE` or GQL) | `READ` on the graph **and** `READ` on every table the query reads |

**A graph grants no access to its tables.** If you could read the borders graph but not `public.geopolitics.country_borders`, any pattern that uses a `BORDERS` edge would fail with a permission error naming that view. Patterns that don't use it still work. Access to the graph is checked before its definition is read, so a caller without access can't use pattern errors to find out what labels a graph has.

See [Access and permissions](/docs/core-concepts/access-and-permissions).

## Performance

A pattern is planned as the joins it stands for, so it gets the same optimizer as the equivalent hand-written SQL: filter pushdown, join ordering, and pruning of columns you didn't ask for. A few things are worth knowing:

- **Filter in the pattern.** A `WHERE` on a vertex is pushed down to that vertex's table, the same way a `WHERE` on a joined table is.
- **Each hop is a join.** `{1,16}` is sixteen chains, from one join up to sixteen, combined with `UNION ALL`. Wide bounds over large edge tables are expensive. Use the smallest upper bound that answers the question.
- **A table is read once for each place it appears.** In `(a:Country)-[:BORDERS]->(b:Country)`, `countries` is scanned for `a` and again for `b`, as the SQL in the GQL section shows. A table that is both a vertex and an edge table, such as a `people` table with a `manager_id` column, is read for each part too. The optimizer doesn't share those scans yet.

## Current Limits

Graph querying is new, and the supported subset is growing. Anything outside it is refused with an error that names the construct. It is never approximated. At the moment:

- **Patterns:** edges must be written in full with a direction (`-[:L]->` or `<-[:L]-`). The abbreviated forms `->` and `-`, undirected edges, label expressions (`:A|B`), property maps (`{name: 'x'}`), path variables (`p = ...`) and `SHORTEST` / `ANY` path modes are not supported.
- **Labels:** each element table has exactly one label, and a label belongs to one table. To give rows from one table different labels, define a view per label and use each view as its own element table.
- **Results:** return properties (`m.name`), not whole vertices or edges (`m`).
- **`GRAPH_TABLE`:** `COLUMNS (...)` must be the last clause. Write the PGQ `IS Label` form as `:Label`. `SHOW CREATE VIEW` shows a view's `GRAPH_TABLE` in its internal form, `GRAPH_TABLE('graph', 'MATCH ...')`, which runs the same.
- **Definitions:** no expressions as properties, no `DEFAULT LABEL`, and no `ALTER PROPERTY GRAPH`. To change a graph, use `CREATE OR REPLACE`.

## See Also

- [CREATE PROPERTY GRAPH](/docs/reference/sql/statements/create-property-graph)
- [DROP PROPERTY GRAPH](/docs/reference/sql/statements/drop-property-graph)
- [GRAPH_TABLE](/docs/reference/sql/statements/graph-table)
- [GQL](/docs/reference/sql/advanced/adv-gql)
- [SHOW CREATE](/docs/reference/sql/statements/show-create)
- [CREATE VIEW](/docs/reference/sql/statements/create-view)
