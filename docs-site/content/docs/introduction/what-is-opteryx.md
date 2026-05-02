# What is Opteryx

Opteryx is an open-source SQL query engine for analytics. It runs as a Python library — `pip install opteryx` and you have a full SQL engine in your process — and is built to query data where it already lives: Parquet files on object storage, local files, and a range of other sources, without copying it into a warehouse first.

## Overview

Opteryx sits in the same conceptual space as DuckDB or Trino: an analytical (OLAP) engine that reads columnar data and runs SQL over it. It is not a database — there is no server, no storage layer of its own, and nothing to administer. You point it at data, hand it a query, and it returns results.

The design target is the kind of workload that used to require spinning up a cluster: tens or hundreds of millions of rows, columnar files in object storage, and ad-hoc analytical SQL. Opteryx aims to make that runnable from a laptop or a single cloud worker, with cold-query performance close enough to a warehouse that the trip to a warehouse often isn't worth it.

## Key Characteristics

### Performance

The execution engine is vectorised — it processes data in batches of values rather than row-by-row — and the I/O layer is built around the structure of the files it reads. For Parquet on object storage that means scheduling fine-grained byte-range reads against column-chunk metadata and pipelining reads, decompression, and decoding so the engine isn't sitting idle waiting for bytes.

The internal memory model is purpose-built for the engine rather than borrowed from a general-purpose interchange format, which keeps hot-path costs (allocations, copies, format conversions) low.

### Flexibility

Opteryx queries data across a range of sources from a single SQL surface:

- Parquet, ORC, CSV, JSONL, and Arrow files
- Object storage (Google Cloud Storage, S3, MinIO) and local disk
- In-process Python data structures (lists of dicts, pandas, Polars, PyArrow)
- A growing set of operational stores accessed through connectors

The same query can join across sources — for example, a Parquet dataset on GCS against a dictionary held in Python — without staging the data anywhere first.

### Scalability

Scale here means *up*, not *out*. Opteryx is single-node by design: one process, on whatever machine you have. The work to handle larger datasets has gone into making that single process efficient — vectorised operators, predicate and projection pushdown, careful memory management — rather than into a distributed runtime.

In practice that covers a wide band of workloads. When it doesn't, the right answer is usually a different engine, not a bigger Opteryx.

## Use Cases

Opteryx is a good fit for:

- **Ad-hoc analysis** over datasets that are too large to load into pandas but don't justify a warehouse.
- **Embedded analytics** inside Python applications and notebooks, where shipping a SQL engine alongside the app is simpler than calling out to one.
- **Data lake querying** — running SQL directly against Parquet on object storage without an intermediate ETL step.
- **Lightweight serving** of analytical results from a single process, particularly where startup cost and operational overhead matter.

For a more detailed breakdown of where Opteryx does and doesn't fit, see [When to Use Opteryx](when-to-use).

## Architecture Overview

A query in Opteryx moves through four broad stages:

1. **Parsing and planning** — SQL is parsed into a logical plan describing what to compute.
2. **Optimisation** — the plan is rewritten by a series of rules (predicate pushdown, projection pruning, constant folding, and others) to do less work.
3. **Execution** — the optimised plan runs as a pipeline of vectorised operators that pass batches of columnar data between stages.
4. **I/O** — readers fetch only the column chunks and row groups the query actually needs, in parallel with execution.

Each stage is covered in more detail under [Architecture](../architecture/planner) and [Core Concepts](../core-concepts/execution-model).
