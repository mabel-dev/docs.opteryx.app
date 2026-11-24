---
title: GQL — Opteryx Reference
description: The parts of GQL (ISO/IEC 39075), the ISO graph query language, that Opteryx supports, how a GQL query is run, and what is not supported yet
---

# GQL

GQL ([ISO/IEC 39075](https://www.iso.org/standard/76120.html)) is the ISO standard language for querying property graphs. Opteryx
runs GQL queries over the [property graphs](../statements/create-property-graph) defined
in a workspace.

~~~
USE acme.hr.org
MATCH (m:Person)-[:MANAGES]->(r:Person)
RETURN m.name AS manager, COUNT(*) AS reports
GROUP BY manager
ORDER BY reports DESC
LIMIT 10
~~~

GQL is not GraphQL. Its patterns look like Cypher's, but it is a different language, and
Cypher-only syntax is refused.

## How a GQL Query Runs

A GQL query is translated into one SQL statement over the tables behind the graph, and
that SQL is what runs. The translation is done by
[`gqlparser`](https://pypi.org/project/gqlparser/), an open-source, dependency-free Python
package maintained alongside Opteryx.

- **On [opteryx.app](https://opteryx.app):** submit the query through the
  [Jobs API](/docs/reference/api/jobs-api) with `"language": "gql"`. It is translated when you
  submit it, and from then on the job is an ordinary SQL job: it is permission-checked,
  billed and run as SQL. The job records `source_text` (the GQL you wrote) and `sql_text`
  (the SQL it ran as).
- **In an embedded engine:** do the translation in your own code, and run the SQL:

~~~python
import gqlparser
import opteryx
from opteryx.compute import restore_ast

session = opteryx.session()

# the graph's stored definition
(morsel,) = session.execute_to_morsels("SHOW CREATE PROPERTY GRAPH acme.hr.org")
ddl = morsel.column("create_statement").to_pylist()[0]

graph = gqlparser.parse_property_graph(ddl)
statement = gqlparser.lower(gqlparser.parse(gql_text), graph)
sql = restore_ast([statement])[0]

for morsel in session.execute_to_morsels(sql):
    ...
~~~

To use a graph pattern inside a SQL statement instead, see
[GRAPH_TABLE](../statements/graph-table). It takes the same patterns.

## Query Shape

~~~
[ USE <graph_name> ]
{ MATCH | OPTIONAL MATCH } <path_pattern> [, ...] [ WHERE <condition> ]
[ { MATCH | OPTIONAL MATCH } ... ]
RETURN [ DISTINCT | ALL ] <expression> [ AS <name> ] [, ...]
[ GROUP BY <name> [, ...] ]
[ ORDER BY <expression> [ ASC | DESC ] [, ...] ]
[ { OFFSET | SKIP } <n> ]
[ LIMIT <n> ]
~~~

- **`USE <graph_name>`** names the graph, in full: `<workspace>.<collection>.<graph>`.
  It is required when submitting to the Jobs API.
- **Successive `MATCH` statements** are joined on the variables they share.
- **`OPTIONAL MATCH`** keeps the rows from earlier statements when it finds no match,
  with nulls for what it would have added (a left join). It must share a variable with an
  earlier statement, and can't be the first statement.
- **`RETURN`** items that are not plain properties need `AS <name>`. To mix aggregates
  with other items, use `GROUP BY`.
- **`OFFSET` / `LIMIT`** take a whole number or a `$parameter`.

## Patterns

| Pattern | Matches |
|---|---|
| `(p:Person)` | a vertex with the label `Person`, named `p` |
| `(p:Person WHERE p.age > 30)` | the same, filtered |
| `-[e:KNOWS]->` | an edge from source to destination |
| `<-[e:KNOWS]-` | an edge from destination to source |
| `-[:KNOWS WHERE ...]->` | an edge, unnamed, filtered |
| `-[:KNOWS]->{2}` | a chain of exactly two `KNOWS` edges |
| `-[:KNOWS]->{1,3}` | a chain of one, two or three `KNOWS` edges |

Each part of a vertex or edge pattern is optional. A vertex without a label takes one from
an adjacent edge when the graph makes that unambiguous.

**Repeatable elements.** A match may use the same edge more than once. No rule makes two
variables match different elements. If you need that, write a `WHERE`.

**Quantified edges** (`{m}`, `{m,n}`) take bounds from 1 to 16. Every walk is a row, so
`COUNT(*)` counts walks and `RETURN DISTINCT` counts the vertices reached. A quantified
edge must run between a vertex table and itself (except `{1}`), its variable can't be used
outside its brackets, and it can't be used in an `OPTIONAL MATCH`.

## Expressions

From lowest to highest precedence: `OR`, `XOR`, `AND`, `NOT`, comparisons
(`= <> < <= > >=`) and `IS [NOT] NULL`, `||`, `+ -`, `* / %`, unary `+ -`, and property
access (`p.name`).

| Kind | Supported |
|---|---|
| Literals | numbers, `'strings'`, `TRUE`, `FALSE`, `NULL` |
| Temporal literals | `DATE '2026-01-01'`, `TIME '...'`, `DATETIME '...'`, `TIMESTAMP '...'`, `DURATION 'P30D'` |
| Current time | `CURRENT_DATE`, `CURRENT_TIME`, `CURRENT_TIMESTAMP` |
| Parameters | `$name` |
| Functions | any Opteryx function, `name([DISTINCT] args)`, and `COUNT(*)` |
| Conditionals | simple and searched `CASE ... END` |

Function names are passed through to Opteryx, so any [function](../functions) works.
`COLLECT_LIST` becomes `ARRAY_AGG`. A `DURATION` must be a single whole-number unit
(`'P30D'`, `'PT12H'`).

## Not Supported Yet

Each of these is refused with an error that names the construct. Nothing is skipped or
approximated.

- **Edges:** abbreviated edges (`->`, `<-`, `-`), any-direction edges (`-[...]-`),
  `<-[...]->`, and `~` edges.
- **Paths:** `*`, `+`, `?`, `{m,}`, `{,n}`, `{0,n}`, bounds above 16, quantified
  parenthesized paths, path variables (`p = ...`), path modes and search prefixes
  (`ANY`, `SHORTEST`, `TRAIL`, ...), match modes (`DIFFERENT EDGES`, ...), `KEEP`, `YIELD`.
- **Labels:** label expressions (`:A|B`, `&`, `!`, `%`), `IS Label`, more than one label,
  and property maps (`{name: 'Ada'}`).
- **Statements:** a query without `MATCH`, `LET`, `FILTER`, `FOR`, `CALL`, `NEXT`, `UNION`
  and the other composite queries, `OPTIONAL { }` blocks, and data modification (`INSERT`,
  `SET`, `REMOVE`, `DELETE`).
- **RETURN:** `RETURN *`, returning a whole vertex or edge (`RETURN p`, `COUNT(p)`),
  `NULLS FIRST` / `NULLS LAST`, and `OFFSET` after `LIMIT`.
- **Expressions:** `!=` (write `<>`), chained comparisons (`a < b < c`), `IS TRUE` and the
  other `IS` predicates, list and record literals, double-quoted strings, `EXISTS`, and
  `--` comments (use `//` or `/* */`).

## Errors

A GQL query can fail in three ways before it runs:

| Error | Meaning |
|---|---|
| Syntax error | The text could not be read as GQL. Valid GQL that isn't recognised yet can also land here. |
| Not supported | The text uses a GQL construct that is recognised but not supported yet. The error names it. |
| Semantic error | The text is well-formed but doesn't fit the graph: an unknown label, property or variable, an edge written against its declared direction, or a `USE` that names a different graph. |

Once translated, the query is SQL, and fails the way SQL does: for example, with a
permission error naming a table you can't read.

## Permissions

Reading the graph's definition needs `READ` on the graph. This is checked before the
definition is loaded. Running the query needs `READ` on every table it reads. A graph
grants no access to its tables.

## See Also

- [Querying graphs](/docs/guides/querying-graphs)
- [GRAPH_TABLE](../statements/graph-table)
- [CREATE PROPERTY GRAPH](../statements/create-property-graph)
- [Jobs API](/docs/reference/api/jobs-api)
- [gqlparser on GitHub](https://github.com/mabel-dev/gqlparser)
