---
title: From Tree-Walking to Bytecode — Expression Evaluation Redesigned
description: How Opteryx replaced a recursive expression evaluator with a three-layer bytecode system to remove Python overhead and unlock new optimizations.
date: 2026-06-19
author: Justin Joyce
role: Opteryx Engineering
tags:
  - performance
  - execution-engine
  - design
---

# From Tree-Walking to Bytecode — Expression Evaluation Redesigned

## TL;DR

* [Opteryx](https://opteryx.app)'s original expression evaluator was a tree-walker that re-resolved columns, operators, and functions on every batch — even though none of those change between batches.
* We replaced it with a three-layer pipeline: lower to C++, linearize to flat bytecode (resolving everything once at bind time), then execute with a simple stack machine.
* For pure-boolean predicates, the executor releases the GIL for the inner loop and operates on raw bitmaps.
* The bytecode surface also unlocks future optimizations that the tree-walker never could.

## The evaluator we had

Expression evaluation is the WHERE clause critical path. It runs against every row, every batch, every query.

Opteryx's original evaluator was a recursive tree-walker. On each batch, it would traverse the expression tree, dispatching each node to a Draken kernel. It was correct. It passed tests.

But it paid a hidden cost.

On every batch, the evaluator:

- Traversed the full tree to resolve column identities — even though those don't change between batches.
- Looked up operator strings (`"Eq"`, `"Gt"`, etc.) at evaluation time — even though the operator is fixed at bind time.
- Resolved function callables by walking the node tree — per batch, every time.
- Held the GIL throughout, because tree nodes are Python objects.

For a predicate like `event_time > '2024-01-01' AND region = 'us-east-1'`, the evaluator did identical work on batch 1 and batch 10,000.

Worse: no amount of optimisation underneath could fix this. The Python-shaped dispatch was the floor.

## The redesign

We replaced the tree-walker with a three-layer pipeline that separates *binding* from *execution*:

```
Python Node tree (from planner/binder)
         │
         ▼
  [Layer 1] C++ Arena
         │  lower() → C++ struct tree
         │
         ▼
  [Layer 2] Cython Linearizer
         │  build_bytecode() → flat bytecode array
         │
         ▼
  [Layer 3] Stack Machine
            execute_bytecode() → BoolVector
```

Each layer has one job. Work that can be done once moves left. The hot path moves right.

## Layer 1: Lower to C++

The first layer crosses the Python/C++ boundary once: it mirrors the Python Node tree into a C++ struct tree owned by an arena allocator.

After this step, the evaluator never touches Python Node objects again. The arena manages memory and keeps Python object lifetimes safe via strong references.

## Layer 2: Linearize to bytecode

This is where the real work happens.

The linearizer walks the lowered tree in postfix order and emits a flat array of typed instructions. Each instruction carries everything the executor will ever need — resolved once at bind time:

- Column identity and name encoded to bytes
- Operator strings converted to integer codes
- Function callables resolved from the selected overload
- Cast closures built and stored
- Temporal type flags pre-computed
- BETWEEN bounds extracted as literals

The linearizer also simulates the stack as it goes, computing the peak depth. The executor pre-allocates exactly that much space — no dynamic growth during execution.

<figure class="doc-figure">
<svg viewBox="0 0 680 239" width="100%" role="img" aria-labelledby="bytecode-linearize-title bytecode-linearize-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="bytecode-linearize-title">Linearizing an expression tree into bytecode</title>
<desc id="bytecode-linearize-desc">Left: the expression tree for event_time &gt; &#x27;2024-01-01&#x27; AND region = &#x27;us-east-1&#x27;, an AND node over a greater-than and an equals, each over a column and a literal, with nodes numbered in postfix order. Right: the seven instructions in that order, LOAD_COLUMN event_time, LOAD_LITERAL &#x27;2024-01-01&#x27;, COMPARE &gt;, LOAD_COLUMN region, LOAD_LITERAL &#x27;us-east-1&#x27;, COMPARE =, AND, with the stack depth after each: 1, 2, 1, 2, 3, 2, 1. The peak depth is 3.</desc>
<line x1="112.0" y1="52.0" x2="52.0" y2="98.0" style="stroke: var(--border-2); stroke-width: 1.25;"/>
<line x1="112.0" y1="52.0" x2="172.0" y2="98.0" style="stroke: var(--border-2); stroke-width: 1.25;"/>
<line x1="52.0" y1="122.0" x2="20.0" y2="168.0" style="stroke: var(--border-2); stroke-width: 1.25;"/>
<line x1="52.0" y1="122.0" x2="84.0" y2="168.0" style="stroke: var(--border-2); stroke-width: 1.25;"/>
<line x1="172.0" y1="122.0" x2="142.0" y2="168.0" style="stroke: var(--border-2); stroke-width: 1.25;"/>
<line x1="172.0" y1="122.0" x2="204.0" y2="168.0" style="stroke: var(--border-2); stroke-width: 1.25;"/>
<rect x="92.0" y="28.0" width="40.0" height="24.0" rx="12" style="fill: var(--surface); stroke: var(--opteryx-teal); stroke-width: 1;"/>
<text x="112.0" y="44.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">AND</text>
<circle cx="130.0" cy="27.0" r="7.5" style="fill: var(--opteryx-teal);"/>
<text x="130.0" y="30.5" text-anchor="middle" style="fill: var(--on-accent); font-size: 9.5px; font-weight: 700; font-family: var(--font-body);">7</text>
<rect x="32.0" y="98.0" width="40.0" height="24.0" rx="12" style="fill: var(--surface); stroke: var(--opteryx-teal); stroke-width: 1;"/>
<text x="52.0" y="114.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">&gt;</text>
<circle cx="70.0" cy="97.0" r="7.5" style="fill: var(--opteryx-teal);"/>
<text x="70.0" y="100.5" text-anchor="middle" style="fill: var(--on-accent); font-size: 9.5px; font-weight: 700; font-family: var(--font-body);">3</text>
<rect x="152.0" y="98.0" width="40.0" height="24.0" rx="12" style="fill: var(--surface); stroke: var(--opteryx-teal); stroke-width: 1;"/>
<text x="172.0" y="114.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 12px; font-weight: 600; font-family: var(--font-body);">=</text>
<circle cx="190.0" cy="97.0" r="7.5" style="fill: var(--opteryx-teal);"/>
<text x="190.0" y="100.5" text-anchor="middle" style="fill: var(--on-accent); font-size: 9.5px; font-weight: 700; font-family: var(--font-body);">6</text>
<rect x="-11.0" y="168.0" width="62.0" height="24.0" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="20.0" y="184.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 10.5px; font-family: var(--font-mono);">event_time</text>
<circle cx="49.0" cy="167.0" r="7.5" style="fill: var(--opteryx-teal);"/>
<text x="49.0" y="170.5" text-anchor="middle" style="fill: var(--on-accent); font-size: 9.5px; font-weight: 700; font-family: var(--font-body);">1</text>
<rect x="53.0" y="168.0" width="62.0" height="24.0" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="84.0" y="184.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 10.5px; font-family: var(--font-mono);">&#x27;2024-01-01&#x27;</text>
<circle cx="113.0" cy="167.0" r="7.5" style="fill: var(--opteryx-teal);"/>
<text x="113.0" y="170.5" text-anchor="middle" style="fill: var(--on-accent); font-size: 9.5px; font-weight: 700; font-family: var(--font-body);">2</text>
<rect x="111.0" y="168.0" width="62.0" height="24.0" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="142.0" y="184.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 10.5px; font-family: var(--font-mono);">region</text>
<circle cx="171.0" cy="167.0" r="7.5" style="fill: var(--opteryx-teal);"/>
<text x="171.0" y="170.5" text-anchor="middle" style="fill: var(--on-accent); font-size: 9.5px; font-weight: 700; font-family: var(--font-body);">4</text>
<rect x="173.0" y="168.0" width="62.0" height="24.0" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="204.0" y="184.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 10.5px; font-family: var(--font-mono);">&#x27;us-east-1&#x27;</text>
<circle cx="233.0" cy="167.0" r="7.5" style="fill: var(--opteryx-teal);"/>
<text x="233.0" y="170.5" text-anchor="middle" style="fill: var(--on-accent); font-size: 9.5px; font-weight: 700; font-family: var(--font-body);">5</text>
<text x="0.0" y="14.0" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Expression tree</text>
<text x="0.0" y="222.0" style="fill: var(--muted); font-size: 11px; font-family: var(--font-body);">Numbers are the postfix order</text>
<line x1="250.0" y1="112.0" x2="282.0" y2="112.0" style="stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="282.0,108.0 290.0,112.0 282.0,116.0" style="fill: var(--muted);"/>
<text x="306.0" y="14.0" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">Bytecode</text>
<text x="612.0" y="14.0" text-anchor="middle" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">stack</text>
<rect x="306.0" y="26.0" width="268.0" height="23.0" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="316.0" y="42.0" style="fill: var(--muted-2); font-size: 11px; font-family: var(--font-mono);">1</text>
<text x="336.0" y="42.0" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-mono);">LOAD_COLUMN</text>
<text x="456.0" y="42.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-mono);">event_time</text>
<rect x="588.0" y="30.0" width="14.0" height="15.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.55;"/>
<rect x="306.0" y="53.0" width="268.0" height="23.0" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="316.0" y="69.0" style="fill: var(--muted-2); font-size: 11px; font-family: var(--font-mono);">2</text>
<text x="336.0" y="69.0" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-mono);">LOAD_LITERAL</text>
<text x="456.0" y="69.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-mono);">&#x27;2024-01-01&#x27;</text>
<rect x="588.0" y="57.0" width="14.0" height="15.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.55;"/>
<rect x="605.0" y="57.0" width="14.0" height="15.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.55;"/>
<rect x="306.0" y="80.0" width="268.0" height="23.0" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="316.0" y="96.0" style="fill: var(--muted-2); font-size: 11px; font-family: var(--font-mono);">3</text>
<text x="336.0" y="96.0" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-mono);">COMPARE</text>
<text x="456.0" y="96.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-mono);">&gt;</text>
<rect x="588.0" y="84.0" width="14.0" height="15.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.55;"/>
<rect x="306.0" y="107.0" width="268.0" height="23.0" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="316.0" y="123.0" style="fill: var(--muted-2); font-size: 11px; font-family: var(--font-mono);">4</text>
<text x="336.0" y="123.0" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-mono);">LOAD_COLUMN</text>
<text x="456.0" y="123.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-mono);">region</text>
<rect x="588.0" y="111.0" width="14.0" height="15.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.55;"/>
<rect x="605.0" y="111.0" width="14.0" height="15.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.55;"/>
<rect x="306.0" y="134.0" width="268.0" height="23.0" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="316.0" y="150.0" style="fill: var(--muted-2); font-size: 11px; font-family: var(--font-mono);">5</text>
<text x="336.0" y="150.0" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-mono);">LOAD_LITERAL</text>
<text x="456.0" y="150.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-mono);">&#x27;us-east-1&#x27;</text>
<rect x="588.0" y="138.0" width="14.0" height="15.0" rx="2" style="fill: var(--opteryx-orange); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="605.0" y="138.0" width="14.0" height="15.0" rx="2" style="fill: var(--opteryx-orange); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="622.0" y="138.0" width="14.0" height="15.0" rx="2" style="fill: var(--opteryx-orange); stroke: none; stroke-width: 1; fill-opacity: 0.85;"/>
<rect x="306.0" y="161.0" width="268.0" height="23.0" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="316.0" y="177.0" style="fill: var(--muted-2); font-size: 11px; font-family: var(--font-mono);">6</text>
<text x="336.0" y="177.0" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-mono);">COMPARE</text>
<text x="456.0" y="177.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-mono);">=</text>
<rect x="588.0" y="165.0" width="14.0" height="15.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.55;"/>
<rect x="605.0" y="165.0" width="14.0" height="15.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.55;"/>
<rect x="306.0" y="188.0" width="268.0" height="23.0" rx="4" style="fill: var(--surface); stroke: var(--border-2); stroke-width: 1;"/>
<text x="316.0" y="204.0" style="fill: var(--muted-2); font-size: 11px; font-family: var(--font-mono);">7</text>
<text x="336.0" y="204.0" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-mono);">AND</text>
<text x="456.0" y="204.0" style="fill: var(--text); font-size: 11.5px; font-family: var(--font-mono);"></text>
<rect x="588.0" y="192.0" width="14.0" height="15.0" rx="2" style="fill: var(--opteryx-teal); stroke: none; stroke-width: 1; fill-opacity: 0.55;"/>
<text x="588.0" y="229.0" style="fill: var(--opteryx-orange); font-size: 11px; font-weight: 600; font-family: var(--font-body);">peak depth 3: allocated once, up front</text>
</svg>
<figcaption>The tree is walked once, at bind time. Instruction names are illustrative; the stack depth is what the linearizer computes to size the stack before execution.</figcaption>
</figure>

