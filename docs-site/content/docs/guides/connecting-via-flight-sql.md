---
title: Connecting via Arrow Flight SQL
description: Query the hosted Opteryx.app service over Arrow Flight SQL from Python (pyarrow, ADBC) or any Flight SQL JDBC/ODBC-capable tool — data streams as Arrow, no JSON round trip.
---

# Connecting via Arrow Flight SQL

This is for [opteryx.app](https://opteryx.app), the hosted service, via its Arrow Flight SQL endpoint at `flight.opteryx.app:443`. If you want a plain HTTP/JSON API instead, see [Running a Query via the API](/docs/guides/running-a-query-via-the-api); for a SQLAlchemy-based Python workflow, see [Using SQLAlchemy from a Notebook](/docs/guides/using-sqlalchemy).

Flight SQL is a gRPC-based protocol: query results stream back as Arrow record batches natively, with no JSON serialization step. It's read-only in this release — no `INSERT`/`UPDATE`/`DELETE`, no prepared statements, no transactions.

## Authentication

Same bearer-token scheme as the rest of the hosted service (see [Authentication API](/docs/reference/api/authentication-api) for how to mint one), carried as gRPC call metadata instead of an HTTP header:

```
authorization: Bearer <token>
```

**A token is required on every call.** Unlike the plain-HTTP API and the OData service, there is no anonymous access here at all — a call with no `authorization` metadata is rejected outright, before it reaches the query engine, regardless of what it's asking for.

## Python: pyarrow (low-level)

`pyarrow.flight` speaks base Flight but has no Flight SQL-specific helpers, so you build and unpack the Flight SQL command messages yourself. It's the right layer if you want to see the protocol directly; for everyday use, prefer ADBC below.

```bash
pip install pyarrow grpcio-tools
```

pyarrow doesn't bundle the Flight SQL message definitions, so generate them yourself once from the upstream proto:

```bash
curl -O https://raw.githubusercontent.com/apache/arrow/main/format/FlightSql.proto
python -m grpc_tools.protoc -I. --python_out=. FlightSql.proto
```

That produces `FlightSql_pb2.py` alongside your script:

```python
import pyarrow.flight as fl
from google.protobuf import any_pb2

from FlightSql_pb2 import CommandStatementQuery

client = fl.FlightClient("grpc+tls://flight.opteryx.app:443")
options = fl.FlightCallOptions(headers=[(b"authorization", b"Bearer YOUR_TOKEN")])

command = CommandStatementQuery(query="SELECT name, mass FROM opteryx.test.planets LIMIT 5")
any_command = any_pb2.Any()
any_command.Pack(command)
descriptor = fl.FlightDescriptor.for_command(any_command.SerializeToString())

info = client.get_flight_info(descriptor, options)          # 1. schema + ticket
reader = client.do_get(info.endpoints[0].ticket, options)   # 2. redeem the ticket
table = reader.read_all()
print(table)
```

Every call is this same two-step shape: `GetFlightInfo` returns the result schema and an opaque, single-use ticket; `DoGet` redeems that ticket for the actual data. This isn't Opteryx-specific — it's how Flight (and Flight SQL) always works. `options` (carrying the bearer token) must be passed to *both* calls — `GetFlightInfo` without it fails before a ticket is even issued.

## Python: ADBC (recommended)

[ADBC](https://arrow.apache.org/adbc/)'s Flight SQL driver gives you a standard DBAPI2 connection — no protobuf handling required — and is the more realistic client for everyday querying or feeding a `pandas`/Polars dataframe.

```bash
pip install adbc_driver_flightsql
```

```python
from adbc_driver_flightsql import dbapi

with dbapi.connect(
    "grpc+tls://flight.opteryx.app:443",
    db_kwargs={"adbc.flight.sql.authorization_header": "Bearer YOUR_TOKEN"},
) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT name, mass FROM opteryx.test.planets ORDER BY mass DESC")
        table = cur.fetch_arrow_table()
        print(table)
```

Straight into pandas:

```python
import pandas
from adbc_driver_flightsql import dbapi

with dbapi.connect(
    "grpc+tls://flight.opteryx.app:443",
    db_kwargs={"adbc.flight.sql.authorization_header": "Bearer YOUR_TOKEN"},
) as conn:
    df = pandas.read_sql_query("SELECT * FROM opteryx.test.planets", conn)
```

`adbc.flight.sql.authorization_header` isn't optional here — omitting `db_kwargs` entirely connects without credentials, and every call on that connection will fail with an authentication error.

### Discovering tables

ADBC's catalog-introspection calls map onto the same `GetCatalogs`/`GetDbSchemas`/`GetTables` metadata calls a BI tool's table browser uses to populate its tree — these need a token too, same as running a query:

```python
with dbapi.connect(
    "grpc+tls://flight.opteryx.app:443",
    db_kwargs={"adbc.flight.sql.authorization_header": "Bearer YOUR_TOKEN"},
) as conn:
    print(conn.adbc_get_table_types())          # ['TABLE', 'VIEW']

    objects = conn.adbc_get_objects(depth="all").read_all()
    for row in objects.to_pylist():
        for schema in row["catalog_db_schemas"] or []:
            tables = [t["table_name"] for t in (schema["db_schema_tables"] or [])]
            print(f"{row['catalog_name']}.{schema['db_schema_name']}: {tables}")
```

This only lists datasets your token's policies actually grant you — same access model as the rest of the hosted service, see [Access and Permissions](/docs/core-concepts/access-and-permissions).

## GUI clients (DBeaver, JDBC/ODBC-capable tools)

Anything that speaks the upstream Arrow Flight SQL JDBC driver or the ADBC ODBC driver should work against `flight.opteryx.app:443`, the same way [DBeaver](https://dbeaver.io/) has a built-in Arrow Flight SQL driver in its driver catalog, and Excel/Power BI can reach an ODBC data source once the ADBC ODBC driver is installed as a DSN — the Flight SQL equivalent of connecting Excel to the OData service. This section is a starting point rather than a verified walkthrough; if you hit a driver-specific snag, it's worth filing as feedback so this page can be corrected against a real client.

Connection parameters, regardless of client:

- **Host:** `flight.opteryx.app`
- **Port:** `443`
- **TLS:** required
- **Auth:** bearer token, required on every connection — most Flight SQL drivers expose this as a "token" or "authorization header" connection property rather than a username/password pair. There's no anonymous fallback to fall back on if you skip it.

## Things to know

- **Read-only.** No writes, no `DoPut` ingestion, no transactions in this release — the same scope as the OData service, just a different transport.
- **No prepared statements yet.** Every query is a one-shot `CommandStatementQuery`; there's no `PREPARE`/execute-with-parameters step.
- **Dataset names are the same as everywhere else** — dot-separated names like `opteryx.test.planets`, resolved through whatever policies your token grants. See [Access and Permissions](/docs/core-concepts/access-and-permissions).
- **No anonymous access, unlike the OData service.** `odata.opteryx` lets a couple of specific public datasets through with no credentials at all; the Flight SQL endpoint doesn't — every call, including a metadata call like `GetTableTypes`, needs a valid bearer token.

## Related

- [Running a Query via the API](/docs/guides/running-a-query-via-the-api)
- [Using SQLAlchemy from a Notebook](/docs/guides/using-sqlalchemy)
- [Authentication API](/docs/reference/api/authentication-api)
- [Access and Permissions](/docs/core-concepts/access-and-permissions)
