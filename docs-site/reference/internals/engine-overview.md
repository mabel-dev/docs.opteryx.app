# How Opteryx Plans and Runs a Query

Opteryx is a SQL engine split cleanly across one boundary. Everything up to and including building a runnable plan is **Python** — parsing, binding, optimizing, choosing operators. Everything that actually touches data is **native** — the scan, the operators, the expression evaluation, the scheduling. Python decides the work; native code does it. The boundary is crossed exactly once: planning hands a finished physical plan to the executor, and the executor runs it without calling back into Python planning logic.

This document walks the path a query takes from SQL text to results.

---

## The pipeline at a glance

The engine is a loop. SQL goes down one side, is progressively refined into a runnable plan, executes, and results come back up the other side. The planner draws it like this:

```
                      ┌───────────┐
                      │   USER    │
       ┌──────────────┤           ◄──────────────┐
       │              └───────────┘              │
───────┼─────────────────────────────────────────┼──────
       │ SQL                                     │ Results
 ┌─────▼─────┐                             ┌─────┴─────┐
 │ SQL       │                             │           │
 │ Rewriter  │                             │ Executor  │
 └─────┬─────┘                             └─────▲─────┘
       │ SQL                                     │ Plan
 ┌─────▼─────┐                             ┌─────┴─────┐
 │           │                             │ Physical  │
 │ Parser    │                             │ Planner   │
 └─────┬─────┘                             └─────▲─────┘
       │ AST                                     │ Plan
 ┌─────▼─────┐                             ┌─────┴─────┐
 │ AST       │                             │           │
 │ Rewriter  │                             │ Optimizer │
 └─────┬─────┘                             └─────▲─────┘
       │ AST                                     │ Plan
 ┌─────▼─────┐        ┌───────────┐        ┌─────┴─────┐
 │ Logical   │ Plan   │ Plan      │ Plan   │           │
 │   Planner ├────────► Rewriter  ├────────► Binder    │
 └───────────┘        └───────────┘        └─────▲─────┘
                                                 │ Stats & Schemas
                                           ┌─────┴─────┐
                                           │           │
                                           │ Catalogue │
                                           └───────────┘
```

The left column transforms *text*; the bottom row transforms a *plan*; the right column refines that plan until it can run. Each stage has a single, narrow responsibility.

---

## Down the left: text becomes a plan

### SQL rewriter

The raw query string is cleaned up before anything tries to parse it — normalising constructs that are easier to handle as text than as a tree. This is deliberately the first step: a few problems are far simpler to fix on the string than on the parsed AST.

### Parser

The cleaned SQL is parsed by a native Rust parser (the `sqlparser` crate, driven through an Opteryx-specific SQL dialect) and returned as an abstract syntax tree. Parsing is the first native step in the pipeline — it produces a structured AST from flat text.

### AST rewriter

The AST is rewritten into a canonical form: query parameters are substituted, and a number of syntactic shapes are normalised so that later stages see fewer special cases.

### Logical planner

The canonical AST becomes a **logical plan** — a directed graph of relational operations (Scan, Filter, Project, Join, Aggregate, and so on). This is the first representation that looks like a query *plan* rather than a parse of the text. It describes *what* the query means, not yet *how* it will run.

---

## Along the bottom: shaping the plan

### Plan rewriter

The logical plan is structurally rewritten — for example, turning certain subqueries and set operations into joins — so the optimizer and binder work on a smaller, more regular vocabulary of nodes.

### Binder

Binding resolves names against the **catalogue**: every column is given a concrete type, a schema, and a stable identity, and the relations it reads are validated. This is where the plan stops being a set of bare identifiers and becomes a fully-typed plan the optimizer can reason about. The catalogue also supplies statistics and schemas that later cost-based decisions depend on.

---

## Up the right: refining the plan until it runs

### Optimizer

The optimizer runs an ordered pipeline of strategies over the bound plan. Most are **rule-based** rewrites that are always beneficial — constant folding, boolean simplification, predicate pushdown, projection pushdown, redundant-cast elimination, limit pushdown, and many more. A handful are **cost-based**, consulting statistics to make a genuine choice rather than apply a fixed rule:

- **Join planning** — enumerating join orders (DPccp).
- **Join ordering** — reordering joins by estimated cardinality.
- **Correlated filters** — propagating a filter's effect onto the opposite side of a join.
- **Predicate ordering** — running cheaper, more selective predicates first.

Cost-based strategies pull fresh statistics before they run. The guiding principle throughout is the cheapest one in the book: read less data, and do less work on the data you do read — so the optimizer works hard to filter early, prune partitions and row groups, and project away unused columns before anything expensive happens.

### Physical planner

This is the Python/native handover. The optimized logical plan is turned into a **physical plan**: each logical operation is bound to a concrete operator implementation — a Parquet scan, a specific join algorithm (hash, nested-loop, outer, cross, as-of…), an aggregate, a sort, a limit. The physical plan is a graph of native operators, fully resolved. Nothing above this line is consulted again at run time.

### Executor

The executor runs the physical plan. Simple metadata and DDL statements take a serial path; data pipelines are driven by the native scheduler, which executes operators across worker threads with the GIL released. Data flows through the operators in **morsels** — batches of columnar Draken vectors — and the per-morsel drive loop, the operator pipeline, and dispatch all live in native code. Results stream back up to the user.

---

## Why the split matters

Keeping planning in Python buys flexibility where it is cheap: the planner deals with one query at a time, the logic is intricate, and clarity matters more than nanoseconds. Keeping execution native buys speed where it counts: the engine may process billions of rows, so the per-row and per-morsel paths must be tight, branch-predictable, and free of the interpreter and the GIL.

The contract between the two halves is the physical plan. Once it is built, the query is a native program — and the rest of these internals documents describe the machinery that runs it: the [file engine](rugo.md) that turns bytes into vectors, the [vector library](draken.md) those operators compute over, and the [bytecode engine](bytecode-engine.md) that evaluates expressions.
