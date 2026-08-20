# Execution Model

Planning in Opteryx is Python; running the plan is native. This page covers what happens once the [planner](../architecture/planner) hands off a finished physical plan — the boundary is crossed exactly once, and the executor never calls back into Python planning logic.

For the complete pipeline diagram and the planning half, see [How Opteryx Plans and Runs a Query](/docs/reference/internals/engine-overview).

## The physical plan is the contract

The physical plan is a graph of native operators — a concrete scan, a specific join algorithm (hash, nested-loop, outer, cross, as-of, and others), an aggregate, a sort, a limit. Everything about *what* to run was decided during planning; nothing above that line is re-consulted at run time. Once the physical plan exists, the query is a native program.

## Morsels: how data moves

Data flows through the operators in **morsels** — batches of columnar [Draken](/docs/reference/internals/draken) vectors, rather than one row or one column at a time. The per-morsel drive loop, the operator pipeline, and dispatch all live in native code.

Working in batches rather than rows is what makes the engine vectorised: operators process a batch of values in one pass instead of interpreting an expression once per row.

## Serial paths and the scheduler

Not every statement needs the full machinery. Simple metadata and DDL statements take a serial path. Data pipelines — the queries that actually scan and transform rows — are driven by the native scheduler, which executes operators across worker threads with the GIL released, so native execution isn't serialised behind Python's interpreter lock.

## I/O is part of execution

Scans aren't a separate phase bolted onto the front of execution — they're operators like any other, scheduled by the same native runtime. For file-backed sources, the engine reads through [Rugo](/docs/reference/internals/rugo), its native file engine: fine-grained byte-range reads against column-chunk metadata, pipelined with decompression and decoding, so the engine isn't idle waiting for bytes it already knows it needs. Which column chunks and row groups get read at all was already narrowed down by projection and predicate pushdown during planning — see [The Planner](../architecture/planner).

## Getting results out

Results stream back to the caller as they're produced rather than materialising all at once. In the Python API this surfaces as morsels from `session.execute_to_morsels(...)`, which you can concatenate into a single Arrow table for results you know are small — see [Querying Local Data](/docs/guides/querying-local-data).

## Why native, why Python

Keeping planning in Python buys flexibility where it's cheap: the planner handles one query at a time, and clarity matters more than nanoseconds there. Keeping execution native buys speed where it counts: the engine may process billions of rows, so the per-row and per-morsel paths need to be tight, branch-predictable, and free of the interpreter and the GIL.
