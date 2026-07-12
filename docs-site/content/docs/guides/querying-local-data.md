---
title: Querying Local Data with Opteryx Core - SQL over Parquet
description: Run SQL over local Parquet datasets with Opteryx Core. Register a workspace, query datasets by name, and stream results as morsels or Arrow.
---

# Querying Local Data

Opteryx Core is the engine behind [opteryx.app](https://opteryx.app), and it also runs as a standalone library. This guide covers using it locally: pointing it at a folder of Parquet data and querying it with SQL.

```bash
pip install opteryx-core
```

```python
import opteryx
```

## Registering a Workspace

Opteryx does not query files by path. Instead you register a **workspace** — a named prefix backed by a connector — and then query datasets by name. For local files, use the `DiskConnector`:

```python
import opteryx
from opteryx.connectors import DiskConnector

opteryx.register_workspace("data", DiskConnector)
```

Dataset names are dot-separated and resolve relative to the current working directory. A query against `data.planets` reads from `./data/planets`, where the engine finds the Parquet files that make up the dataset:

```python
session = opteryx.session()
for morsel in session.execute_to_morsels(
    "SELECT id, name FROM data.planets WHERE id < 5"
):
    print(morsel)
```

`data.planets` maps to the folder `./data/planets/` — a dataset is a folder of Parquet files, not a single file. Querying other formats directly is not currently supported; see [Using Rugo Standalone](/docs/guides/rugo-standalone) if you need to read or write CSV or JSONL outside of a query.

## Getting Results Out

`opteryx.session()` returns a session you execute queries against. The preferred way to consume a result is to stream it as **morsels** — batches of columnar data — with `execute_to_morsels`:

```python
session = opteryx.session()

for morsel in session.execute_to_morsels("SELECT name, mass FROM $planets"):
    # a column, as a Draken vector
    names = morsel.column("name")

    # rows, as named tuples
    for row in morsel:
        print(row.name, row.mass)
```

Convert a morsel to Arrow when you need to hand data to a tool that expects it:

```python
for morsel in session.execute_to_morsels("SELECT * FROM $planets"):
    table = morsel.to_arrow()
```

For a result you know is small — a single summary row, a short lookup — `execute_to_arrow` collects the whole result into one Arrow table in one call:

```python
table = session.execute_to_arrow("SELECT COUNT(*) FROM $planets")
```

The session also works as a DB-API cursor, if that shape fits your code better:

```python
session.execute("SELECT name, mass FROM $planets WHERE id < 5")
for row in session.fetchall():
    print(row)
```

## Checking Your Setup Works

Opteryx Core ships with a built-in `$planets` dataset. Querying it doesn't touch a workspace or a connector at all, so it's a way to confirm the engine itself is working before you worry about whether storage access is configured correctly:

```python
for morsel in opteryx.session().execute_to_morsels(
    "SELECT name, gravity FROM $planets ORDER BY mass DESC"
):
    print(morsel)
```

If this runs, the engine is installed and working — any problem after that is in how a workspace or connector is set up, not in Opteryx itself.

## Parameterising Queries

Never build SQL by concatenating input. Bind parameters instead — Opteryx accepts named placeholders (`:name`) with a dict, or positional placeholders (`?`) with a list:

```python
session = opteryx.session()
session.execute(
    "SELECT name FROM $planets WHERE id = :id",
    params={"id": 3},
)
```

## Making Queries Faster

The engine prunes aggressively when you let it — name the columns you need rather than `SELECT *`, and filter on columns that carry good statistics so whole row groups can be skipped. To see the plan the optimiser produced, prefix a query with `EXPLAIN`. See [Troubleshooting Queries](/docs/guides/troubleshooting) for reading `EXPLAIN` output.

## Where This Fits

Locally, Opteryx Core is an embedded analytical engine — SQL over Parquet-backed folders, inside your own Python process. For named datasets and a catalog-backed experience it pairs with the `opteryx_catalog` library; for a hosted, multi-tenant experience there is [opteryx.app](https://opteryx.app). See [What is Opteryx](/docs/introduction/what-is-opteryx).
