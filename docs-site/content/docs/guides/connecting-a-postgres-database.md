---
title: Connecting a PostgreSQL Database - Opteryx
description: Point an Opteryx.app workspace at your own PostgreSQL server and query its tables in place. Experimental - connection settings, what works, and what is refused.
---

# Connecting a PostgreSQL Database

This guide is for [opteryx.app](https://opteryx.app), the hosted service. By default a workspace's tables live in Opteryx's own storage — you upload data, Opteryx keeps it. A workspace can instead be pointed at **your** PostgreSQL server: the server keeps the data and executes the read, and Opteryx streams the rows back into the query.

Nothing is copied and nothing is migrated. `SELECT` runs against the tables your server holds, as they are at the moment the query runs.

> Warning: PostgreSQL support is **experimental** and is not recommended for production use. The connector works and is tested, but its behaviour, configuration and limits may change between releases, and it has not been through the soak that the storage and Iceberg paths have. Treat it as something to explore with, not something to build a dependency on.

## What You Get, and What You Don't

A connected PostgreSQL server is **read-only**.

| Works | Doesn't |
|---|---|
| `SELECT`, joins, aggregates, `EXPLAIN` | `CREATE`, `INSERT`, `UPDATE`, `DELETE`, `DROP` |
| Predicate and `LIMIT` pushdown into the server | `FOR ... AS OF` / `VERSION AS OF` — there are no snapshots to travel to |
| Tables, views, materialized views and foreign tables | `interval`, array, range and other types with no Opteryx equivalent |
| Row counts and column statistics from the server's own `ANALYZE` output | `numeric` columns with no declared precision and scale |
| Datasets listed in Studio and over [OData](/docs/guides/querying-via-odata) | Materialized views, triggers and webhooks defined *in Opteryx* on these tables |

A statement that writes to a connected workspace is refused when the query is planned; it does not fall back to Opteryx storage. A column whose type has no mapping is refused at bind time rather than failing part-way through a scan — the whole table is unreadable, and the dataset list marks it as such.

## Before You Start

- **A PostgreSQL server reachable over the public internet.** Opteryx refuses addresses that resolve to private, loopback or link-local ranges, so a database inside your VPC with no public endpoint cannot be reached.
- **A login with read access** to the schemas and tables you want to query. Give it no more than that — Opteryx never writes, so a read-only role is the right one.
- **Workspace ownership.** Binding a server carries a credential and defines where a workspace's data comes from, so only a workspace *owner* can do it. Owners and admins can read the settings, test the connection and refresh the dataset list.

## The Choice Is Made When the Workspace Is Created

Where a workspace's tables live is fixed at creation. There is no convert and no revert — moving a workspace to different storage means deleting it and creating it again. The connection *settings* stay editable forever, because hosts move and passwords rotate; the choice of storage does not.

In Studio, the New workspace form asks the question directly: Opteryx storage, your own Iceberg catalog, or your own PostgreSQL server. Choosing PostgreSQL reveals the connection fields.

## Connection Settings

| Field | What it is |
|---|---|
| Host | The server's hostname, e.g. `db.example.com`. Must resolve to a public address. |
| Port | Defaults to `5432`. |
| Database | The database name to connect to. One binding reaches one database. |
| User | The login Opteryx authenticates as. |
| TLS | `require` (the default), `verify-full`, or `disable`. |
| Default schema | The schema used when a relation is named with no schema. Defaults to `public`. |

The form renders these fields; the raw JSON editor beside it is the authority and accepts the same keys. Three keys are refused because Opteryx sets them itself: `workspace`, `connector`, and `prefix`.

> Be Aware: `sslmode: disable` sends your credential and your rows over an unencrypted connection across the public internet. It exists for a server that terminates TLS elsewhere. If that is not your situation, leave it at `require`.

## Authentication

Unlike an Iceberg catalog, there is no *ambient* mode — PostgreSQL authenticates with a password, so there is no "Opteryx's own identity" form of this binding. The password is always stored.

It is encrypted with envelope encryption under a KMS key before it touches storage; only the ciphertext is persisted, and it is never returned by the API or rendered back into the form. A stored credential is write-only, so replacing it means typing a new one, never editing an old one.

## Test the Connection

Both the New workspace form and the Catalog settings panel have a **Test connection** button, and it is worth using before you commit — the storage choice is permanent, so the answer should arrive while the decision is still reversible.

The test opens a real connection with the real password and lists the server's schemas, so a green tick means the query path can do the same. It reports one of a fixed set of outcomes — reachable, DNS failure, TLS failure, authorization rejected, not found, timeout, blocked address. It never shows text from your server: a database error can echo query text or connection details back, and that is not something to put on a screen or in a log.

## Addressing Tables

A PostgreSQL schema is a collection, and a table is a dataset:

```sql
SELECT * FROM my_workspace.public.planets;
```

If the table is in the binding's default schema, the schema segment can be left out:

```sql
SELECT * FROM my_workspace.planets;   -- default schema, usually public
```

`pg_catalog` and `information_schema` are never offered — they are the server's own, not your data.

### Case

PostgreSQL folds unquoted identifiers to lower case, and Opteryx lower-cases relation names when it binds them, so the default lookup lower-cases too — which is the right answer for a schema built the ordinary way. A schema whose objects were created with quoted mixed-case names needs the binding's **preserve SQL case** setting, which uses the relation name exactly as you typed it.

## Refreshing the Dataset List

Queries always go straight to your server, so a table is queryable the moment your server has it. **Listing** is separate: the Studio dataset tree and the OData service document read a stored list of names, schemas and statistics that Opteryx projects from your database.

That list is refreshed only when someone presses **Refresh dataset list**. Nothing refreshes it automatically. A refresh lists every non-system schema, then describes every table it finds — one round trip per table — and reads `pg_stats` for the column statistics `ANALYZE` has already computed. Those statistics reach the planner as hints for selectivity, join ordering and distinct counts; they are never treated as authoritative, because the server moves under them.

A table the engine cannot bind — an unsupported column type — is still listed by name, marked unreadable, and counted in the refresh result. The listing binds tables through the same connector the engine queries with, so a table the list promises in full is a table a query can open.

Refresh after you create, rename or drop tables, and after an `ANALYZE` if you want the planner to see the newer statistics. If your server cannot be reached, the refresh fails and the stored list is left exactly as it was.

## See Also

- [Connectors](/docs/guides/connectors) — registering a PostgreSQL database from Opteryx Core, the embedded engine
- [Connecting an Iceberg catalog](/docs/guides/connecting-an-iceberg-catalog) — the other bring-your-own-storage option
