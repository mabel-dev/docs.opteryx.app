---
title: "DuckDB vs Opteryx: When Should You Use Each?"
subtitle: Two in-process analytical SQL engines, built around different defaults. How to tell which one your workload wants.
target: Medium
author: Justin Joyce
status: draft
---

<!--
Notes for publishing on Medium:
- Medium doesn't render Markdown tables. The table under "At a glance" needs to go in as an image (or a GitHub gist embed).
- Medium can't take relative links. All links below are absolute.
- Re-check the ClickBench positions on the live leaderboard the day this goes out. Entries get re-run and positions move.
- Suggested tags: DuckDB, SQL, Data Engineering, Python, Analytics.
-->

# DuckDB vs Opteryx: When Should You Use Each?

DuckDB is the engine that made "SQL in your process" normal for analytics. You `pip install duckdb`, point it at a Parquet file, and get an answer faster than a warehouse could warm up. It's excellent, and if you work with data in Python you've probably used it.

Opteryx sits in the same space. It's also an in-process, columnar, vectorised SQL engine you install with `pip`. So the fair question is: why would you use one over the other?

I work on Opteryx, so read this with that in mind. I've tried to be straight about where DuckDB is the better choice, because for a lot of workloads it is. The short version: **DuckDB is a database you can embed. Opteryx is a query engine that never wants to own your data.** Most of the decision follows from that.

## DuckDB: an embedded analytical database

DuckDB is a database in the full sense. It has its own storage format: a single file that holds tables, indexes and metadata. It supports ACID transactions, so you can `BEGIN`, write a batch of changes and `COMMIT` or `ROLLBACK` them together. It reads external files too (Parquet, CSV, JSON, and object storage through its `httpfs` extension), but the centre of gravity is the database file. You can load data in, keep it, and query it again tomorrow.

Around that core is a big ecosystem. There are clients for Python, R, Java, Node.js, Rust, Go and more. It builds for every major platform, Windows included, and it runs in the browser through WebAssembly. Extensions add spatial types, Iceberg and Delta Lake, PostgreSQL and MySQL scanners, full-text search and a lot else. The SQL dialect is broad and friendly, with conveniences like `GROUP BY ALL` and `SELECT * EXCLUDE`. If you need hosting, MotherDuck runs DuckDB as a service.

## Opteryx: a query engine for data where it already lives

Opteryx has no database file. There's nothing to create, load or keep in sync. You give it SQL, it reads the files or the source system directly, and it returns the result. Its tagline is "query your data, where it lives", and the whole design follows from that.

In practice, "where it lives" means Parquet, JSONL, CSV, Avro and ORC on local disk, S3 (and S3-compatible stores like MinIO), Google Cloud Storage or plain HTTPS; Apache Iceberg tables through REST, SQL, Hive or Glue catalogs; PostgreSQL (experimental); Firestore collections; and pandas, Polars or PyArrow dataframes in the same process. One query can join across them.

```python
import opteryx

session = opteryx.session()
for morsel in session.execute_to_morsels(
    "SELECT city, SUM(amount) AS total "
    "FROM READ_PARQUET('sales.parquet') "
    "GROUP BY city ORDER BY total DESC"
):
    for row in morsel:
        print(row.city, row.total)
```

The engine is a Python package. It plans the query in Python, then hands the plan to native code (C++, Cython and a little Rust), which runs it on worker threads with the interpreter lock released. The planner is in Python because that's where most of the decisions get made, and Python makes them quick to change and debug. The data never passes through Python.

There's also a hosted version, [opteryx.app](https://opteryx.app), that runs the same engine with a catalog, permissions, table snapshots and time travel, and APIs for tools that don't speak Python.

## Same idea, different defaults

Both engines are columnar and vectorised, and both run in your process with no server. Most of the differences come from one design choice. DuckDB defaults to *owning* the data: you can query files in place, but the best path is usually to load them into a DuckDB database. Opteryx defaults to *never owning it*: every query is stateless and reads from the source.

That choice shows up everywhere:

- **Storage.** DuckDB has a persistent, transactional storage format. Opteryx Core has none of its own. Catalog-backed tables, on the hosted service or in a local store, are Parquet files plus snapshot metadata, closer to Iceberg than to a database file.
- **Writes.** DuckDB handles `INSERT`, `UPDATE` and `DELETE` with real transactions. In Opteryx, writes are limited and mostly experimental. There's no `BEGIN` or `COMMIT`, each statement commits on its own, and a write that conflicts with another writer is refused. You undo changes by rolling a table back to an earlier snapshot, not by rolling back a transaction.
- **First query.** DuckDB is fastest once the data is in its own format. Opteryx skips the load step entirely: its ClickBench entry records a load time of zero. It makes up for that by reading less: it prunes columns, row groups and dictionary pages before it decodes anything.
- **Footprint.** Opteryx's file reader, Rugo, installs at 11.6 MB with no dependencies and imports in 30 ms ([rugo.dev](https://rugo.dev), measured August 2026). That matters in Lambda functions, containers and anything that starts cold.

## Performance

Benchmarks deserve scepticism, and that includes ours. So here's where things stood on [ClickBench](https://benchmark.clickhouse.com/), the 43-query analytics benchmark ClickHouse maintains, with machine, version and date for each result.

