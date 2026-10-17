---
title: Querying Opteryx.app from a Notebook with SQLAlchemy
description: Connect to the hosted Opteryx.app service from a Python script or notebook using the opteryx-sqlalchemy dialect. Authenticate with client credentials and query straight into pandas.
---

# Using SQLAlchemy from a Notebook or Script

This is for [opteryx.app](https://opteryx.app), the hosted service. If you want SQL over local Parquet files with nothing remote involved, see [Querying Local Data](/docs/guides/querying-local-data) instead.

For a notebook or a local script, `opteryx-sqlalchemy` is the recommended way to talk to the hosted service — it's a standard SQLAlchemy dialect, so it works with `pandas.read_sql_query`, plain SQLAlchemy Core, and anything else that already speaks SQLAlchemy. Under the hood it's still calling the same [Jobs API](/docs/reference/api/jobs-api) described in [Running a Query via the API](/docs/guides/running-a-query-via-the-api) — the dialect just handles authentication and result polling for you.

```bash
pip install opteryx-sqlalchemy
```

> **Try it yourself:** the companion notebook connects with your client ID and secret, queries the public NVD vulnerability dataset into pandas, joins it to CISA's known-exploited list, then runs the same connection against your own datasets. It needs an opteryx.app account, and reads the credentials from Colab Secrets so they stay out of the notebook. [Open in Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/query-opteryx-app-with-sqlalchemy.ipynb) or [download the notebook](/notebooks/query-opteryx-app-with-sqlalchemy.ipynb).

## What You'll Be Able to Do

By the end of this page you'll be able to:

- build a connection URL from a client ID and secret, and keep that secret out of source control
- run a query with plain SQLAlchemy Core
- read a result straight into a pandas DataFrame
- work around the bound-parameter limitation safely, and know why it exists
- list the schemas, tables and columns your credential can see
- recognise what this dialect won't do — writes, and key or index reflection

## Authenticating

Create a client credential from the [Authentication API](/docs/reference/api/authentication-api) (or reuse one you already have) — you'll get a **client ID** and a **client secret**. The connection URL's username/password slots carry these, not a literal username and password:

```
opteryx://<client_id>:<client_secret>@opteryx.app:443/default?ssl=true
```

```python
from sqlalchemy import create_engine

engine = create_engine(
    "opteryx://YOUR_CLIENT_ID:YOUR_CLIENT_SECRET@opteryx.app:443/default?ssl=true"
)
```

The dialect exchanges these for a short-lived access token the first time you open a cursor, and attaches it to every request after that — you don't need to call the token endpoint yourself, and you don't need to worry about the token's short lifetime, since a fresh one is obtained per connection.

> Warning: Treat the client secret like any other credential — keep it out of source control (an environment variable or secrets manager, not a hardcoded string), and use `create_credential` / `revoke_credential` from the Authentication API to rotate it.

## Running a Query

Standard SQLAlchemy Core usage — `text()` and `conn.execute()`:

```python
from sqlalchemy import create_engine, text

engine = create_engine(
    "opteryx://YOUR_CLIENT_ID:YOUR_CLIENT_SECRET@opteryx.app:443/default?ssl=true"
)

with engine.connect() as conn:
    result = conn.execute(text("SELECT name, mass FROM opteryx.test.planets"))
    for row in result:
        print(row)
```

## Straight into pandas

This is the pattern most notebook use ends up as — pass the engine to `pandas.read_sql_query`:

```python
import pandas
from sqlalchemy import create_engine

engine = create_engine(
    "opteryx://YOUR_CLIENT_ID:YOUR_CLIENT_SECRET@opteryx.app:443/default?ssl=true"
)

df = pandas.read_sql_query(
    sql="SELECT name, mass FROM opteryx.test.planets ORDER BY mass DESC",
    con=engine.connect(),
)
print(df)
```

## Parameterising Queries

SQLAlchemy's usual bound-parameter mechanism — `text("... WHERE mass > :min_mass")` with a params dict — does not currently work end to end against the hosted service; the query fails server-side with an unresolved-parameter error regardless of what you pass. This isn't specific to the SQLAlchemy dialect — it's a current limitation of the Jobs API underneath it, also covered in [Running a Query via the API](/docs/guides/running-a-query-via-the-api).

Until that's fixed, declare the value with `SET` ahead of the query, in the same statement:

```python
with engine.connect() as conn:
    result = conn.execute(text(
        "SET @min_mass = 100; SELECT name FROM opteryx.test.planets WHERE mass > @min_mass;"
    ))
    for row in result:
        print(row)
```

> Warning: This embeds the value directly into the SQL text, so only do it with values your own code has coerced to a known scalar type (an `int`, a `float`, a validated date) — never with raw, unescaped user input. It's a stopgap for a feature that isn't fully wired up yet, not a substitute for real bound parameters.

## Things to Know

- **Read-only.** Opteryx is an analytics engine — `commit()` and `rollback()` are no-ops, and there's no DDL/DML support through this dialect.
- **Introspection covers names and columns.** `inspect(engine)` can list schemas (`get_schema_names`), tables (`get_table_names`) and views (`get_view_names`), check `has_table`, and describe columns (`get_columns`). These read opteryx.app's OData metadata, so they don't run a query. Primary keys, foreign keys and indexes always come back empty, because Opteryx doesn't have them.
- **Dataset names are the same as everywhere else** — dot-separated names like `opteryx.test.planets`, resolved through whatever policies your client credential grants. See [Access and Permissions](/docs/core-concepts/access-and-permissions).

## Related

- [SQLAlchemy notebook in Google Colab](https://colab.research.google.com/github/mabel-dev/docs.opteryx.app/blob/main/docs-site/public/notebooks/query-opteryx-app-with-sqlalchemy.ipynb) — query the public NVD dataset, then your own data
- [Running a Query via the API](/docs/guides/running-a-query-via-the-api)
- [Authentication API](/docs/reference/api/authentication-api)
- [Load and Query Data](/docs/getting-started/reading-data)