## Layer 3: Execute

The executor reads the flat instruction array in order and maintains a pre-allocated stack. No dictionary lookups. No string comparisons. No attribute resolution in the loop.

Opcodes are integers — the compiler turns the dispatch into a jump table. Operator codes are integers. Callable references are direct.

The bytecode has 17 native opcodes covering loads, boolean algebra, comparisons, arithmetic, functions, casts, and extractions.

There's also a `BC_LEGACY` opcode. When the linearizer hits a node type it doesn't yet handle natively (CASE expressions, currently), it emits `BC_LEGACY` carrying the original node. The executor calls the old tree-walker for just that subtree.

This is intentional, not silent. Every fallback is a visible opcode in the bytecode. As native opcodes are added, `BC_LEGACY` shrinks.

## The pure-bitmap fast path

Many analytical WHERE clauses are simple boolean algebra over columns:

- `active = true AND region = 'us-east-1'`
- `approved OR (trial_expired AND flagged)`

When the linearizer detects that a bytecode contains *only* boolean operations, it marks it as a pure-bitmap path.

For these, the executor:

1. Extracts raw bitmap pointers from each column (GIL held)
2. Enters a C inner loop with the GIL released — operating on raw byte buffers, no Python objects, no refcounting
3. Wraps the result back into a BoolVector (GIL held)

