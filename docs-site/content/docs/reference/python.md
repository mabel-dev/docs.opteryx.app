# Python Reference

The Python packages published alongside Opteryx, and what each one is for.

- [SQLAlchemy dialect](/docs/reference/python/sqlalchemy) — `opteryx-sqlalchemy`, a standard SQLAlchemy dialect for the hosted service, so `pandas.read_sql_query` and anything else that speaks SQLAlchemy can query it. Walkthrough: [Using SQLAlchemy from a Notebook or Script](/docs/guides/using-sqlalchemy).
- [Upload client](/docs/reference/python/upload) — `opteryx-upload`, the client for the [Upload API](/docs/reference/api/upload-api). Ships a library, a command line and a full-screen terminal app. Walkthrough: [The Upload Command Line](/docs/guides/upload-cli).

The engine itself, `opteryx-core`, is embedded in your own process rather than
called over the network — see [Querying Local Data](/docs/guides/querying-local-data)
and [Installing Opteryx Core](/docs/getting-started/installation).
