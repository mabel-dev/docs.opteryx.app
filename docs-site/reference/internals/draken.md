# Draken — the vector library

Draken is the columnar vector library at the centre of Opteryx. Every column of data in the engine — whether freshly read from a file, produced by a join, or returned from an expression — is a Draken vector. It is the common currency that lets the scan, the operators, and the expression engine all speak the same language, across the Python, Cython, and C++ boundaries.

Draken has **zero external dependencies**, and it ships inside both the Opteryx SQL engine and the standalone [Rugo](rugo.md) file engine. It is never published on its own; it travels as part of whatever uses it.

---

## One vector, one access pattern

The core idea is that all columnar data is represented by a single struct, the **DrakenVector**, and every consumer reads it the same way. A vector pairs a buffer of values with a *selection* — a list of indices — and the value of logical row `i` is always `data[selection[i]]`. That one access pattern is the correctness contract: any kernel written against it produces the right answer for every vector it is handed.

This uniform access is what lets the same vector quietly carry three very different physical layouts — a fully materialised *dense* column, a *constant* broadcast of one value, or a *dictionary* of distinct values plus per-row codes — without operators needing to branch on which is which. That layout story is told in full in [Draken vector encoding](draken-vector-encoding.md), and the way strings in particular are stored has its own page in [Draken string storage](draken-german-strings.md).

The struct's memory layout is **frozen**: a large number of compiled call sites bind its field offsets at compile time, so the engine pins the layout with compile-time assertions. A silent reordering of its fields would not fail the build — it would corrupt data — so the layout is guarded rather than trusted.

---

## The type vocabulary

Each vector carries a type tag, and Draken's type enum is the single vocabulary used everywhere from schema to kernel. The families are:

- **Integers** — 8, 16, 32, and 64-bit, plus a fast `DECIMAL` backed by a 64-bit unscaled value (and a wider 128-bit decimal for the cases that need the precision).
- **Floating point** — 32 and 64-bit, with carefully defined NaN and signed-zero behaviour so that sorting and grouping are deterministic.
- **Temporal** — date, timestamp, time, and interval, with units (seconds through nanoseconds) carried alongside.
- **Boolean** — bit-packed.
- **Strings** — a small family rather than one type: `VARCHAR` (ASCII semantics), `NVARCHAR` (UTF-8, codepoint-aware), `VARBINARY` (opaque bytes), and `VARIANT` (a polymorphic JSON value). They share one storage format and differ only in how operators interpret the bytes.
- **Arrays** — variable-length lists of a child type.

Parameters that don't fit in a single tag — a decimal's precision and scale, a timestamp's unit, an embedding vector's dimension — live in a separate, interned *logical type* descriptor kept out of band, so the hot struct stays small and its layout stays frozen.

---

## The kernels

Computation lives in Draken's kernel layer: typed, native routines that take vectors in and produce a vector out. They are organised by what they do — comparisons, range and membership predicates, arithmetic (including decimal and temporal arithmetic), string operations, reductions (sum, min, max, any, all, count), bitwise and boolean logic, array operations, and type casts. Where a kernel needs more than trivial maths, Draken uses a vendored `boost::math` rather than reaching for an external library.

By default a kernel is written once, against the uniform `data[selection[i]]` access, and handles every shape correctly — there is no combinatorial explosion of one routine per layout combination. A small, deliberately-audited set of hot kernels (some comparisons, predicates, and arithmetic) carry shape-specialised fast paths — for instance, evaluating a predicate over a dictionary's distinct values once instead of once per row — but each such path must produce exactly the same answer as the uniform one. A fast path whose result differs is a bug, never an optimization.

Kernels output through a small ownership contract that makes clear who owns each buffer and who must free it, so results can be handed back across the C++/Python edge without copies or leaks.

---

## Crossing into Python

Draken is a C++ library first; Python is an edge, not the engine. A single native module exposes a thin `Vector` handle that wraps the underlying buffers with proper lifetime management — when the handle is dropped, the memory is freed. There is no Python object anywhere on the compute path between the edges, and no fallback to a non-native implementation: if something is wrong, it fails rather than silently degrading to slow Python.

Code that consumes Draken does so through a typed Cython surface and a small C++ bridge. The bridge distinguishes *borrowing* a vector (reading it while someone else owns it) from *owning* one (taking a freshly-built buffer and being responsible for it), which keeps ownership explicit at every hand-off.

---

## In short

Draken is the substrate everything else stands on: one frozen vector struct, one access pattern, one type vocabulary, and a native kernel library that computes over all of it. Rugo fills vectors from files; the [bytecode engine](bytecode-engine.md) evaluates expressions over them; the operators join, group, and sort them — but they all agree, because they all speak Draken.