This covers a large fraction of real OLAP predicates. For those queries, the inner loop is 2–3× faster because zero Python bookkeeping happens during execution.

## The memory model

The bytecode stores raw Python object pointers — no reference counting in the hot path. This works because the bytecode holds a strong reference to every object any instruction might touch, for its entire lifetime. The executor never increfs or decrefs. The bytecode owns the objects.

Node type constants are compile-time values in both the linearizer and executor, folding to C-level integer comparisons and a jump table. An import-time assertion checks they match the `NodeType` enum — if they diverge, the module refuses to import rather than silently misevaluating.

## What didn't change

The planner and binder still produce Python Node trees. The operator API is unchanged — `filter.pyx` calls `lower()` and `build_bytecode()` once at bind time, then `execute_bytecode()` per batch. Code outside the evaluator boundary doesn't know bytecode exists.

There's a broader implication here. The planner is Python — with no plans to replace it - but the expressions it builds now execute entirely inside the native compiled engine. Complex predicates assembled in Python are lowered once and evaluated in C++, without Python re-entering the loop per batch. This is a step toward parallel query execution: when evaluation no longer depends on Python objects in the hot path, work can be dispatched across threads without GIL contention.

## What's next

The bytecode system isn’t the destination — it’s one part of a larger execution-engine rewrite.

The real goal is to make Opteryx less Python-shaped at runtime.

The planner and binder can stay in Python. They run once per query and they are not the bottleneck. The execution engine is different: it runs per batch, per operator, per row group, and eventually across many workers. That path needs to spend as little time in Python as possible.

Moving expression evaluation into bytecode gives us a cleaner boundary:

* Python builds the plan
* The plan is lowered once
* Execution runs against native structures
* Batch processing can move across threads without constantly re-entering Python
* The GIL stops being the thing that defines the shape of the engine

That is the important unlock.

This is not about making expression evaluation look more sophisticated. It is about making it less entangled with Python object graphs, recursive dispatch, and per-batch interpreter overhead.

The tree-walker was correct, but it kept Python in the hot path.

The bytecode removes it.

That’s why we built it.

-- Justin
