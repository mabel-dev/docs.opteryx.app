# Connectors

A connector tells Opteryx how to reach a set of relations. Which one you get
depends on the **prefix** — the first dotted segment of a relation name.

```sql
SELECT * FROM testdata.astronauts;
--            ^^^^^^^^ prefix
```

If a prefix has been registered, its connector handles the query. If not, the
default filesystem connector does.

## The default: reading files with no setup

With nothing registered, Opteryx treats a relation name as a **path relative to
the process working directory**, with dots as separators:

```sql
SELECT name FROM testdata.astronauts;   -- reads ./testdata/astronauts/
```

That directory is scanned for data files (Parquet, JSONL, or Skene — CSV is not a
dataset format; read it by path with `read_csv` below). This is the whole
configuration story for local querying — there is nothing to register.

> Warning: Because the path is resolved against the **current working directory**, the same query run from a different directory reads different data, or fails. Register a prefix (below) if you need a fixed location.

To read a specific file rather than a directory, use the table functions, which
take a path directly and ignore the prefix rules:

```sql
SELECT * FROM read_parquet('data/events.parquet');
SELECT * FROM read_csv('data/events.csv', has_header_row => true);
SELECT * FROM read_jsonl('data/events.jsonl');
```

## Registering a prefix

`register_workspace` binds a prefix to a connector. It takes the connector
**uninstantiated** — a class or factory — plus that connector's configuration:

```python
import opteryx
from opteryx.connectors import register_workspace
from opteryx.connectors.local_store_connector import LocalStoreConnector

register_workspace("warehouse", LocalStoreConnector, store_root="/srv/opteryx")

session = opteryx.session()
for morsel in session.execute_to_morsels("SELECT * FROM warehouse.sales.orders"):
    print(morsel)
```

## Available connectors

| Connector | Reaches | Writable |
|-----------|---------|:--------:|
| `FileSystemConnector` | Files on a local disk or in a bucket | |
| `LocalStoreConnector` | A local directory managed as a store, with schemas and snapshots | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| `OpteryxConnector` | A catalog-backed workspace (the cloud warehouse) | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| `MabelConnector` | Mabel-partitioned datasets | |

**Writable** means the connector supports DDL and DML — `CREATE TABLE`, `INSERT`,
`DROP`, `TRUNCATE`. A statement that writes through a non-writable connector is
refused when the query is planned:

~~~
connector for somefile.foo does not support CREATE TABLE
~~~

`OpteryxConnector` additionally supports **predicate pushdown**, so filters are
evaluated during the scan rather than after it.

### Filesystem connectors

Factories build a `FileSystemConnector` over a given filesystem:

```python
from opteryx.connectors import create_local_connector, create_gcs_connector

register_workspace("local", create_local_connector)
register_workspace("archive", create_gcs_connector, bucket="my-bucket")
```

> Be Aware: `FileSystemConnector` has **no root directory setting** — the relation name *is* the path. Registering a prefix for it does not re-root anything; the prefix simply becomes the first path segment. Use `LocalStoreConnector` with `store_root` when you want a fixed base directory.

`DiskConnector` and `GcpCloudStorageConnector` are retained as legacy names for
the two factories above.

## Setting a default

To change what handles unregistered prefixes:

```python
from opteryx.connectors import set_default_connector, create_gcs_connector

set_default_connector(create_gcs_connector, bucket="my-bucket")
```

## Notes

- Bucket URLs are **not** valid in a `FROM` clause — `FROM gs://bucket/file.parquet`
  is a syntax error. Register a prefix, or use `read_parquet('...')`.
- Connectors are cached per prefix and long-lived; they act as a gateway to their
  storage rather than being created per query.
- `$`-prefixed names are reserved for the engine's own
  [virtual datasets](/docs/reference/sql/virtual-datasets) and are not routed
  through connectors.
- Writing a custom connector means subclassing `BaseConnector` and implementing
  `read_dataset` and `get_dataset_schema`; add the `Writable` mixin to support DDL.
