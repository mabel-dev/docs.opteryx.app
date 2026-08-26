# When to Use Opteryx

[What is Opteryx](what-is-opteryx) covers what the engine is; this page is about where it fits and where it doesn't.

## Good fits

- **Ad-hoc analysis over files** — SQL directly against Parquet, JSONL, or Skene datasets on local disk, GCS, or plain HTTP(S), without an ETL step to load them somewhere first. See [Querying Local Data](/docs/guides/querying-local-data).
- **Embedded analytics inside a Python process** — `pip install opteryx-core` gets you a full SQL engine in-process, with no server to run and no cluster to operate. See [Embedding in a Service](/docs/guides/embedding-in-a-service).
- **Read-heavy, analytical workloads** — wide scans, filters, joins, and aggregations over columnar data, where the win comes from reading less data rather than from a distributed shuffle. The engine is built around pushing predicates and projections into the scan; see [Troubleshooting Queries](/docs/guides/troubleshooting) for what that looks like in practice.
- **A dataset that fits on one machine** — the design target is up to hundreds of millions of rows on a single node, not a cluster-scale table.
- **Hosted, multi-tenant querying without embedding anything** — [opteryx.app](https://opteryx.app) runs the same engine as a service, reached through the [Jobs API](/docs/reference/api/jobs-api), [OData](/docs/guides/querying-via-odata), or [Arrow Flight SQL](/docs/guides/connecting-via-flight-sql), if you'd rather not run the engine yourself.

## Not a good fit

- **Data too large for one machine.** Opteryx is single-node by design — it scales up, not out. If a working set genuinely exceeds what one machine can hold, no amount of query tuning fixes that; the answer is a smaller working set or a different, distributed engine. See [Known Limits](/docs/roadmap-guarantees/known-limits).
- **Transactional or write-heavy workloads.** There is no `COMMIT`, `ROLLBACK`, or isolation level — a query reads the snapshot it resolves at plan time, and each statement commits on its own. `INSERT` is experimental and limited to some storage backends; `UPDATE`, `DELETE` and `MERGE` are experimental, need a catalog-backed table, and are refused rather than queued if another writer commits first. They are built for periodic corrections and feed merges, not for a stream of small concurrent writes. See [SQL Conformance](/docs/reference/sql/conformance) for the full statement-by-statement breakdown.
- **A system of record with enforced integrity constraints.** `PRIMARY KEY`, `FOREIGN KEY`, `CHECK`, and `UNIQUE` are not enforced by the engine.
- **Storage backends outside Parquet, JSONL, Skene, local disk, GCS, S3, and HTTP(S).** Azure Blob Storage, MinIO, ORC, and Avro are not implemented — see [Compatibility](/docs/roadmap-guarantees/compatibility).
- **A strict ANSI SQL, PostgreSQL, or MySQL dialect.** Opteryx parses its own dialect, close to but not identical to any of those — check syntax that leans on another engine's specifics before assuming it carries over.

## Still not sure?

- [Known Limits](/docs/roadmap-guarantees/known-limits) lists the specific architectural and feature gaps.
- [Troubleshooting Queries](/docs/guides/troubleshooting) covers the point at which a slow query stops being a tuning problem and becomes a "wrong tool" problem.
