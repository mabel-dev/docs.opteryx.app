# How Opteryx Plans and Runs a Query

Opteryx is a SQL engine split cleanly across one boundary. Everything up to and including building a runnable plan is **Python** — parsing, binding, optimizing, choosing operators. Everything that actually touches data is **native** — the scan, the operators, the expression evaluation, the scheduling. Python decides the work; native code does it. The boundary is crossed exactly once: planning hands a finished physical plan to the executor, and the executor runs it without calling back into Python planning logic.

This document walks the path a query takes from SQL text to results.

---

## The pipeline at a glance

The engine is a loop. SQL goes down one side, is progressively refined into a runnable plan, executes, and results come back up the other side.

<figure class="doc-figure">
<svg viewBox="0 0 680 518" width="100%" role="img" aria-labelledby="engine-overview-title engine-overview-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="engine-overview-title">How Opteryx plans and runs a query</title>
<desc id="engine-overview-desc">The path a query takes through Opteryx. SQL from the user goes down the left column: SQL rewriter, Parser (native, Rust), AST rewriter, Logical planner. The plan then moves along the bottom: Plan rewriter, then Binder, which reads schemas and statistics from the Catalogue below it. It then goes up the right column: Optimizer, Physical planner, and finally the Executor, which is native. The physical plan crosses from Python to native code once, from the Physical planner to the Executor, and results return from the Executor to the user. All stages except the Parser and Executor are Python.</desc>
<rect x="242" y="0" width="196" height="50" rx="8" style="fill: var(--panel-2); stroke: var(--border-2);"/>
<text x="340" y="22" text-anchor="middle" style="fill: var(--text-deep); font-size: 14px; font-weight: 600; font-family: var(--font-display);">User</text>
<text x="340" y="39" text-anchor="middle" style="fill: var(--muted); font-size: 11.5px;">SQL in, results out</text>
<path d="M292 50 V 72 H 98 V 88" style="fill: none; stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="93,88 103,88 98,96" style="fill: var(--muted);"/>
<text x="300" y="68" style="fill: var(--muted); font-size: 10px; font-weight: 700; font-family: var(--font-mono);">SQL</text>
<path d="M582 96 V 72 H 388 V 58" style="fill: none; stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="383,58 393,58 388,50" style="fill: var(--muted);"/>
<text x="380" y="68" text-anchor="end" style="fill: var(--muted); font-size: 10px; font-weight: 700; font-family: var(--font-mono);">RESULTS</text>
<rect x="0" y="96" width="196" height="58" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<rect x="0" y="96" width="5" height="58" rx="2" style="fill: var(--opteryx-navy);"/>
<text x="16" y="120" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">SQL rewriter</text>
<text x="16" y="139" style="fill: var(--muted); font-size: 11.5px;">normalises the raw string</text>
<rect x="0" y="186" width="196" height="58" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<rect x="0" y="186" width="5" height="58" rx="2" style="fill: var(--opteryx-orange);"/>
<text x="16" y="210" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Parser</text>
<text x="16" y="229" style="fill: var(--muted); font-size: 11.5px;">sqlparser (Rust) → AST</text>
<text x="186" y="204" text-anchor="end" style="fill: var(--opteryx-orange); font-size: 9.5px; font-weight: 700; font-family: var(--font-mono);">NATIVE</text>
<rect x="0" y="276" width="196" height="58" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<rect x="0" y="276" width="5" height="58" rx="2" style="fill: var(--opteryx-navy);"/>
<text x="16" y="300" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">AST rewriter</text>
<text x="16" y="319" style="fill: var(--muted); font-size: 11.5px;">substitutes parameters</text>
<rect x="0" y="366" width="196" height="58" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<rect x="0" y="366" width="5" height="58" rx="2" style="fill: var(--opteryx-navy);"/>
<text x="16" y="390" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Logical planner</text>
<text x="16" y="409" style="fill: var(--muted); font-size: 11.5px;">AST → relational plan</text>
<path d="M98 154 V 180" style="fill: none; stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="93,178 103,178 98,186" style="fill: var(--muted);"/>
<text x="106" y="174" style="fill: var(--muted); font-size: 10px; font-weight: 700; font-family: var(--font-mono);">SQL</text>
<path d="M98 244 V 270" style="fill: none; stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="93,268 103,268 98,276" style="fill: var(--muted);"/>
<text x="106" y="264" style="fill: var(--muted); font-size: 10px; font-weight: 700; font-family: var(--font-mono);">AST</text>
<path d="M98 334 V 360" style="fill: none; stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="93,358 103,358 98,366" style="fill: var(--muted);"/>
<text x="106" y="354" style="fill: var(--muted); font-size: 10px; font-weight: 700; font-family: var(--font-mono);">AST</text>
<rect x="242" y="366" width="196" height="58" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<rect x="242" y="366" width="5" height="58" rx="2" style="fill: var(--opteryx-navy);"/>
<text x="258" y="390" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Plan rewriter</text>
<text x="258" y="409" style="fill: var(--muted); font-size: 11.5px;">subqueries, set ops → joins</text>
<rect x="484" y="366" width="196" height="58" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<rect x="484" y="366" width="5" height="58" rx="2" style="fill: var(--opteryx-navy);"/>
<text x="500" y="390" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Binder</text>
<text x="500" y="409" style="fill: var(--muted); font-size: 11.5px;">resolves names and types</text>
<path d="M196 395 H 234" style="fill: none; stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="234,390 242,395 234,400" style="fill: var(--muted);"/>
<text x="219" y="388" text-anchor="middle" style="fill: var(--muted); font-size: 10px; font-weight: 700; font-family: var(--font-mono);">PLAN</text>
<path d="M438 395 H 476" style="fill: none; stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="476,390 484,395 476,400" style="fill: var(--muted);"/>
<text x="461" y="388" text-anchor="middle" style="fill: var(--muted); font-size: 10px; font-weight: 700; font-family: var(--font-mono);">PLAN</text>
<rect x="484" y="276" width="196" height="58" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<rect x="484" y="276" width="5" height="58" rx="2" style="fill: var(--opteryx-navy);"/>
<text x="500" y="300" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Optimizer</text>
<text x="500" y="319" style="fill: var(--muted); font-size: 11.5px;">rule- and cost-based passes</text>
<rect x="484" y="186" width="196" height="58" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<rect x="484" y="186" width="5" height="58" rx="2" style="fill: var(--opteryx-navy);"/>
<text x="500" y="210" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Physical planner</text>
<text x="500" y="229" style="fill: var(--muted); font-size: 11.5px;">binds operators, hands off</text>
<rect x="484" y="96" width="196" height="58" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<rect x="484" y="96" width="5" height="58" rx="2" style="fill: var(--opteryx-orange);"/>
<text x="500" y="120" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Executor</text>
<text x="500" y="139" style="fill: var(--muted); font-size: 11.5px;">native scheduler, morsels</text>
<text x="670" y="114" text-anchor="end" style="fill: var(--opteryx-orange); font-size: 9.5px; font-weight: 700; font-family: var(--font-mono);">NATIVE</text>
<path d="M582 366 V 340" style="fill: none; stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="577,342 587,342 582,334" style="fill: var(--muted);"/>
<text x="590" y="354" style="fill: var(--muted); font-size: 10px; font-weight: 700; font-family: var(--font-mono);">PLAN</text>
<path d="M582 276 V 250" style="fill: none; stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="577,252 587,252 582,244" style="fill: var(--muted);"/>
<text x="590" y="264" style="fill: var(--muted); font-size: 10px; font-weight: 700; font-family: var(--font-mono);">PLAN</text>
<path d="M582 186 V 160" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 2.5;"/>
<polygon points="577,162 587,162 582,154" style="fill: var(--opteryx-orange);"/>
<text x="590" y="174" style="fill: var(--opteryx-orange); font-size: 10px; font-weight: 700; font-family: var(--font-mono);">PHYSICAL PLAN</text>
<rect x="484" y="456" width="196" height="58" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<rect x="484" y="456" width="5" height="58" rx="2" style="fill: var(--opteryx-teal);"/>
<text x="500" y="480" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Catalogue</text>
<text x="500" y="499" style="fill: var(--muted); font-size: 11.5px;">schemas and statistics</text>
<text x="670" y="474" text-anchor="end" style="fill: var(--opteryx-teal); font-size: 9.5px; font-weight: 700; font-family: var(--font-mono);">CATALOGUE</text>
<path d="M582 456 V 430" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5;"/>
<polygon points="577,432 587,432 582,424" style="fill: var(--opteryx-teal);"/>
<text x="590" y="444" style="fill: var(--opteryx-teal); font-size: 10px; font-weight: 700; font-family: var(--font-mono);">SCHEMAS, STATS</text>
<rect x="256" y="140" width="12" height="12" rx="2" style="fill: var(--opteryx-navy);"/>
<text x="276" y="150" style="fill: var(--text); font-size: 11.5px;">Python: plans and decides</text>
<rect x="256" y="162" width="12" height="12" rx="2" style="fill: var(--opteryx-orange);"/>
<text x="276" y="172" style="fill: var(--text); font-size: 11.5px;">Native: parses, and touches data</text>
<rect x="256" y="184" width="12" height="12" rx="2" style="fill: var(--opteryx-teal);"/>
<text x="276" y="194" style="fill: var(--text); font-size: 11.5px;">Catalogue: schemas and stats</text>
<text x="256" y="238" style="fill: var(--muted); font-size: 11.5px;">Python hands native code the</text>
<text x="256" y="254" style="fill: var(--muted); font-size: 11.5px;">physical plan exactly once.</text>
</svg>
</figure>

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

The contract between the two halves is the physical plan. Once it is built, the query is a native program — and the rest of these internals documents describe the machinery that runs it: the [file engine](rugo) that turns bytes into vectors, the [vector library](draken) those operators compute over, the [bytecode engine](bytecode-engine) that evaluates expressions, and the [file format](skene) the engine uses when it writes vectors back out for itself.
