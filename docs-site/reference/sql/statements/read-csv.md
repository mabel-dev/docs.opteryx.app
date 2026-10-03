---
title: READ_CSV — Opteryx Reference
description: Query a CSV (or TSV) file directly by path, without registering it as a table
---

# READ_CSV

`READ_CSV` is a table function: it reads a CSV file directly by path, without
registering it as a table in a catalog first. Use it in a `FROM` clause wherever a
table name is expected.

## Syntax

~~~sql
FROM READ_CSV(<path> [, separator => <char>]
                      [, has_header_row => <boolean>]
                      [, ignore_errors => <boolean>]
                      [, infer_sample_size => <integer>]
                      [, credentials => '<workspace>.<secret>'])
~~~

## Parameters

- **`<path>`** — single string literal giving the file path (or glob pattern matching
  multiple files) to read.
- **`separator => <char>`**, default `','` — Single-character field separator. Use
  `'\t'` for TSV.
- **`has_header_row => <boolean>`**, default `true` — If `false`, the first row is
  treated as data, and columns are named `col_0`, `col_1`, ...
- **`ignore_errors => <boolean>`**, default `false` — Column types are inferred from
  the first `infer_sample_size` values seen in each column. If a later value in that
  column doesn't fit the inferred type, the default (`false`) fails the query, naming
  the column and the offending value. Set to `true` to treat that value as `NULL`
  instead.
- **`infer_sample_size => <integer>`**, default `5` — Number of non-null values per
  column sampled to infer its type. A larger value reduces the chance of a later type
  mismatch at the cost of a larger upfront sample.
- **`credentials => '<workspace>.<secret>'`** — read a private `gs://` or `s3://`
  path with a stored [secret](create-secret). A string literal naming the secret, qualified
  with its workspace; never the credential itself. Every file read must fall under the
  secret's `SCOPE`, and you need `ALTER` on the secret's whole workspace to use it.

## Examples

### Query a Single File
~~~sql
SELECT *
  FROM READ_CSV('data/orders.csv');
~~~

### Tab-Separated File with No Header Row
~~~sql
SELECT *
  FROM READ_CSV('data/orders.tsv', separator => '\t', has_header_row => false);
~~~

### Query a Set of Files with a Glob
~~~sql
SELECT *
  FROM READ_CSV('data/orders-*.csv');
~~~

### Tolerate Values That Don't Match the Inferred Column Type
~~~sql
SELECT *
  FROM READ_CSV('data/orders.csv', ignore_errors => true);
~~~

### Alias the Relation
~~~sql
SELECT o.id, o.total
  FROM READ_CSV('data/orders.csv') AS o
 WHERE o.total > 100;
~~~

### Read a Private Bucket with a Stored Secret
~~~sql
SELECT *
  FROM READ_CSV('gs://acme-exports/billing/2026-10/*.csv',
                credentials => 'analytics.billing_reader');
~~~

## Notes

- Supported column types are `INTEGER`, `FLOAT`, `VARCHAR`, and `NULL` — a column
  widens from `INTEGER` to `FLOAT` to `VARCHAR` as needed to fit the values seen during
  inference. There is no `BOOLEAN` type: CSV has no native boolean literal syntax, so
  values like `true`/`false` are read as `VARCHAR`.
- Column names and types are inferred from the file's own content at query-plan time;
  there is no `AS alias(col1, col2, ...)` form to rename columns — use `SELECT ... AS
  new_name` instead. A plain relation alias (`AS alias`, no column list) is supported.
- Standard filter and column pushdown apply: simple `WHERE column op literal`
  predicates and the columns your query actually references are pushed into the read.
- A glob path (containing `*`, `?`, or `[`) matches multiple files; their combined
  content is read as one relation. Every matched file's columns and inferred types must
  agree with the first file's — a file whose schema disagrees fails the query rather
  than silently producing mismatched or missing columns.
- `gs://bucket/object` and `s3://bucket/object` paths are supported. **Without
  `credentials =>`** they are always fetched anonymously (a public object is read; a
  private one fails with an error) — Opteryx never signs a request or uses platform
  credentials on your behalf for a path given to `READ_CSV`, and never picks a secret
  from the path. Glob patterns are not supported on the anonymous path, because
  listing a bucket's contents needs a permission a public, unauthenticated read does
  not have. **With `credentials =>`** the read is signed with the named
  [secret](create-secret), and globs work: every file the glob expands to is checked against
  the secret's `SCOPE` before anything is read. Use `gs://`, not `gcs://`.

## See Also

- [CREATE SECRET](create-secret)
- [Secret Management](/docs/reference/sql/advanced/adv-secret-management)
- [READ_JSONL](read-jsonl)
- [READ_PARQUET](read-parquet)
- [CREATE TABLE](create-table)
