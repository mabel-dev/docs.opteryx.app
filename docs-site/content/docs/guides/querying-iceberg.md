---
title: Querying Iceberg with Opteryx Core - Apache Iceberg Tables over S3 and GCS
description: Query Apache Iceberg tables with Opteryx Core through any catalog PyIceberg can load. Configure storage access, register the catalog, query with SQL and time travel, and see what the reader does to keep remote scans fast. Tested on MinIO AIStor.
---

# Querying Iceberg

Opteryx Core queries [Apache Iceberg](https://iceberg.apache.org/) tables where they are. There's no export or loading step, and no second copy to keep in sync. You register a catalog once under a workspace prefix, and its tables are then queryable by name. They can be joined to anything else Opteryx can read.

Any catalog [PyIceberg](https://py.iceberg.apache.org/) can load works: REST, SQL, Hive or Glue. The table's files can be in S3, in an S3-compatible store, in Google Cloud Storage or on local disk.

**Tested on.** Iceberg is an open specification, and it has many implementations. Catalogs, object stores and the engines that write tables each interpret the details a little differently. We test against a range of them so that Opteryx supports the format, not just one vendor's version of it.

This guide has been tested end to end on [MinIO AIStor](https://www.min.io/product/aistor), whose built-in Iceberg REST catalog is called **AIStor Tables**, and the examples use it. The engine is also tested against [Apache Polaris](https://polaris.apache.org/) and [Google BigLake](https://cloud.google.com/biglake), and is regression tested against [Lakekeeper](https://lakekeeper.io/).

Don't assume a catalog is unsupported because it isn't on this list. The list is what we test, not everything that works. If PyIceberg can load your catalog, Opteryx should be able to query its tables, within the limits in [What's Supported](#whats-supported). Each catalog has its own authentication and warehouse settings. The details for Polaris, BigLake and Lakekeeper aren't covered here, so check your catalog's PyIceberg documentation for them.

This guide is for [Opteryx Core](/docs/getting-started/installation), the engine running in your own Python process. To connect a catalog to the hosted service instead, see [Connecting an Iceberg Catalog](/docs/guides/connecting-an-iceberg-catalog).

## What You'll Be Able to Do

By the end of this page you'll be able to:

- explain which client reads the catalog and which reads the table's files
- give Opteryx access to the storage that holds your tables
- register an Iceberg catalog and query its tables with SQL, including time travel
- check that the catalog's statistics are pruning files
- explain what the reader does to keep scans over the network fast, and which settings change it
- recognise the errors that a misconfiguration produces

## Install

```bash
pip install opteryx-core opteryx-iceberg
```

`opteryx-iceberg` is a separate package because it depends on PyIceberg, and `opteryx-core` has no dependencies.

Some catalogs need more of PyIceberg than the base install. A catalog that signs requests with SigV4, such as AIStor Tables or AWS Glue, needs boto3, which PyIceberg's `rest-sigv4` extra installs:

```bash
pip install "pyiceberg[rest-sigv4]"
```

Without it, the first query fails with `ModuleNotFoundError: No module named 'boto3'`. A catalog that uses Google authentication, such as BigLake, needs `google-auth`.

## Two Clients

Two clients do the reading, and it helps to know which one does what:

| What's read | Who reads it | Configured by |
|---|---|---|
| The catalog: namespaces, tables, schemas, snapshots | PyIceberg's catalog client | The `register_workspace` settings |
| Metadata files, manifest lists and manifests | Opteryx's own storage client | The process environment |
| Data files | Opteryx's own storage client | The process environment |

PyIceberg talks to the catalog, which it does well. Everything else goes through the same storage client Opteryx uses for every remote read. That's the client the rest of this page is about, and it's why reads are fast.

It also means the storage identity comes from the process, not from the catalog. If the catalog's settings name a different S3 endpoint or access key, the read is refused rather than made under another identity. Vended credentials aren't supported for the same reason.

## Give Opteryx Access to Storage

### S3 and S3-compatible stores

Opteryx's S3 client doesn't use boto3. It signs every request as a SigV4 presigned URL and sends it through Opteryx's native HTTP client. It reads its settings from the environment:

| Variable | What it is |
|---|---|
| `AWS_S3_ENDPOINT` | For an S3-compatible store, the endpoint including the scheme, such as `https://aistor.example.net:9000`. Leave it unset for AWS. |
| `AWS_ACCESS_KEY_ID` | The access key. |
| `AWS_SECRET_ACCESS_KEY` | The secret key. |
| `AWS_REGION` | The region. For AIStor that's `us-east-1` unless you changed it. |

When `AWS_S3_ENDPOINT` is set, requests use **path-style addressing** (`https://host:9000/bucket/key`), which is what AIStor recommends.

Without keys in the environment, Opteryx works through the usual AWS credential chain: web identity, then the shared credentials file, then container credentials, then the instance metadata service. One endpoint and one identity apply to every `s3://` read in the process.

```python
import os

os.environ["AWS_S3_ENDPOINT"] = "https://aistor.example.net:9000"
os.environ["AWS_ACCESS_KEY_ID"] = "YOUR-ACCESS-KEY"
os.environ["AWS_SECRET_ACCESS_KEY"] = "YOUR-SECRET-KEY"
os.environ["AWS_REGION"] = "us-east-1"
```

A `.env` file in the working directory works too. `import opteryx` loads it if `python-dotenv` is installed. Keep keys out of source code either way.

> Be Aware: There's no separate TLS setting. Put `http://` or `https://` in `AWS_S3_ENDPOINT`. If your store uses a certificate from your own CA, point `SSL_CERT_FILE` at a bundle that includes it.

### Google Cloud Storage

`gs://` files are read with [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials). That means the service account attached to the machine, or `GOOGLE_APPLICATION_CREDENTIALS` pointing at a key file. A vended GCS token from the catalog is refused.

## Register the Catalog

`register_workspace` binds a prefix to the catalog. Every setting after `catalog=` goes to PyIceberg's `load_catalog` unchanged, so use the settings your catalog's PyIceberg documentation gives you:

```python
from opteryx.connectors import register_workspace
from opteryx.connectors.opteryx_connector import OpteryxConnector
from opteryx_iceberg import IcebergMetastore

register_workspace(
    "lake",
    OpteryxConnector,
    catalog=IcebergMetastore,
    catalog_type="rest",              # or "sql", "hive", "glue"
    uri="https://catalog.example.com",
    warehouse="my_warehouse",
    # ...any other PyIceberg catalog property
)
```

Don't pass `workspace=` yourself, because the registered prefix fills it in.

### Example: MinIO AIStor

AIStor serves its catalog at the `/_iceberg` path of the S3 endpoint and expects requests signed with SigV4 as service `s3tables`:

```python
import os

endpoint = os.environ["AWS_S3_ENDPOINT"]
access_key = os.environ["AWS_ACCESS_KEY_ID"]
secret_key = os.environ["AWS_SECRET_ACCESS_KEY"]

register_workspace(
    "aistor",
    OpteryxConnector,
    catalog=IcebergMetastore,
    catalog_type="rest",
    uri=f"{endpoint}/_iceberg",
    warehouse="analytics",
    **{
        "rest.sigv4-enabled": "true",
        "rest.signing-name": "s3tables",
        "rest.signing-region": "us-east-1",
        "s3.endpoint": endpoint,
        "s3.access-key-id": access_key,
        "s3.secret-access-key": secret_key,
        "s3.region": "us-east-1",
    },
)
```

`warehouse` is the bare warehouse name, without `s3://`. These are the settings from [MinIO's own PyIceberg example](https://docs.min.io/aistor/developers/aistor-tables/connect-query-engines/).

AIStor's catalog also sends its own `s3.endpoint` to the client, and that value replaces the one you pass. So `AWS_S3_ENDPOINT` has to match the endpoint AIStor advertises, written the same way, because Opteryx's client does the actual reading. If you reach AIStor through a different hostname or a proxy, the reads are refused (see [Troubleshooting](#troubleshooting)).

> Warning: With `catalog_type="sql"`, PyIceberg stores the catalog's name in its metadata rows, and the workspace prefix becomes that name. The prefix you register must match the catalog name the tables were written under. Otherwise every table is reported as not found. REST, Hive and Glue don't have this problem.

## Query It

The workspace prefix comes first, followed by the Iceberg namespace and the table:

```python
import opteryx
import pyarrow

session = opteryx.session()
morsels = session.execute_to_morsels("""
    SELECT country, COUNT(*) AS events
      FROM aistor.weblogs.events
     WHERE event_date >= CAST('2026-10-01' AS DATE)
  GROUP BY country
  ORDER BY events DESC
""")
df = pyarrow.concat_tables(morsel.to_arrow() for morsel in morsels).to_pandas()
```

Compare a `DATE` column with a `CAST`, not a bare string. A bare string is refused as a type mismatch.

An Iceberg table works like any other table. You can join it to a local Parquet folder, a PostgreSQL table or a pandas DataFrame in the same query, or to a table in a different Iceberg catalog.

To see what the catalog holds, query the workspace's `information_schema`:

```sql
SELECT table_schema, table_name, table_record_count, table_file_count
  FROM aistor.information_schema.tables;

SHOW COLUMNS FROM aistor.weblogs.events;
```

### Time travel and history

```sql
-- the table as it was at a snapshot, or at a point in time
SELECT * FROM aistor.weblogs.events VERSION AS OF 4527393058393450;
SELECT * FROM aistor.weblogs.events TIMESTAMP AS OF '2026-10-01 00:00:00';

-- the snapshot before the current one, or a tagged snapshot
SELECT * FROM aistor.weblogs.events VERSION AS OF PREVIOUS;
SELECT * FROM aistor.weblogs.events VERSION AS OF 'release_one';

-- the commit history, and the live data files with their bounds
SHOW SNAPSHOTS FOR aistor.weblogs.events;
SHOW MANIFEST FOR aistor.weblogs.events;
```

A time-travel read uses the schema the snapshot was written under. A snapshot taken before an `ADD COLUMN` doesn't show the new column. A timestamp before the table's first commit is an error, not an empty result. A tag is matched exactly as it's spelled. A branch name is refused, because answering with the branch head would answer a different question.

`SHOW SNAPSHOTS` leaves `author`, `commit_message` and `user_created` as `NULL`, because Iceberg doesn't record them. A row-level delete shows up as `overwrite`, because that's how PyIceberg commits it.

### Check the pruning

`EXPLAIN ANALYZE` shows what the catalog's statistics let Opteryx skip:

```sql
EXPLAIN ANALYZE
SELECT * FROM aistor.weblogs.events WHERE event_id = 400017;
```

Look for `files pruned` in the output. A file whose min/max bounds can't match the filter is never opened.

## What's Supported

Iceberg support is read-only.

| Works | Doesn't |
|---|---|
| `SELECT`, joins, aggregates, `EXPLAIN` | Writes: `CREATE`, `INSERT`, `UPDATE`, `DELETE`, `DROP` |
| File pruning from manifest bounds, row-group pruning from Parquet footers | Tables with merge-on-read delete files |
| Iceberg v1 and v2 tables, partitioned or not | Tables with any nested column: `struct`, `map`, `list` |
| Time travel, `SHOW SNAPSHOTS`, `SHOW MANIFEST`, `information_schema` | Data files in a format other than Parquet |
| Schema evolution across snapshots | Iceberg views, and vended credentials |

A table with merge-on-read delete files is **refused rather than read**, because reading it without applying the deletes would return deleted rows. PyIceberg never writes them. Spark, Flink and Trino can, so this is the limitation you're most likely to meet on a table they wrote.

A table with a nested column can't be read even by a query that touches only its other columns.

### Already have Parquet files?

You don't have to rewrite them to query them as a table. PyIceberg's [`add_files`](https://py.iceberg.apache.org/api/#add-files) registers existing Parquet files with an Iceberg table without copying them.

## What the Reader Does

You don't need to know any of this to use Iceberg tables. It explains what you'll see in `EXPLAIN ANALYZE` and what the [tuning](#tuning) settings change.

- **Planning reads the manifests natively.** Each metadata file is fetched whole in one GET, with no `HEAD` first. Manifests are decoded in parallel by Rugo's native Avro reader. Planning always happens in Opteryx, so a REST catalog that offers server-side scan planning isn't asked for a plan.
- **Files are pruned before they're opened.** Manifest bounds rule out data files, and Parquet footer statistics rule out row groups inside the files that are left.
- **Footers arrive in one round trip.** The last 64 KB of every surviving file is requested at once, as concurrent suffix-range GETs. Parsed footers are cached for the life of the process.
- **Only the column chunks a query needs are fetched.** Neighbouring ranges are merged into one GET. Fetching, decompressing and decoding are pipelined, so work starts on the first chunk while later ones are still arriving.
- **Bytes in flight are capped.** Requests share one link, so Opteryx admits a request only when its bytes fit under a process-wide cap, and starts its timer only then. The cap adapts to the measured throughput.

The story behind each of these, with the measurements and how we test them, is in [Iceberg Redux](/blog/2026-10-17-iceberg-redux).

## Tuning

The defaults are what we benchmark, and most workloads shouldn't need to change them. They're environment variables:

| Variable | Default | What it does |
|---|---|---|
| `OPTERYX_HTTP_MAX_BYTES_IN_FLIGHT` | `0` (adaptive) | A fixed cap on bytes in flight across the process. `0` follows the measured throughput. |
| `PARQUET_IO_COALESCE_GAP_BYTES` | 64 KiB | The largest gap between two ranges that are still merged into one GET. |
| `PARQUET_IO_COALESCE_MAX_BYTES` | 8 MB | The largest single merged GET. |
| `PARQUET_FOOTER_CACHE_BYTES` | 256 MB | Memory for parsed Parquet footers, shared by every query in the process. |

A fixed in-flight cap is a trade-off. A cap that helped on a 100 Mbps link made the same scan **4× slower** at 1,200 Mbps, which is why the default adapts.

## Troubleshooting

**`ModuleNotFoundError: No module named 'boto3'`.** The catalog signs with SigV4. Install `pyiceberg[rest-sigv4]`.

**`DatasetMetadataReadError: ... Iceberg properties name S3 endpoint ... but opteryx-core's S3 filesystem is configured for ... (AWS_S3_ENDPOINT)`.** The catalog's `s3.endpoint` doesn't match `AWS_S3_ENDPOINT`. Opteryx's own client reads the files, so the two have to agree. With AIStor, the catalog's value is the one AIStor advertises, not the one you passed, so make `AWS_S3_ENDPOINT` match it exactly.

**`DatasetMetadataReadError: ... Iceberg properties carry an S3 access key that differs from opteryx-core's credentials`.** The same check, for `s3.access-key-id` and `AWS_ACCESS_KEY_ID`.

**`IncompatibleTypesError: ... (DATE) and literal ... (VARCHAR) cannot be compared`.** Wrap the literal in `CAST('...' AS DATE)`. `DATE '...'` isn't supported.

**`DatasetReadError: No data available for the specified date`** or **`No previous version`.** The time-travel target is before the table's first snapshot. Check `SHOW SNAPSHOTS`.

**A complaint about a vended GCS token (`gcs.oauth2.token`).** The catalog is handing out credentials, which Opteryx doesn't use. Give the process its own access to the bucket and turn vending off. For Polaris, send an empty `X-Iceberg-Access-Delegation` header.

**The catalog works, but data files return `403`.** The catalog and the files use different credentials. Check that the storage variables above are set in the process that runs the query, not only in your shell.

**`DatasetNotFound` for a table you can see in the catalog.** With a SQL catalog, check that the workspace prefix matches the catalog name (see the warning above). Otherwise, check the namespace.

**A table is refused with `NotImplementedError`.** It has merge-on-read delete files or a nested column. Compact the table to apply the deletes, or rewrite it with copy-on-write deletes.

**TLS errors.** Check the scheme in `AWS_S3_ENDPOINT`. For a private CA, set `SSL_CERT_FILE`.

## Related

- [Iceberg Redux](/blog/2026-10-17-iceberg-redux): how Iceberg support was built, and how we test it
- [Connectors](/docs/guides/connectors): every way Opteryx Core reaches data
- [Connecting an Iceberg Catalog](/docs/guides/connecting-an-iceberg-catalog): Iceberg on the hosted service, with Polaris and BigLake examples
- [Read a Parquet file with Python](/docs/guides/read-a-parquet-file-with-python)
- [Read an Avro file with Python](/docs/guides/read-an-avro-file-with-python)
