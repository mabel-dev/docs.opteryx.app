---
title: READ_PARQUET — Opteryx Reference
description: Query a Parquet file directly by path, without registering it as a table
---

# READ_PARQUET

`READ_PARQUET` is a table function: it reads a Parquet file (or a set of files matched
by a glob) directly by path, without registering it as a table in a catalog first. Use
it in a `FROM` clause wherever a table name is expected.

## Syntax

~~~sql
FROM READ_PARQUET(<path> [, credentials => '<workspace>.<secret>'])
~~~

## Parameters

- **`<path>`** — single string literal giving the file path (or glob pattern matching
  multiple files) to read.

- **`credentials => '<workspace>.<secret>'`** — read a private `gs://` or `s3://`
  path with a stored [secret](create-secret). A string literal naming the secret, qualified
  with its workspace; never the credential itself. Every file read must fall under the
  secret's `SCOPE`, and you need `ALTER` on the secret's whole workspace to use it.

`READ_PARQUET` takes no other options — Parquet's schema is read straight from the
file's own footer, so there is nothing to configure the way there is for
`READ_CSV`/`READ_JSONL`.

## Examples

### Query a Single File
~~~sql
SELECT *
  FROM READ_PARQUET('data/packages.parquet');
~~~

### Query a Remote File
~~~sql
SELECT *
  FROM READ_PARQUET('https://example.com/data/packages.parquet');
~~~

### Query a Set of Files with a Glob
~~~sql
SELECT *
  FROM READ_PARQUET('data/packages-*.parquet');
~~~

### Use Inside CREATE TABLE AS
~~~sql
CREATE TABLE my_workspace.my_collection.packages AS
SELECT *
  FROM READ_PARQUET('https://example.com/data/packages-*.parquet');
~~~

### Alias the Relation
~~~sql
SELECT p.name
  FROM READ_PARQUET('data/packages.parquet') AS p
 WHERE p.active = TRUE;
~~~

### Read a Private Bucket with a Stored Secret
~~~sql
SELECT *
  FROM READ_PARQUET('gs://acme-exports/billing/2026-10/*.parquet',
                    credentials => 'analytics.billing_reader');
~~~

## Notes

- Column names and types come directly from the schema embedded in the Parquet file(s);
  there is no `AS alias(col1, col2, ...)` form to rename columns — use `SELECT ... AS
  new_name` instead. A plain relation alias (`AS alias`, no column list) is supported.
- Standard filter and column pushdown apply: `WHERE` predicates and the columns your
  query actually references are pushed into the scan.
- A glob path (containing `*`, `?`, or `[`) matches multiple files; their combined
  content is read as one relation. Non-`.parquet` files matched by a glob are silently
  excluded.
- `gs://bucket/object` and `s3://bucket/object` paths are supported. **Without
  `credentials =>`** they are always fetched anonymously (a public object is read; a
  private one fails with an error) — Opteryx never signs a request or uses platform
  credentials on your behalf for a path given to `READ_PARQUET`, and never picks a secret
  from the path. Glob patterns are not supported on the anonymous path, because
  listing a bucket's contents needs a permission a public, unauthenticated read does
  not have. **With `credentials =>`** the read is signed with the named
  [secret](create-secret), and globs work: every file the glob expands to is checked against
  the secret's `SCOPE` before anything is read. Use `gs://`, not `gcs://`.

## See Also

- [CREATE SECRET](create-secret)
- [Secret Management](/docs/reference/sql/advanced/adv-secret-management)
- [READ_CSV](read-csv)
- [READ_JSONL](read-jsonl)
- [CREATE TABLE](create-table)
