---
title: Iceberg Support — The Catalog Was the Only Piece Missing
description: Opteryx can now query external Apache Iceberg tables. Almost none of the engine had to change, which is exactly why an Iceberg table gets the whole engine on day one — pruning, pushdown, cross-catalog joins, access control and all.
date: 2026-08-23
author: Justin Joyce
role: Opteryx Engineering
tags:
  - iceberg
  - catalog
  - storage
  - query-planning
  - interoperability
---

# Iceberg Support — The Catalog Was the Only Piece Missing

## TL;DR

* Opteryx reads external Apache Iceberg tables. Register a workspace against any catalog `pyiceberg` can load — REST, SQL, Hive, Glue, BigLake — and query it with plain SQL.
* This is a new sibling package, `opteryx-iceberg`, implementing `Metastore`/`Dataset`/`FileIO`. Zero changes to the execution engine. The engine never learns what Iceberg is.
* Because it plugs in at the catalog seam, an Iceberg table immediately gets everything the engine already does: manifest-bound file pruning, projection and predicate pushdown into rugo's Parquet reader, bytecode expression evaluation, the full type system, every access surface.
* The one that actually changes what you can ask: **you can join an Iceberg table to a native Opteryx table in a single query.** No export, no copy, no second engine.
* Tier 1 is read-only. Writes are Tier 2; serving Opteryx's own catalog as an Iceberg REST endpoint is Tier 3.

---

## Why this was small

The interesting thing about adding Iceberg support was how little of it was Iceberg work.

Opteryx's query planner does not know where a table's metadata came from. It asks a catalog for a schema, and it asks for a list of datafiles with per-file statistics — path, record count, size, and the min/max/null-count bounds it prunes with. That's the contract. `FileEntry.from_datafile` on the core side was, if anything, already written in the shape of an Iceberg `DataFile`.

And the routing seam existed too. `register_workspace(prefix, OpteryxConnector, catalog=...)` has been in the connector API for a while, previously exercised only by tests. Pointing a workspace at a different metastore implementation needed no new mechanism at all:

~~~python
from opteryx.connectors import register_workspace
from opteryx.connectors.opteryx_connector import OpteryxConnector
from opteryx_iceberg import IcebergMetastore

register_workspace(
    "tarchia",
    OpteryxConnector,
    catalog=IcebergMetastore,
    catalog_type="rest",
    uri="https://biglake.googleapis.com/iceberg/v1/restcatalog",
    warehouse="bl://projects/<project>/catalogs/<catalog>",
    auth={"type": "google", "google": {"scopes": ["https://www.googleapis.com/auth/cloud-platform"]}},
)
~~~

After that, `SELECT * FROM tarchia.interop_ns.people` is a query like any other.

The whole package is about 430 lines: translate Iceberg types to Opteryx types, decode manifest bounds from their binary encoding, and rewrite `file://` URIs into paths the reader can open. Everything else is the engine that was already there.

It lives in its own package deliberately. `pyiceberg` pulls in `pyarrow` and `pydantic`; `opteryx-core` and `opteryx-catalog` are free of that dependency chain by design, and Iceberg support is optional in exactly the way `opteryx-access` is.

---

## What an Iceberg table gets for free

This is the part worth dwelling on. Every feature below was built for native tables and applies to Iceberg tables without a line of Iceberg-specific code.

### File pruning from Iceberg's own manifests

Iceberg manifests already carry `lower_bounds`, `upper_bounds` and `null_value_counts` per datafile. Opteryx's pruner already wants exactly those. We decode them and hand them over, and predicate-driven file elimination works on the first query — the same code path that prunes native tables.

That includes the type-aware tricks. A literal CIDR predicate like `ip <<= '10.0.0.0/8'` is rewritten at plan time into a `BETWEEN` over the underlying `UINT32`, so it prunes at the scan. Nothing about that rewrite cares whose manifest supplied the bounds.

### Pushdown into a Parquet reader we own

