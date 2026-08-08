# The Planner

Before Opteryx runs a query, it plans one. Everything from parsing SQL text to producing a runnable physical plan happens in Python; nothing here touches data. This page covers that half of the engine — parsing and planning. What happens once the plan is handed off to run is covered in [Execution Model](../core-concepts/execution-model).

For the complete pipeline diagram and the execution half, see [How Opteryx Plans and Runs a Query](/docs/reference/internals/engine-overview).

## From text to an abstract syntax tree

A query starts as a plain SQL string. Two steps turn it into a structured tree:

- **SQL rewriter** — normalises the raw query string before anything tries to parse it. Some things are simpler to fix as text than as a parsed tree, so this runs first.
- **Parser** — a native Rust parser (the `sqlparser` crate, driven through an Opteryx-specific SQL dialect) turns the cleaned SQL into an abstract syntax tree (AST).

## From an AST to a logical plan

- **AST rewriter** — puts the AST into a canonical form: query parameters are substituted, and syntactic shapes are normalised so later stages see fewer special cases.
- **Logical planner** — turns the canonical AST into a **logical plan**, a directed graph of relational operations (`Scan`, `Filter`, `Project`, `Join`, `Aggregate`, and so on). This is the first representation that describes *what* the query means, rather than a parse of the text.

## Binding and optimisation

- **Plan rewriter** — restructures the logical plan (for example, turning certain subqueries and set operations into joins) so the binder and optimizer work over a smaller, more regular vocabulary of nodes.
- **Binder** — resolves every name against the catalogue: columns get a concrete type, a schema, and a stable identity, and the relations a query reads are validated. This is where the plan stops being bare identifiers and becomes fully-typed. The catalogue also supplies the statistics and schemas that cost-based decisions in the next step depend on.
- **Optimizer** — runs an ordered pipeline of strategies over the bound plan. Most are rule-based rewrites that are always beneficial: constant folding, boolean simplification, predicate pushdown, projection pushdown, redundant-cast elimination, limit pushdown, and more. A handful are cost-based, consulting statistics to make a genuine choice:
  - **Join planning** — enumerating join orders (DPccp).
  - **Join ordering** — reordering joins by estimated cardinality.
  - **Correlated filters** — propagating a filter's effect onto the opposite side of a join.
  - **Predicate ordering** — running cheaper, more selective predicates first.

  The guiding principle throughout is the same one that shows up in [Troubleshooting Queries](/docs/guides/troubleshooting): read less data, and do less work on the data you do read.

## Handing off to execution

The **physical planner** is where planning ends: the optimized logical plan is turned into a physical plan, with each logical operation bound to a concrete operator implementation — a Parquet scan, a specific join algorithm, an aggregate, a sort, a limit. Nothing above this line is consulted again at run time; the physical plan is handed to the executor as a finished, native program. What happens from there is covered in [Execution Model](../core-concepts/execution-model).

To see the plan a specific query produces, prefix it with `EXPLAIN` — see [Troubleshooting Queries](/docs/guides/troubleshooting).
