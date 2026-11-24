---
title: Querying Graphs - Property Graphs, GRAPH_TABLE and GQL
description: How to query the relationships in your tables as a graph in Opteryx. Define a property graph over tables you already have, then ask path questions with GRAPH_TABLE inside SQL, or with GQL through the Jobs API.
---

# Querying Graphs

Some questions are about how rows are connected rather than about the rows themselves. Who manages whom? Which services run as an account that can impersonate other accounts? Which suppliers are two steps away from a customer? You can write these as SQL joins, but the joins hide the question. Each hop adds a join and two key columns, and the path you meant gets lost among them.

Opteryx lets you name the connections once, as a **property graph**, and then ask path questions directly:

~~~sql
SELECT manager, COUNT(*) AS reports
FROM GRAPH_TABLE (acme.hr.org
       MATCH (m:Person)-[:MANAGES]->(r:Person)
       COLUMNS (m.name AS manager, r.id AS report_id))
GROUP BY manager
ORDER BY reports DESC;
~~~

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

- A **vertex table** is a table whose rows are things: people, teams, services, accounts. It has a `KEY` that identifies each vertex and a `LABEL` you use in patterns (`Person`).
- An **edge table** is a table whose rows are connections. Each edge has a **source** and a **destination**, given as key columns that reference a vertex table, and a `LABEL` of its own (`MANAGES`).

Each element exposes the columns you list as **properties**, which patterns read as `m.name`.

The same table can play more than one part. A `people` table with a `manager_id` column is a vertex table (each row is a person) and also an edge table (each row with a manager is a `MANAGES` edge from the manager to the person). A join table such as `memberships (person_id, team_id)` is an edge table between two vertex tables.

## Defining a Graph

Here are three tables: `people (id, name, manager_id)`, `teams (id, name)` and `memberships (person_id, team_id)`. This graph has two vertex labels and two edge labels over them:

~~~sql
CREATE PROPERTY GRAPH acme.hr.org
  VERTEX TABLES (
    acme.hr.people AS people KEY (id) LABEL Person PROPERTIES (id, name),
    acme.hr.teams  AS teams  KEY (id) LABEL Team   PROPERTIES (id, name)
  )
  EDGE TABLES (
    acme.hr.people AS manages KEY (id)
      SOURCE      KEY (manager_id) REFERENCES people (id)
      DESTINATION KEY (id)         REFERENCES people (id)
      LABEL MANAGES NO PROPERTIES,
    acme.hr.memberships AS member_of KEY (person_id, team_id)
      SOURCE      KEY (person_id) REFERENCES people (id)
      DESTINATION KEY (team_id)   REFERENCES teams (id)
      LABEL MEMBER_OF NO PROPERTIES
  );
~~~

When the graph is created, Opteryx checks the definition against the tables. Every table must exist and be readable by you. Every key, endpoint and property column must exist. Every `REFERENCES` must name a vertex table in this graph, and labels must be unique. A mistake is reported when you create the graph, not later when someone queries it.

What gets stored is the definition with everything written out: `PROPERTIES ALL COLUMNS` becomes the column list, and an endpoint that came from a foreign key is spelled out in full. `SHOW CREATE PROPERTY GRAPH` returns exactly that text:

~~~sql
SHOW CREATE PROPERTY GRAPH acme.hr.org;
~~~

A graph's name shares the namespace with tables and views. You can't create a graph called `acme.hr.people` while that table exists, and you can't create a table or view with a graph's name.

See [CREATE PROPERTY GRAPH](/docs/reference/sql/statements/create-property-graph) for the full syntax and every rule.

### Seeing a Graph's Shape

