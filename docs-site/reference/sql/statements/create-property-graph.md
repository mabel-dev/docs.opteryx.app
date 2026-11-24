---
title: CREATE PROPERTY GRAPH Statement — Opteryx Reference
description: SQL/PGQ CREATE PROPERTY GRAPH syntax and examples for defining a property graph over existing tables in Opteryx
---

# CREATE PROPERTY GRAPH

The `CREATE PROPERTY GRAPH` statement defines a property graph over tables that already exist. Some tables become vertex tables, and others become edge tables that connect vertices.

A property graph stores only its definition. Its vertices and edges are the rows of the tables it names, so it is never out of date and never needs refreshing. Query it with [GRAPH_TABLE](graph-table) or with [GQL](../advanced/adv-gql).

The definition is checked against its tables when it is created, and stored with every clause written out. [SHOW CREATE PROPERTY GRAPH](show-create) returns that stored text.

## Syntax

~~~sql
CREATE [ OR REPLACE ] PROPERTY GRAPH [ IF NOT EXISTS ] <graph_name>
  VERTEX TABLES (
    <vertex_table> [, ...]
  )
  [ EDGE TABLES (
    <edge_table> [, ...]
  ) ];
~~~

Where `<vertex_table>` is:

~~~sql
<relation> [ AS <element_name> ]
  KEY ( <column> [, ...] )
  [ LABEL <label> ]
  [ { PROPERTIES ( <column> [ AS <property> ] [, ...] )
    | PROPERTIES ALL COLUMNS
    | NO PROPERTIES } ]
~~~

And `<edge_table>` is:

~~~sql
<relation> [ AS <element_name> ]
  KEY ( <column> [, ...] )
  SOURCE { KEY ( <column> [, ...] ) REFERENCES <vertex_element> ( <column> [, ...] ) | <vertex_element> }
  DESTINATION { KEY ( <column> [, ...] ) REFERENCES <vertex_element> ( <column> [, ...] ) | <vertex_element> }
  [ LABEL <label> ]
  [ { PROPERTIES ( <column> [ AS <property> ] [, ...] )
    | PROPERTIES ALL COLUMNS
    | NO PROPERTIES } ]
~~~

## Parameters

- **`<graph_name>`** — fully qualified as `<workspace>.<collection>.<graph_name>`. It shares
  the namespace with tables and views.
- **`<relation>`** — a table or view, fully qualified. The same relation can appear more
  than once, under different element names (for example, as a vertex table and as an edge
  table).
- **`<element_name>`** — the name this element goes by inside the graph. Edges use it in
  `REFERENCES` to name their vertex tables. It defaults to the relation's last name part,
  and must be unique within the graph.
- **`KEY ( <column> [, ...] )`** — the columns that identify one vertex or one edge.
  Required on every element table, vertex and edge alike: Opteryx tables have no primary
  key for it to default to.
- **`SOURCE` / `DESTINATION`** — the edge's two ends. `KEY (...)` lists the edge table's
  columns, and `REFERENCES <vertex_element> (...)` lists the vertex table's key columns
  they match, in the same order and of the same number. The short form, a bare
  `<vertex_element>`, takes the columns from the edge relation's one informational
  `FOREIGN KEY` to that vertex table.
- **`LABEL <label>`** — the name patterns use for this element (`(p:Person)`,
  `-[:MANAGES]->`). It defaults to the element name. Each element table has one label, and
  each label belongs to one element table.
- `PROPERTIES ( <column> [ AS <property> ] [, ...] )` — the columns a pattern can read, and
  optionally the names it reads them by.
- `PROPERTIES ALL COLUMNS` — every column of the relation, as it is when the graph is
  created. This is the default when no properties clause is given.
- `NO PROPERTIES` — the element exposes no properties. This is common for edges whose
  only job is to connect two vertices.
- `OR REPLACE` — overwrite an existing graph's definition instead of failing.
- `IF NOT EXISTS` — leave an existing graph untouched instead of failing. Cannot be
  combined with `OR REPLACE`.

## Examples

### Vertices and Edges from Separate Tables
~~~sql
CREATE PROPERTY GRAPH acme.hr.org
  VERTEX TABLES (
    acme.hr.people AS people KEY (id) LABEL Person PROPERTIES (id, name),
    acme.hr.teams  AS teams  KEY (id) LABEL Team   PROPERTIES (id, name)
  )
  EDGE TABLES (
    acme.hr.memberships AS member_of KEY (person_id, team_id)
      SOURCE      KEY (person_id) REFERENCES people (id)
      DESTINATION KEY (team_id)   REFERENCES teams (id)
      LABEL MEMBER_OF NO PROPERTIES
  );
~~~