With the storage filter set to Parquet, on a small `c6a.large` (2 vCPU, 4 GB RAM), Opteryx 0.9.167 [ranked first of 41 entries](https://benchmark.clickhouse.com/#machine=+c6a.large&storage=+parquet&metric=combined) on the combined score, ahead of both DuckDB Parquet entries (14 October 2026). That needs three caveats:

1. That entry rewrites the Parquet files with Opteryx's own writer as its load step. The entry that reads the files as shipped came ninth on the same view.
2. The score is a geometric mean, which forgives being very slow on a few queries. On 4 GB of RAM, four heavy `GROUP BY` queries spill to swap and take between 16 and 51 minutes each in Opteryx. DuckDB finishes each of them in 21 to 31 seconds. **If your aggregations don't fit in memory, DuckDB handles that far better today.**
3. On bigger machines the order changes. On `c6a.4xlarge`, Opteryx is third among Parquet engines. On the largest metal instances it's eighth to tenth. DuckDB scales across many cores better.

Rough reading: on small machines, with selective queries over Parquet, Opteryx is competitive and sometimes ahead. On big machines, or with heavy aggregations that spill, DuckDB is usually faster. Run both on your own data before you trust anyone's chart. That goes for this one too.

## Scale and concurrency

Neither engine distributes work across machines. Both scale *up*: more cores and more memory on one node. If your working set really is bigger than one machine, you want a distributed engine, not either of these.

The concurrency story is different. A DuckDB database file has one writing process at a time; many readers are fine. Opteryx has no file to lock. Every query is a stateless read, so you can run as many processes as you like over the same files. On the hosted service, many users query the same tables, each with their own permissions.

## When to use DuckDB

- **You want a database, not only a query engine.** You load data once, keep it in a file, update it and query it again.
- **You need transactions.** Several writes that must succeed or fail together.
- **Your workloads are big or spill.** Large joins and aggregations that don't fit in memory, or very large machines you want to use fully.
- **You aren't working in Python,** or you need Windows, the browser (WASM), R, Java or Node.
- **You need breadth.** The widest SQL dialect, spatial types, full-text search, or one of the many extensions.
- **You want a large community.** More answers on Stack Overflow, more integrations, more people who've hit your problem first.

## When to use Opteryx

- **The data already lives somewhere, and you don't want a copy.** Parquet on S3 or GCS, Iceberg tables, a Firestore collection or a Postgres database, queried in place, with no load step and no copy to keep in sync.
- **Your processes are short-lived.** Lambda, Cloud Run, CI jobs, CLI tools: anywhere the cost of starting cold and the install size matter.
- **Your queries are selective.** Filters and projections that let pruning skip most of the file. That's where Opteryx gains most, and on the hosted service you pay for the bytes a query actually reads, so pruning lowers the bill too.
- **You want it hosted, with governance included.** opteryx.app adds a catalog, per-table permissions, snapshots, time travel and branching. You can reach it over [OData](https://docs.opteryx.app/docs/guides/querying-via-odata) from Excel and Power BI with no driver, over Arrow Flight SQL, or from an AI assistant over MCP.
- **You want the same SQL in both places.** `pip install opteryx-core` on a laptop and the hosted service run the same engine.

## When it doesn't matter much

For a lot of everyday work, such as a few hundred MB of Parquet on a laptop and ad-hoc `GROUP BY`s in a notebook, both engines will answer in well under a second. Pick the one whose API you like, or the one your team already uses. The differences above start to matter at the edges: big aggregations, cold starts, data you can't or won't copy, and workloads with many users.

## At a glance

| | DuckDB | Opteryx |
| --- | --- | --- |
| What it is | Embedded analytical database | Embedded query engine (plus a hosted service) |
| Own storage format | Yes, single-file database | No; Parquet plus snapshot metadata for catalog tables |
| Transactions | Yes, ACID | No; each statement commits on its own |
| Load step needed | Optional, but best performance after loading | Never |
| Sources in place | Files and object storage; Iceberg, Delta, Postgres, MySQL via extensions | Files on disk, S3, GCS, HTTPS; Iceberg; Postgres (experimental); Firestore; dataframes |
| Out-of-memory aggregations | Spills well | Spills poorly today |
| Languages | Python, R, Java, Node.js, Rust, Go, C/C++, WASM, more | Python; hosted APIs (REST, OData, Flight SQL) for everything else |
| Platforms | Linux, macOS, Windows, browser | Linux x86_64, macOS Apple Silicon |
| Concurrency | One writer per database file | Stateless reads, no locks |
| Hosted option | MotherDuck | opteryx.app |
| Licence | MIT | Apache 2.0 |

## Making the call

Ask yourself four questions:

1. **Do you need to own and change the data?** If yes, use DuckDB.
2. **Does it already live somewhere you'd rather not copy from?** If yes, Opteryx is built for that.
3. **How big are your heaviest aggregations, compared with your RAM?** If they're bigger, use DuckDB for now.
4. **Who else needs to query it, and from what tools?** If the answer is "lots of people, some of them in Excel", look at hosted Opteryx.

And benchmark both on your real data. It takes an afternoon, and it's the only result that matters for your workload.

If you want to try Opteryx, `pip install opteryx-core` gets you the engine. The [docs](https://docs.opteryx.app) have a two-minute quick start, and [opteryx.app](https://opteryx.app) has a free allowance with no card needed.

— Justin