On [opteryx.app](https://opteryx.app), reading a graph's own name returns its **structure**: one row per vertex table and per edge table, with its label, key, properties and endpoints. It never returns the contents of those tables.

~~~sql
SELECT element_kind, element_name, label, table_name
FROM acme.hr.org;
~~~

| element_kind | element_name | label | table_name |
|---|---|---|---|
| vertex | people | Person | acme.hr.people |
| vertex | teams | Team | acme.hr.teams |
| edge | manages | MANAGES | acme.hr.people |
| edge | member_of | MEMBER_OF | acme.hr.memberships |

The Studio uses these rows to draw the graph as a diagram in the dataset browser. The SQL editor uses them to suggest labels and properties while you write a `GRAPH_TABLE` pattern.

## Querying with GRAPH_TABLE

`GRAPH_TABLE` is a table you put in a `FROM` clause. It takes a graph, a `MATCH` pattern and a `COLUMNS` list, and it produces an ordinary result that the rest of the statement can use:

~~~sql
SELECT *
FROM GRAPH_TABLE (acme.hr.org
       MATCH (m:Person)-[:MANAGES]->(r:Person)
       COLUMNS (m.name AS manager, r.name AS report));
~~~

The pattern reads left to right:
- `(m:Person)` is a vertex with the label `Person`, named `m`.
- `-[:MANAGES]->` is an edge with the label `MANAGES`, followed from source to destination.
- `(r:Person)` is the vertex at the other end.

Each match is one row. `COLUMNS` says what that row holds.

Because it is a table, everything else in SQL works around it.

**Aggregate over it:**
~~~sql
SELECT g.manager, COUNT(*) AS reports
FROM GRAPH_TABLE (acme.hr.org
       MATCH (m:Person)-[:MANAGES]->(r:Person)
       COLUMNS (m.name AS manager, r.id AS report_id)) AS g
GROUP BY g.manager;
~~~

**Join it to a table:**
~~~sql
SELECT t.name, COUNT(*) AS members
FROM acme.hr.teams AS t
JOIN GRAPH_TABLE (acme.hr.org
       MATCH (p:Person)-[:MEMBER_OF]->(team:Team)
       COLUMNS (team.id AS team_id)) AS g
  ON g.team_id = t.id
GROUP BY t.name;
~~~

**Follow more than one edge:**
~~~sql
SELECT *
FROM GRAPH_TABLE (acme.hr.org
       MATCH (m:Person)-[:MANAGES]->(r:Person)-[:MEMBER_OF]->(t:Team)
       WHERE t.name = 'Platform'
       COLUMNS (m.name AS manager, r.name AS report));
~~~

**Keep it as a view:**
~~~sql
CREATE VIEW acme.hr.reporting AS
SELECT manager, COUNT(*) AS reports
FROM GRAPH_TABLE (acme.hr.org
       MATCH (m:Person)-[:MANAGES]->(r:Person)
       COLUMNS (m.name AS manager, r.id AS report_id))
GROUP BY manager;
~~~

A view over a graph is planned again on every read, like any view. If the graph is later redefined with `CREATE OR REPLACE`, the view uses the new definition.

See [GRAPH_TABLE](/docs/reference/sql/statements/graph-table) for the full syntax.

## Paths of More Than One Hop

An edge followed by `{m,n}` matches a chain of `m` to `n` repeats of that edge. Each repeat starts at the vertex where the last one ended. This query finds everyone up to three levels below each manager:

~~~sql
SELECT manager, COUNT(*) AS walks
FROM GRAPH_TABLE (acme.hr.org
       MATCH (m:Person)-[:MANAGES]->{1,3}(r:Person)
       COLUMNS (m.name AS manager, r.name AS below))
GROUP BY manager;
~~~

`{2}` is exactly two hops. `{1,3}` is one, two or three. Some things to know:

- **Every walk is a row.** If two different routes reach the same person, that is two rows, so `COUNT(*)` counts walks. Use `COUNT(DISTINCT ...)` to count people.
- **Bounds are 1 to 16.** `{0,n}` (which would include the start vertex itself), and open-ended `*`, `+` and `{m,}`, are refused. Unbounded paths need a dedicated path operator in the engine, which does not exist yet.
- **A quantified edge has to start and end on the same vertex table**, because each repeat has to continue from where the last one ended. `{1}` is the exception.
- A `WHERE` inside the edge's brackets applies to every repeat.

## Querying with GQL

`GRAPH_TABLE` puts a graph pattern inside SQL. You can also write the whole query in **GQL** ([ISO/IEC 39075](https://www.iso.org/standard/76120.html)), the ISO graph query language. GQL is not GraphQL, and it is not Cypher, although its patterns look like Cypher's.

~~~
USE acme.hr.org
MATCH (m:Person)-[:MANAGES]->(r:Person)
WHERE r.name <> m.name
RETURN m.name AS manager, COUNT(*) AS reports
GROUP BY manager
ORDER BY reports DESC
LIMIT 10
~~~

A GQL query starts with `USE` and the graph's full name, and ends with `RETURN` in place of `COLUMNS`.

On opteryx.app, submit it through the [Jobs API](/docs/reference/api/jobs-api) with `"language": "gql"`:

~~~json
{
  "sql_text": "USE acme.hr.org MATCH (m:Person)-[:MANAGES]->(r:Person) RETURN m.name AS manager, r.name AS report",
  "language": "gql"
}
~~~

The query is translated to SQL when you submit it, and that SQL is what runs, is permission-checked and is billed. The job keeps both versions: `source_text` is the GQL you wrote, and `sql_text` is the SQL it ran as.

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

**A graph grants no access to its tables.** If you can read the graph but not `acme.hr.memberships`, any pattern that uses a `MEMBER_OF` edge fails with a permission error naming that table. Patterns that don't use it still work. Access to the graph is checked before its definition is read, so a caller without access can't use pattern errors to find out what labels a graph has.

See [Access and permissions](/docs/core-concepts/access-and-permissions).

## Performance

A pattern is planned as the joins it stands for, so it gets the same optimizer as the equivalent hand-written SQL: filter pushdown, join ordering, and pruning of columns you didn't ask for. A few things are worth knowing:

- **Filter in the pattern.** A `WHERE` on a vertex is pushed down to that vertex's table, the same way a `WHERE` on a joined table is.
- **Each hop is a join.** `{1,16}` is sixteen chains, from one join up to sixteen, combined with `UNION ALL`. Wide bounds over large edge tables are expensive. Use the smallest upper bound that answers the question.
- **A table that is both a vertex and an edge table is read twice.** In the example graph, `MANAGES` is a self-join of `people`. The optimizer doesn't share those scans yet.

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