Iceberg datafiles are Parquet, and Opteryx reads Parquet with rugo, not PyArrow. Column projection and predicate pushdown mean the columns a query doesn't reference are never decoded and row groups that can't match are never touched. An Iceberg table read through Opteryx goes through the same I/O stack as everything else, with the same memory behaviour — which is what makes reading these tables viable on a Cloud Run instance, or a Raspberry Pi, rather than a cluster.

### The rest of the engine, unchanged

Bytecode expression evaluation, hash-based aggregates, the sort and join operators, the type system with its `IPV4` and temporal types, `DESCRIBE` and `information_schema` introspection. All of it operates on morsels that arrived from a scan; none of it asks where the scan's file list came from.

### Every access surface

A workspace is a workspace. Once registered, the Iceberg tables show up through the SQL API, OData, Flight, the SQLAlchemy dialect and the UI, with no per-surface work.

### Access control at the same boundary

`opteryx-access` applies to a workspace, not to a storage format. Iceberg-backed tables sit behind the same permission model as native ones — which matters, because "we have an Iceberg lake and no way to give people scoped read access to it" is a common shape of problem.

### Snapshot pinning

Iceberg's snapshot lineage is exposed through the dataset interface, so a scan can be pinned to a specific `snapshot_id` rather than always taking the current one. The mechanics of time travel are there; the SQL surface for it is the obvious next thing to wire up.

---

## The join is the point

Everything above is leverage. This is the capability that didn't exist before in any form:

~~~sql
SELECT
    u.tenant,
    COUNT(*) AS events,
    APPROX_COUNT_DISTINCT(e.session_id) AS sessions
FROM tarchia.analytics.events AS e
INNER JOIN mabel_data.reference.tenants AS u
    ON e.tenant_id = u.id
WHERE e.event_date > CURRENT_DATE - INTERVAL '7' DAY
GROUP BY u.tenant
~~~

`e` comes from an external Iceberg catalog. `u` comes from a native Opteryx workspace. The planner builds one plan across both, prunes both sides using each catalog's own statistics, and executes it in one process.

The usual answer to this question is a copy job — export the Iceberg table somewhere the other engine can see it, on a schedule, and accept the staleness and the storage bill. Being a metastore implementation rather than an ingestion path means there is no copy and nothing to keep in sync.

---

## What it doesn't do yet

Being honest about the edges, because they're real:

* **Read-only.** `CREATE`, `DROP`, `ALTER`, `INSERT` and rename all raise `NotImplementedError`. Writing real Iceberg — Avro manifests, manifest lists, atomic `metadata.json` commits — is Tier 2.
* **No nested types.** Struct, map and list columns raise rather than being silently flattened into `VARCHAR`. Primitives, decimals, dates, timestamps and UUIDs are mapped.
* **No sketch statistics.** Opteryx's native manifests carry KMV hashes and histograms that the cost estimator uses for cardinality estimation. The Iceberg spec has no field to hold them, so estimation for Iceberg tables falls back to bounds and record counts. It's a worse estimate, not a wrong answer — and Puffin files are the intended fix, in Tier 2.
* **A sharp edge with SQL catalogs.** For `catalog_type="sql"`, pyiceberg stores its catalog *name* in the metadata rows and filters on it, so the workspace prefix you register must match the catalog name the tables were written under. Get it wrong and lookups fail as `DatasetNotFound`, exactly as if the table didn't exist. REST, Hive and Glue don't have this problem — the name is a local label there.

---

## Where this goes

Tier 1 is the read path, and it's live: `worker.opteryx` depends on `opteryx-iceberg` as a real published dependency, with a `tarchia` workspace registered alongside the native one, verified against a real BigLake REST catalog in production.

Tier 2 is writing genuine Iceberg tables from Opteryx, including Puffin sketch files so the cost estimator gets its statistics back. Tier 3 is the mirror image of this post: serving Opteryx's own catalog *as* an Iceberg REST endpoint, so other engines can read Opteryx tables the same way Opteryx now reads theirs.

The pattern holds in both directions. Formats are a catalog concern. Keep the engine out of it, and support for a new one costs a few hundred lines and buys you everything the engine could already do.
