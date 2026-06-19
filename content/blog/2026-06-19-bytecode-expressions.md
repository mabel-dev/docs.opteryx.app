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
