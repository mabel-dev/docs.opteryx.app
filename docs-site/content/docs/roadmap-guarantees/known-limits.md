---
title: Known Limits - Architectural and Feature Gaps in Opteryx
description: The architectural and feature-level gaps in Opteryx, as distinct from the numeric limits the engine enforces at query time.
---

# Known Limits

This page covers the architectural and feature-level gaps worth knowing before you commit to Opteryx — the things a query can't do because of how the engine is built, not because of a bug. For numeric ceilings the engine enforces at query time (result size, `DECIMAL` precision, `ARRAY_AGG` group size), see [Limits](/docs/reference/sql/limits) instead. For the full picture of what's supported at all, see [Compatibility](compatibility) and [SQL Conformance](/docs/reference/sql/conformance).

## Single-node only

Opteryx scales up, not out. It runs as one process on one machine — there is no distributed execution, no shuffle across workers, and no cluster to add capacity to. The work that goes into handling larger datasets is single-process efficiency (vectorised operators, pushdown, careful memory management), not a distributed runtime. If a dataset genuinely exceeds what one machine can hold, the fix is a smaller working set or a different engine, not more tuning. See [When to Use Opteryx](/docs/introduction/when-to-use) for where that line sits.

## Not a transactional store

There is no `COMMIT`, `ROLLBACK`, `SET TRANSACTION`, or isolation level — a query reads the snapshot it resolves at plan time. Each statement is its own atomic commit and there is no way to group several into one. `INSERT` is experimental and limited to some storage backends; `UPDATE`, `DELETE` and `MERGE` are experimental and need a catalog-backed table. There is no locking: a write built against a version of a table that another writer has since replaced is refused, not queued or retried. Integrity constraints (`PRIMARY KEY`, `FOREIGN KEY`, `CHECK`, `UNIQUE`) are accepted in `CREATE TABLE` syntax but not enforced. See [SQL Conformance](/docs/reference/sql/conformance) for the complete statement-by-statement breakdown.

## Storage and file formats

- **Storage backends**: local disk, Google Cloud Storage, Amazon S3, and plain HTTP(S) are implemented. Azure Blob Storage and MinIO are not — despite references to them in test configuration, there is no corresponding connector.
- **File formats**: Parquet, JSONL, and Skene (the engine's own native format) are supported as dataset formats; CSV is queryable through `READ_CSV` but is not a dataset format. ORC and Avro are not supported at all.

See [Compatibility](compatibility) for the full list, including platform and Python version support.

## SQL features not implemented

- `GROUPING SETS` and `CUBE` — `ROLLUP` is the supported `GROUP BY` grouping construct
- `WITH RECURSIVE`
- `WITH TIME ZONE` — timestamps carry no zone
- `RIGHT SEMI` / `RIGHT ANTI` joins — swap the relation order and use `LEFT SEMI` / `LEFT ANTI` instead
- Cursors (`DECLARE CURSOR`, `FETCH`) — results stream to the client as morsels instead
- `GRANT` / `REVOKE` — access is governed by connection-level policies instead

## Not a server by itself

Opteryx Core is an in-process library, not a service — there's no REST, GraphQL, or gRPC server, and no Docker image, Helm chart, or Kubernetes manifests shipped with the project. The hosted [opteryx.app](https://opteryx.app) provides a server surface (Jobs API, OData, Arrow Flight SQL) separately, if that's what you need instead of embedding the engine.

## Related

- [Compatibility](compatibility) — verified Python versions, platforms, storage backends, and file formats
- [Limits](/docs/reference/sql/limits) — numeric ceilings enforced at query time
- [SQL Conformance](/docs/reference/sql/conformance) — feature-by-feature SQL-92 support
- [When to Use Opteryx](/docs/introduction/when-to-use)
