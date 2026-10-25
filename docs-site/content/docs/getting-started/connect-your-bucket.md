---
title: Connect Your Bucket - Opteryx Quick Start
description: Query Parquet, CSV and JSON Lines files in your own S3 or Google Cloud Storage bucket from opteryx.app, where they sit. A public file takes one line of SQL; a private bucket takes one stored credential.
---

# Connect Your Bucket

Your files stay in your bucket. Opteryx reads them where they are, when a query asks for them, so there's nothing to import and nothing to keep in sync.

How much setup that takes comes down to one question: **can anyone read the file, or only you?** A public file needs nothing at all. A private bucket needs a credential stored once.

## What You'll Be Able to Do

By the end of this page you'll be able to:

- query a public file in S3 or Google Cloud Storage with one line of SQL
- read a private bucket by storing a credential once and naming it in your query
- save what you read as a table, if you'd rather query it by name

## Before You Start

- **An opteryx.app account.** Sign in with Google, Microsoft or GitHub; see [Logging In](registration). The free plan is enough for public files.
- **Files in Parquet, CSV or JSON Lines.** Parquet is the easiest place to start: its schema travels inside the file, so there's nothing to configure.

## A Public File: One Line

If the object is publicly readable, point a query at it. Open Studio, paste this with your own path, and press **Run**:

```sql
SELECT *
  FROM READ_PARQUET('s3://your-bucket/path/to/file.parquet')
 LIMIT 10;
```

Use `gs://` for Google Cloud Storage. That's the whole setup: no credential, no table to create. Your `WHERE` filters and the columns you select are pushed into the read, so Opteryx fetches only what the query needs.

CSV and JSON Lines work the same way, with [READ_CSV](/docs/reference/sql/statements/read-csv) and [READ_JSONL](/docs/reference/sql/statements/read-jsonl).

One limit: a public path reads one file per query. Expanding `*.parquet` means listing the bucket, which an anonymous read isn't allowed to do, so reading a whole folder needs the credential described next.

## A Private Bucket: Store a Credential Once

For a private bucket, you store a read-only credential in your workspace as a **secret**, then name it in your queries. You do this once. After that, reading the bucket is one extra argument.

Storing a secret needs two things: you must **own** the workspace, and the workspace must have a **billing account**. The secret is encrypted under a key that belongs to the billing account, so a workspace without one has nowhere to keep it.

### 1. Make a read-only credential

In your cloud console, create a credential that can only *read* the files you want to query:

- **AWS:** an access key for an IAM user or role with `s3:GetObject` on the bucket, plus `s3:ListBucket` if you want to read whole folders with `*`.
- **Google Cloud:** a JSON key for a service account with the **Storage Object Viewer** role on the bucket.

Grant it on the one bucket you need, not on the whole account.

### 2. Store it in your workspace

Run this once in Studio, with your own values:

```sql
CREATE SECRET lake_reader IN my_workspace (
    TYPE              'aws_access_key',
    ACCESS_KEY_ID     'AKIA...',
    SECRET_ACCESS_KEY '...',
    SCOPE             's3://your-bucket/'
);
```

`SCOPE` is the part of the bucket this secret may read. A query can't use it to reach anything outside that prefix. For Google Cloud, use `TYPE 'gcs_service_account'`, put the key file's JSON in `KEY`, and give a `gs://` scope; [CREATE SECRET](/docs/reference/sql/statements/create-secret) has both forms.

The value is encrypted and write-only. Nobody can read it back, including you, and Studio's history shows it redacted.

### 3. Name it in your query

```sql
SELECT *
  FROM READ_PARQUET('s3://your-bucket/exports/*.parquet',
                    credentials => 'my_workspace.lake_reader')
 LIMIT 10;
```

With a secret, `*` works, so one query can read a whole folder.

## Keep It as a Table (Optional)

Reading in place is the default, and you don't have to do anything more. If you'd rather query the data by name, or share it with your team through workspace permissions, save it as a table:

```sql
CREATE TABLE my_workspace.my_collection.events AS
SELECT *
  FROM READ_PARQUET('s3://your-bucket/exports/*.parquet',
                    credentials => 'my_workspace.lake_reader');
```

This copies the rows into your workspace as they are at that moment, and it counts toward your storage. Later changes to the files in your bucket aren't picked up; run it again to refresh.

## Already Have a Catalog or Database?

If an Iceberg REST catalog manages your tables, connect the catalog instead, and Opteryx queries its tables by name: see [Connecting an Iceberg Catalog](/docs/guides/connecting-an-iceberg-catalog). For a PostgreSQL server, see [Connecting a PostgreSQL Database](/docs/guides/connecting-a-postgres-database).

## If Something Goes Wrong

| You see | What to do |
| --- | --- |
| A read of a private object fails | It isn't public. Store a secret and add `credentials =>` to the query. |
| A path with `*` fails without `credentials =>` | Name a single file, or store a secret. Globs need one. |
| `You do not have permission to manage secrets in workspace ws.` | Only the workspace owner can store secrets. Ask them, or use a workspace you own. |
| `workspace ws has no billing account, so it has no key to encrypt secrets under` | Add a billing account to the workspace, then run `CREATE SECRET` again. |

## Next Steps

- [Secret Management](/docs/reference/sql/advanced/adv-secret-management): how `SCOPE`, permissions and rotating a credential work.
- [READ_PARQUET](/docs/reference/sql/statements/read-parquet): every option and its limits.
- [Your First Table](your-first-table): more on building tables in your workspace.
