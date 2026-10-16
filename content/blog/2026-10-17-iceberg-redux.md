---
title: Iceberg Redux
description: Opteryx's catalog started life as an Apache Iceberg catalog, then grew away from the format. Here's why it diverged, what we had to change to read Iceberg tables again, and how native Avro reading (and now writing) in Rugo made the integration fast.
date: 2026-10-17
author: Justin Joyce
role: Opteryx Engineering
tags:
  - iceberg
  - catalog
  - avro
  - rugo
  - interoperability
---

# Iceberg Redux

## TL;DR

* [Opteryx](https://opteryx.app)'s catalog began, in December 2025, as an [Apache Iceberg](https://iceberg.apache.org/) catalog. Within a month it had stopped writing Iceberg's metadata. Planning was faster from our own manifests, and we wanted statistics and commit records the format has no room for.
* In August we added Iceberg support back, as something Opteryx *reads*, not as its storage format. It plugs in as a metastore: about 360 lines at first, and the engine never learns what Iceberg is.
* "The engine never learns" turned out to need care at the seam. The hardest part was column bounds. Opteryx stores them as sort keys and Iceberg stores real values, and mixing the two up gave silently wrong answers.
* Since then the integration has moved off general-purpose code and onto our own. Metadata comes through Opteryx's storage client, and manifests are decoded by [Rugo](https://rugo.dev)'s native Avro reader. Building a snapshot's file list is **4× to 7× faster**. Rugo also now *writes* Avro, between 48× and 206× faster than fastavro uncompressed.

## We started as an Iceberg catalog

The first commit of what became `opteryx-catalog` is dated 5 December 2025. It was a package called `pyiceberg-firestore-gcs`: a PyIceberg catalog that kept its pointers in Firestore and its files in Google Cloud Storage. The engine had an Iceberg connector to read from it.

That was the obvious choice. Iceberg is the open standard for tables on object storage, PyIceberg does the bookkeeping, and every other engine can read the result.

It didn't last a month.

## Why the catalog diverged

The first crack was planning speed. Before an engine reads any row of an Iceberg table, it reads the snapshot's manifest list and every manifest. Those are Avro files, and PyIceberg turned each entry into a Python object. Opteryx already had a fast Parquet reader. So on 15 December the catalog started writing a Parquet manifest *alongside* Iceberg's Avro ones, and planning read the Parquet.

Two weeks later, writing both was the slow part. A flag made the Iceberg files optional. Then on 28 December they came out of the hot path completely. The next day PyIceberg was removed as a dependency. On 30 December the package was renamed `opteryx-catalog`. Its README now says it's *modelled after* Iceberg, but is **not compatible** with it.

Once the manifest was ours, we kept finding things to put in it that Iceberg has no field for:

- **Statistics the cost model uses.** Per file and per column: KMV sketches for distinct counts, histograms, character-class counts for estimating `LIKE` selectivity, and min/max string lengths. Iceberg stores bounds and null counts. That's enough to prune files, but not enough to [estimate how many rows a filter keeps](/blog/2026-07-31-magic-numbers).
- **Commit records people can read.** Every native snapshot records an author, a commit message, and whether a person or a background job made it. Iceberg records none of those.
- **Commits that fit our storage.** Iceberg commits by atomically swapping a `metadata.json` pointer. Ours is a Firestore transaction that moves the snapshot pointer only if nobody else moved it first.
- **Our own rules elsewhere.** Tag names are identifiers. Merge-on-read deletes are designed around manifests that are rewritten in full, which removes the hardest part of Iceberg's approach. Views, triggers, materialized views and webhooks all hang off the catalog.

None of that is a criticism of Iceberg. A format that every engine can read has to settle on what every engine agrees on. We needed things only Opteryx would use, so we stopped claiming to be compatible, and the in-engine Iceberg connector was deleted in January.

That left a real gap. A lot of the data people want to query lives in Iceberg tables that something else maintains. "Query your data where it lives" doesn't hold if one of the main places it lives is off-limits.

## Iceberg comes back, as a metastore

The Opteryx planner doesn't know where a table's metadata came from. It asks a metastore for a schema and for a list of data files, each with a path, a row count, a size and per-column bounds. A workspace prefix can be bound to any metastore.

So in August, Iceberg came back as one more metastore, in its own package. On 19 August `opteryx-iceberg` 0.1.0 shipped, at 363 lines:

~~~python
register_workspace(
    "lake",
    OpteryxConnector,
    catalog=IcebergMetastore,
    catalog_type="rest",
    uri="https://catalog.example.com",
    warehouse="analytics",
)
~~~

PyIceberg is the catalog client, and Opteryx does everything after the catalog lookup. An Iceberg table gets the same pruning, Parquet reader, expression engine, access control and query surfaces as a native one. It can also be joined to one in the same query. Keeping it in a separate package means `opteryx-core` still installs with no dependencies.

That was the plan, anyway. Most of what followed was finding the places where "the engine never learns what Iceberg is" wasn't quite true.

## What did have to change

### Bounds: the same field, a different meaning

This was the one that mattered.

Opteryx's manifests don't store a column's min and max as values. They store them as **ordinal keys**: 64-bit integers that sort in the same order as the values. That makes pruning cheap, because every type compares as an integer. For signed integers the key is the value itself. For a float, it's an order-preserving bit transform, so 0.5 becomes 4602678819172646912.

Iceberg stores real values. The early `opteryx-iceberg` passed them through as real values, and the engine assumed every bound was an ordinal key. Integer columns looked fine, because the transform is the identity for them. Float columns didn't. The predicate's literal was turned into an ordinal key and compared against a real value, and the comment on the fix records the result: `WHERE <double col> >= 250.0` pruned every file and returned **zero rows**. No error and no warning, just a wrong answer.

The fix was a contract, not a patch. Every dataset now has to declare `bounds_are_ordinal`. If it doesn't declare it, the read is an error rather than a guess, because either guess can be silently wrong. The engine passes the declaration to the pruner, which decides whether to translate literals.

Later we went further. On 5 October we ruled that every backend serves Opteryx's own manifest format, `opteryx-iceberg` included, so there's one planning path, not two. Iceberg's bounds are now decoded natively from their binary encoding (`iceberg_bounds.hpp`, following Appendix D of the spec) straight into the same ordinal keys native tables use. Strings get an 8-byte prefix key, decimals are read big-endian, and anything we can't encode exactly, such as 128-bit decimals, is refused rather than approximated.

### A listing is not a table

For Studio and OData to show an Iceberg workspace's tables, the catalog keeps a projected listing of them: names, schemas and some statistics.

On 12 October, every Iceberg `SELECT` in production returned nothing. Relation resolution prefetches a catalog record for each table it binds, to save a lookup. For a native table, that record *is* the table. For an Iceberg table, it was the listing: no snapshot and no files. The engine bound it as the relation and scanned an empty table.

The fix was another declaration. A metastore now says whether its catalog records can be read as the relation (`serves_catalog_records`). For Iceberg the answer is no, so the table always loads from the Iceberg catalog. It's an easy bug to write and a hard one to see. Nothing failed: the queries ran, quickly, against an empty table.

### Smaller changes

- **Type widths.** The first releases mapped Iceberg's 32-bit `int` and `float` to Opteryx's 64-bit types. They're mapped to the matching widths now.
- **Missing sketches.** The cost estimator warns when a manifest has no sketches and suggests upgrading the catalog. For Iceberg that advice is wrong, because the format can't carry them, so the message is quieter there. Estimates fall back to bounds and row counts: sometimes a worse plan, never a wrong answer.
- **Forks.** Native tables can be forked. An Iceberg table's files expire under the Iceberg catalog's own rules, which know nothing about our forks, so Iceberg tables say they don't support forking.
- **Bindings and secrets.** On the hosted service, a workspace can be bound to an Iceberg catalog with a stored credential that's envelope-encrypted with KMS and decrypted only by the worker at query time.

Each of these is small. Together they're most of what "plugging in at the catalog seam" really costs. The seam held, but every assumption on either side of it had to be written down.

## Making it fast

The first version was correct and slow to plan. Two pieces of PyIceberg sat on the hot path: its file IO for reading metadata, and its planner for turning manifests into a file list.

### Metadata through our own client

PyIceberg's file IO sent a `HEAD` before every `GET`, opened its own set of connections, and needed PyArrow at runtime. Since September, metadata files, manifest lists and manifests come through the same storage client that reads the data. Each is one `GET` with no `HEAD`, over connections that are already open.

That client takes its identity from the process, which brought a rule: if the catalog's settings name a different S3 endpoint or access key, or hand out a GCS token, the read is refused. We'd rather fail than read a table under an identity you didn't intend.

### A native Avro reader

That left the planner, and the manifests are Avro. In Python, every Avro reader we tried returns a dictionary per record, and PyArrow doesn't read Avro at all. So we [wrote a reader in Rugo](/blog/2026-10-11-avro-reader). It compiles the schema once per file, skips fields you didn't ask for without decoding them, and writes values straight into columns.

On 11 October `opteryx-iceberg` stopped calling PyIceberg's planner and started decoding manifests with Rugo, in parallel. Building a snapshot's file list went from 56.6 ms to 14.0 ms on a table with 100 manifests, and from 101.8 ms to 14.4 ms on one with a single 2,000-file manifest. Our local Iceberg benchmarks ran 25% faster end to end.

It makes the same decisions PyIceberg's planner does: which entries are live, which sequence numbers apply, and which delete files touch which data files. It's tested file by file against PyIceberg's planner on v1 and v2 tables, partitioned and unpartitioned, and a v1 table upgraded to v2.

The reader didn't stay an Iceberg detail. It's also `READ_AVRO` in Opteryx, so Kafka Connect output in a bucket can be queried with SQL. It's `rugo.avro` in Python too, about 8× faster than fastavro.

### And now a writer

Rugo now writes Avro too, from 0.5.4:

~~~python
from rugo import avro

data = avro.write_avro(morsel, codec="zstandard")   # bytes

with open("events.avro", "wb") as f:                 # or stream batch by batch
    with avro.open_avro_writer(f.write, codec="deflate") as writer:
        for batch in batches:
            writer.write_batch(batch)
~~~

Avro is row-oriented, and Rugo's data is columnar, so the writer encodes one column at a time. A first pass measures every row, a prefix sum places each row in an exactly sized buffer, and a second pass fills it. Blocks are encoded and compressed in parallel, and the output is byte-for-byte the same whatever the thread count. Every file it writes is read back by fastavro, by Apache's own `avro` package and by Rugo's reader, and compared value for value.

Writing 200,000 event rows of 20 fields (medians, Apple M-series):

| Codec | Rugo, all cores | Rugo, 1 thread | fastavro | Apache `avro` |
|---|---|---|---|---|
| none | 5.2 ms | 22.5 ms | 1,070.7 ms | 7,362.9 ms |
| deflate | 34.2 ms | 357.6 ms | 1,634.3 ms | 8,188.3 ms |
| zstandard | 13.9 ms | 120.3 ms | 1,174.5 ms | 7,683.6 ms |

On one thread, that's 4.6× to 48× faster than fastavro, depending on the codec. On every core, it's 48× to 206×. The comparison isn't perfect: fastavro and `avro` start from a list of dictionaries, which is their natural input, and Rugo starts from columns. Neither input's construction is timed.

To be clear about scope: the writer was built so the `rugo` package reads *and* writes every format it handles, not for Iceberg. Opteryx doesn't write Iceberg tables. But Iceberg's manifests are Avro, so it's the piece a write path would need first.

## How we test it

There are four layers, because each one catches something the others can't:

- **Against PyIceberg's planner.** As above, the file list Opteryx builds is compared, file by file, with the one PyIceberg builds, on every table shape we have.
- **Against real catalogs.** We run two standing catalogs, which cover the two ways a catalog authenticates. An Apache Polaris instance uses an OAuth2 client secret that we can revoke and rotate. That's the only way to prove a stored credential fails cleanly when it should. A Google BigLake catalog uses ambient Google identity.
- **In the lab, on MinIO AIStor.** We've added a suite of Iceberg tests to our in-lab performance suite. It runs against AIStor Tables, the Iceberg REST catalog built into [MinIO AIStor](https://www.min.io/product/aistor), on a single node. TPC-H, TPC-DS, ClickBench, H2O and the Join Order Benchmark all run as Iceberg tables. They're built from the same Parquet files our local runs read, registered with PyIceberg's `add_files` rather than rewritten, so any difference from a local run comes from the remote path. ClickBench also runs through DuckDB's `iceberg_scan` against the same tables, so we compare on identical data. Every run is kept by commit, so when the remote path slows down, we can find the change that did it.
- **On every CI build, against hadro.** The S3 client is tested against [hadro](https://github.com/mabel-dev/hadro), our small S3-compatible server, with SigV4 signatures checked. Every `s3://` result is compared with the same query over the same bytes on local disk. hadro can also add latency and cap bandwidth. That's how the [cap on bytes in flight](/blog/2026-10-01-hadro), which keeps wide scans from timing out on slow links, stays covered by a regression test.

The [Querying Iceberg](/docs/guides/querying-iceberg) guide is the result of those tests: the setup, end to end, using AIStor for its examples.

## What it doesn't do yet

These are real limits, and it's better that you hear about them from us first:

* **Read-only.** Writing real Iceberg tables, and serving Opteryx's own catalog as an Iceberg REST endpoint, are both later work, and neither has started.
* **No merge-on-read deletes.** A table with delete files is refused, at exactly the point PyIceberg would attach a delete. Reading it without applying them would return deleted rows as live data. PyIceberg never writes delete files, but Spark, Flink and Trino can, so this is the limit you're most likely to hit on a table one of them wrote.
* **No nested types.** A table with any `struct`, `map` or `list` column is refused, even for a query that only touches its other columns.
* **Weaker estimates.** Without sketches, row-count estimates for Iceberg tables come from bounds and row counts alone.

## What we'd tell anyone doing the same

**A seam is only as good as its written-down assumptions.** The integration really did need almost no engine changes. Nearly every bug lived in something both sides assumed and neither said: what a bound means, and whether a catalog record is a table. Each fix was to make the assumption a declaration and to treat a missing one as an error.

**Silent wrong answers are the ones to hunt.** Both serious bugs returned results, not errors. Zero rows from a filter that should have matched, and an empty table from a query that should have scanned one, look exactly like data that isn't there. Our tests now compare against an independent oracle: PyIceberg's planner, local disk, or another engine on the same files.

**Interoperability doesn't require adopting the format.** Opteryx's catalog left Iceberg because it needed things the format can't hold. That didn't stop us reading Iceberg. It meant the reading had to happen at the catalog seam, where translating is cheap, rather than throughout the engine.

— Justin