### An Edge Stored on Its Vertex Table
A `people` table with a `manager_id` column holds both the people and the reporting line
between them:
~~~sql
CREATE PROPERTY GRAPH acme.hr.reporting
  VERTEX TABLES (
    acme.hr.people AS people KEY (id) LABEL Person PROPERTIES (id, name)
  )
  EDGE TABLES (
    acme.hr.people AS manages KEY (id)
      SOURCE      KEY (manager_id) REFERENCES people (id)
      DESTINATION KEY (id)         REFERENCES people (id)
      LABEL MANAGES NO PROPERTIES
  );
~~~

### Renaming Properties
~~~sql
CREATE PROPERTY GRAPH acme.sales.accounts
  VERTEX TABLES (
    acme.sales.companies KEY (id) LABEL Company PROPERTIES (id, legal_name AS name)
  );
~~~

### Endpoints from a Foreign Key
If the edge table declares an informational foreign key, the endpoint can name just the
vertex table:
~~~sql
CREATE TABLE acme.social.knows (
  a BIGINT,
  b BIGINT,
  CONSTRAINT fk_a FOREIGN KEY (a) REFERENCES acme.social.people (id) NOT ENFORCED
);

CREATE PROPERTY GRAPH acme.social.g
  VERTEX TABLES (acme.social.people KEY (id) LABEL Person PROPERTIES (id, name))
  EDGE TABLES (
    acme.social.knows KEY (a, b)
      SOURCE people
      DESTINATION KEY (b) REFERENCES people (id)
      LABEL KNOWS NO PROPERTIES
  );
~~~
The stored definition spells the source out as `SOURCE KEY (a) REFERENCES people (id)`.

### One Edge Table, Several Labels
Each element table has one label. To split one table of typed links into several edge
labels, define a view per type and use each view as its own edge table:
~~~sql
CREATE VIEW acme.infra.runs_as AS
SELECT * FROM acme.infra.links WHERE relation = 'runs_as';

CREATE VIEW acme.infra.invokes AS
SELECT * FROM acme.infra.links WHERE relation = 'invokes';

CREATE PROPERTY GRAPH acme.infra.g
  VERTEX TABLES (acme.infra.resources AS resources KEY (id) LABEL Resource)
  EDGE TABLES (
    acme.infra.runs_as KEY (source_id, target_id)
      SOURCE      KEY (source_id) REFERENCES resources (id)
      DESTINATION KEY (target_id) REFERENCES resources (id)
      LABEL RUNS_AS NO PROPERTIES,
    acme.infra.invokes KEY (source_id, target_id)
      SOURCE      KEY (source_id) REFERENCES resources (id)
      DESTINATION KEY (target_id) REFERENCES resources (id)
      LABEL INVOKES NO PROPERTIES
  );
~~~

### Redefine a Graph
~~~sql
CREATE OR REPLACE PROPERTY GRAPH acme.hr.org
  VERTEX TABLES (acme.hr.people KEY (id) LABEL Person PROPERTIES (id, name, title));
~~~

## Notes

- **Checked when created.** Every relation must exist and be readable by you. Every key,
  endpoint, reference and property column must exist. Every `REFERENCES` must name a
  vertex table of this graph, with the same number of columns. Element names must be
  unique, labels must be unique across element tables, and property names must be unique
  within an element. A definition that breaks any of these rules is refused by name.
- **Stored in full.** The stored definition writes out every element name, key, endpoint,
  label and property. `PROPERTIES ALL COLUMNS` and a missing properties clause are expanded
  to the column list, and a foreign-key endpoint is written out. A column added to a table
  later does not become a property until the graph is re-created, the same trade-off
  [CREATE VIEW](create-view) makes with its recorded columns.
- **One namespace.** A graph can't take the name of an existing table or view, and a table
  or view can't take a graph's name.
- **A foreign-key endpoint needs exactly one foreign key** from the edge table to that
  vertex table. With none, or with several, the statement is refused and names the
  problem. Foreign keys are single-column, so an endpoint taken from one is too.
- Requires `WRITE` on the graph's name, the same tier as [CREATE VIEW](create-view), and
  `READ` on every relation it names. See
  [Access and permissions](/docs/core-concepts/access-and-permissions).
- Anyone with `READ` on the graph can read its definition, including the names of the
  tables it maps. Unlike a view's, a graph's definition is meant for its readers: they need
  its labels and properties to write patterns.
- Creating a graph grants nobody access to its tables. Querying it needs `READ` on each
  table the query reads.
- **Not supported** (each is refused with an error naming it): expressions as properties,
  `DEFAULT LABEL`, more than one `LABEL` on an element table, and `ALTER PROPERTY GRAPH`.
- Graphs are stored in the workspace catalog. An embedded engine stores them in a local
  store workspace. Other connectors refuse graph DDL.

## See Also

- [Querying graphs](/docs/guides/querying-graphs)
- [DROP PROPERTY GRAPH](drop-property-graph)
- [GRAPH_TABLE](graph-table)
- [SHOW CREATE](show-create)
- [CREATE VIEW](create-view)
- [GQL](../advanced/adv-gql)
