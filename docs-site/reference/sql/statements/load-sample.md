---
title: LOAD SAMPLE Statement — Opteryx Reference
description: SQL LOAD SAMPLE statement syntax and examples for loading the TPC-H sample dataset into a collection in Opteryx
---

# LOAD SAMPLE

The `LOAD SAMPLE` statement copies a staged sample dataset into a collection, so there is
something real to query without finding, uploading and modelling data first.

The sample's files are **copied**, not referenced. What lands in the collection is an
ordinary dataset: you own the bytes, you are billed for them, and you can query, compact,
time-travel and drop them without any of that reaching the staged original every other
workspace loads from.

## Syntax

~~~sql
LOAD SAMPLE <sample> INTO <workspace>.<collection> [ AT SCALE <scale_factor> ];
~~~

## Parameters

- **`<sample>`** — the bundle to load. Naming one that is not staged is rejected when the
  query is planned, with the loadable samples listed in the error.
- **`<workspace>.<collection>`** — where the sample's tables are created. The name is
  always two parts: a sample is a *set* of tables, so it loads into a collection rather
  than to a table name. The collection must be **empty**; one that does not exist yet is
  created.
- **`AT SCALE <scale_factor>`** — which staged size to load. This takes a scale factor
  that has actually been staged, not an arbitrary number; omitting it loads the sample's
  default. Naming an unstaged scale is rejected at plan time, with the staged ones listed.

The clause is `AT SCALE` rather than a bare `AT` because `AT` directly after an object
name is the version space — see [Time Travel](timestamp-as-of).

## Examples

### Load the default scale factor
~~~sql
LOAD SAMPLE TPCH INTO personal.alice;
~~~

### Load a specific scale factor
~~~sql
LOAD SAMPLE TPCH INTO acme.tpch AT SCALE 0.1;
~~~

### Query what was loaded
~~~sql
SELECT n_name, SUM(l_extendedprice * (1 - l_discount)) AS revenue
  FROM acme.tpch.lineitem
 INNER JOIN acme.tpch.orders ON l_orderkey = o_orderkey
 INNER JOIN acme.tpch.customer ON o_custkey = c_custkey
 INNER JOIN acme.tpch.nation ON c_nationkey = n_nationkey
 GROUP BY n_name
 ORDER BY revenue DESC;
~~~

## Available samples

What is loadable is a property of the deployment, not of the engine — the bundles are
listed in a manifest beside the staged files, so a newly staged sample or scale factor
becomes loadable without an engine release.

On Opteryx Cloud one sample is staged:

| Sample | Tables | Scale factors |
|--------|--------|---------------|
| `TPCH` | `region`, `nation`, `supplier`, `customer`, `part`, `partsupp`, `orders`, `lineitem` | `0.01`, `0.1`, `1` (default), `5`, `10` |

The scale factor is TPC-H's own: scale 1 is roughly a gigabyte of source data, and each
table grows with it — `lineitem` holds about 6 million rows at scale 1 and 60 million at
scale 10. As stored, the bundles are about 3 MB, 25 MB, 270 MB, 1.4 GB and 2.9 GB
respectively. **You are billed for the storage**, as you would be for any other dataset, so
start small: scale `0.01` or `0.1` is enough to learn the schema and write queries against
it, and dropping the tables releases the storage.

## Notes

- Requires `writer` or `owner` on the target collection — the same tier as
  [CREATE TABLE](create-table). Your `personal.<username>` collection is somewhere you can
  always write.
- The collection must be empty. Loading into a collection that already holds tables or
  views would either collide with them or interleave the sample with your own data, so it
  is refused before anything is copied.
- Loading is a copy, not a query: no rows are read through the engine, and the files are
  copied within the storage layer whatever the scale factor. A large scale factor is still
  a lot of bytes to move, so it is not instant.
- To load the same sample again, or at a different scale, use a different collection — or
  [DROP TABLE](drop-table) each table and [DROP COLLECTION](drop-collection) first.
- Requires a connector with a catalog to register the datasets in, and a deployment that
  has staged sample bundles. Self-hosted deployments set `SAMPLE_DATA_LOCATION` to the
  storage prefix the bundles are staged under; without it the statement is refused at plan
  time rather than half-executed.

## See Also

- [CREATE COLLECTION](create-collection)
- [CREATE TABLE](create-table)
- [DROP COLLECTION](drop-collection)
- [Sample Data](../advanced/adv-sample-data)
