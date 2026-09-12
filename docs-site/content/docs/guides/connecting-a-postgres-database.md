---
title: Connecting a PostgreSQL Database - Opteryx
description: Point an Opteryx.app workspace at your own PostgreSQL or CockroachDB server and query its tables in place. Experimental - connection settings, what works, and what is refused.
---

# Connecting a PostgreSQL Database

This guide is for [opteryx.app](https://opteryx.app), the hosted service. By default a workspace's tables live in Opteryx's own storage — you upload data, Opteryx keeps it. A workspace can instead be pointed at **your** PostgreSQL server — or a PostgreSQL-compatible one such as CockroachDB: the server keeps the data and executes the read, and Opteryx streams the rows back into the query.

Nothing is copied and nothing is migrated. `SELECT` runs against the tables your server holds, as they are at the moment the query runs.

## PostgreSQL and PostgreSQL-Compatible Servers

What this binding speaks is the PostgreSQL wire protocol, which is why it reaches more than PostgreSQL itself.

**PostgreSQL** and **CockroachDB** are both supported and tested. Opteryx asks the server which one it is and reads that engine's statistics rather than assuming PostgreSQL's, so a CockroachDB workspace gets a properly informed planner and not an empty one.

Other PostgreSQL-compatible servers — YugabyteDB, Greenplum, Timescale, and the managed forks — are likely to work, but **how well depends on how faithfully each one implements PostgreSQL's own metadata services**, and that varies a great deal. Speaking the protocol is the easy part. Querying is the part most of them get right: if your server can describe a statement and return rows, Opteryx can read it.

What degrades first is everything around the query, because it comes from catalogs a compatible server is free to implement thinly, differently, or not at all:

- **Listing** reads `information_schema`, which is standard and widely honoured.
- **Statistics** — row counts, distinct counts, null fractions — come from each engine's own store. Opteryx knows PostgreSQL's and CockroachDB's; on anything else it looks where PostgreSQL keeps them and finds nothing if that engine keeps them elsewhere. That shows up as absence rather than failure, so what to check after a refresh is whether your tables came back with row counts, not whether anything errored.
- **Table sizes** come from PostgreSQL-specific functions that several engines do not implement at all.

None of that stops a query. Missing statistics cost you a less well-costed plan, not a wrong answer — the planner treats them as hints and never as truth. An unlisted or unreadable table is reported as such rather than quietly omitted.

Nothing here is an error, and nothing fails the connection: Opteryx collects what your server actually offers and says what it got. If you are running something other than PostgreSQL or CockroachDB, connect it and see — the connection test tells you what answered, and a dataset refresh tells you how much of it could be described.

> Warning: PostgreSQL support is **experimental** and is not recommended for production use. The connector works and is tested, but its behaviour, configuration and limits may change between releases, and it has had far less production use than Opteryx's own storage. Treat it as something to explore with, not something to build a dependency on. The same applies to CockroachDB, and more so to any other PostgreSQL-compatible server.

## What You Get, and What You Don't

A connected server is **read-only**.

| Works | Doesn't |
|---|---|
| `SELECT`, joins, aggregates, `EXPLAIN` | `CREATE`, `INSERT`, `UPDATE`, `DELETE`, `DROP` |
| Predicate and `LIMIT` pushdown into the server | Time travel (`FOR ... AS OF`, `VERSION AS OF`) — your server keeps no snapshots to travel to |
| Tables, views, materialized views and foreign tables | `interval`, array, range and other types with no Opteryx equivalent |
| Row counts and column statistics on PostgreSQL and CockroachDB | `numeric` columns with no declared precision and scale |
| Datasets listed in Studio and over [OData](/docs/guides/querying-via-odata) | Materialized views, triggers and webhooks defined *in Opteryx* on these tables |

A statement that writes to a connected workspace is refused when the query is planned; it does not fall back to Opteryx storage. A column whose type has no mapping is refused at bind time rather than failing part-way through a scan — the whole table is unreadable, and the dataset list marks it as such.

## Before You Start

- **A PostgreSQL or PostgreSQL-compatible server reachable over the public internet.** Opteryx refuses addresses that resolve to private, loopback or link-local ranges, so a database inside your VPC with no public endpoint cannot be reached.
- **A login with read access** to the schemas and tables you want to query. Give it no more than that — Opteryx never writes, so a read-only role is the right one.
- **Workspace ownership.** Binding a server carries a credential and defines where a workspace's data comes from, so only a workspace *owner* can do it. Owners and admins can read the settings, test the connection and refresh the dataset list.

## The Choice Is Made When the Workspace Is Created

Where a workspace's tables live is fixed at creation. There is no convert and no revert — moving a workspace to different storage means deleting it and creating it again. The connection *settings* stay editable forever, because hosts move and passwords rotate; the choice of storage does not.

In Studio, the New workspace form asks the question directly: Opteryx storage, your own Iceberg catalog, or your own PostgreSQL server. Choosing PostgreSQL reveals the connection fields — and it is the right choice for CockroachDB too, since the connector is what the choice names.

## Connection Settings

| Field | What it is |
|---|---|
| Connection string | Optional. Paste the address your tooling already gave you — `postgres://user@db.example.com:5432/app` — and the fields below fill themselves in. |
| Host | The server's hostname, e.g. `db.example.com`. Must resolve to a public address. |
| Port | Defaults to `5432`. CockroachDB usually listens on `26257`. |
| Database | The database name to connect to. One binding reaches one database. |
| User | The login Opteryx authenticates as. |
| TLS | `require` (the default), `verify-full`, or `disable`. |
| Default schema | The schema used when a relation is named with no schema. Defaults to `public`. |

You can fill the fields in by hand or paste a connection string into the field above them; either way it is the fields that are saved, and a pasted string is taken apart rather than stored. A password in the string is put where passwords go — the credential field, encrypted — not into the connection settings, which are stored as you give them.

The form renders these fields; the raw JSON editor beside it is the authority and accepts the same keys, so anything the form does not expose can be set there. Three keys are refused because Opteryx sets them itself: `workspace`, `connector`, and `prefix`.

> Be Aware: `sslmode: disable` sends your credential and your rows over an unencrypted connection across the public internet. It exists for a server that terminates TLS elsewhere. If that is not your situation, leave it at `require`.

## Authentication

A PostgreSQL binding always carries a password. You give it when the workspace is created, and Opteryx stores it — there is no form of this binding where Opteryx authenticates as itself instead, because PostgreSQL has no equivalent of the identity-based access an [Iceberg catalog](/docs/guides/connecting-an-iceberg-catalog) can be given.

It is encrypted with envelope encryption under a KMS key before it touches storage; only the ciphertext is persisted, and it is never returned by the API or rendered back into the form — not to you either. A stored credential is write-only, so rotating a password means typing the new one in full rather than editing the old one.

## Test the Connection

Both the New workspace form and the Catalog settings panel have a **Test connection** button. On the New workspace form it is not optional: the workspace cannot be created until a test has passed. The storage choice is permanent, so the answer has to arrive while the decision is still reversible. Changing any setting afterwards clears the result — a test describes the settings it ran against and nothing later than them.

The test opens a real connection with the real password and lists the server's schemas, so a green tick means the query path can do the same. It also reports **which engine answered**: a connection to CockroachDB says so, rather than reporting the protocol it speaks. It reports one of a fixed set of outcomes — reachable, DNS failure, TLS failure, authorization rejected, not found, timeout, blocked address. It never shows text from your server — a database error can echo query text and connection details back, which is not something to put on a screen or in a log — so a failure gives you the category and not your server's own message. The detail behind an authorization rejected or a TLS failure is in your server's logs.

## Which Engine Answered

Several products speak the PostgreSQL wire protocol, so the connector's name alone cannot tell you what is actually on the other end. Opteryx asks the server directly, and a workspace pointed at CockroachDB is labelled and marked as CockroachDB throughout Studio — the quickest confirmation that you reached the server you meant to reach.

That answer is recorded when something connects: a **Test connection** on a saved workspace, or a dataset list refresh. Until one of those has run, a workspace is shown by its connector — so a newly created one may read as PostgreSQL until the first refresh. An engine Opteryx does not recognise is reported as PostgreSQL, which is what its connector already assumed — so a PostgreSQL label is not by itself proof that PostgreSQL answered.

It is an observation, not a setting. Repoint the binding at a different server and it is learned again the next time anything connects.

## Addressing Tables

Opteryx addresses a table as *workspace*.*schema*.*table*: your PostgreSQL schema sits where an Opteryx collection would, and the table itself is the dataset.

```sql
SELECT * FROM my_workspace.public.planets;
```

If the table is in the binding's default schema, the schema segment can be left out:

```sql
SELECT * FROM my_workspace.planets;   -- default schema, usually public
```

`pg_catalog` and `information_schema` are never offered — they are the server's own, not your data. Neither are `crdb_internal` and `pg_extension`, which are CockroachDB's equivalents.

### Case

If a table exists on your server but a query reports it as not found, mixed-case naming is the first thing to suspect. PostgreSQL folds unquoted identifiers to lower case and Opteryx lower-cases relation names when it binds them, which is the right answer for a schema built the ordinary way. A schema whose objects were created with quoted mixed-case names needs the binding's **preserve SQL case** setting, which uses the relation name exactly as you typed it.

## Refreshing the Dataset List

Queries always go straight to your server, so a table is queryable the moment your server has it. **Listing** is separate: the Studio dataset tree and the [OData](/docs/guides/querying-via-odata) service document read a stored list of names, schemas and statistics that Opteryx projects from your database.

That list is refreshed only when someone presses **Refresh dataset list**. Nothing refreshes it automatically. A refresh lists every non-system schema, then describes every table it finds — one round trip per table, so a refresh over a large schema is not instant — and reads whatever statistics the server has already computed. Those reach the planner as hints for selectivity, join ordering and distinct counts; they are never treated as authoritative, because the server moves under them.

Where those statistics come from depends on the engine, which changes what you have to do to keep them useful:

| | PostgreSQL | CockroachDB |
|---|---|---|
| Column statistics | From `ANALYZE`, via `pg_stats` — stale until someone runs it | Kept current by the engine itself; nothing for you to do |
| Row counts | From `pg_class.reltuples`, which `ANALYZE` also refreshes; small tables with none are counted exactly | Carried by those same statistics |
| Table sizes | Shown | Not shown — CockroachDB has no equivalent to report |

Statistics are only ever hints, so a server that offers none is a server whose tables are listed, described and queryable with a less well-informed planner behind them. A refresh does not fail because statistics are missing.

A table the engine cannot bind — an unsupported column type — is still listed by name, marked unreadable, and counted in the refresh result. Anything the list shows as readable is a table a query can open.

Refresh after you create, rename or drop tables, and after an `ANALYZE` if you want the planner to see the newer statistics. The refresh can run `ANALYZE` for you — both PostgreSQL and CockroachDB accept it — but only when asked: it is the one statement Opteryx issues against your server that is not a read. If your server cannot be reached, the refresh fails and the stored list is left exactly as it was.

## See Also

- [Connectors](/docs/guides/connectors) — registering a PostgreSQL database from Opteryx Core, the embedded engine
- [Connecting an Iceberg catalog](/docs/guides/connecting-an-iceberg-catalog) — the other bring-your-own-storage option
