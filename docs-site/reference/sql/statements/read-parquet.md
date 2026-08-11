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
FROM READ_PARQUET(<path>)
~~~

## Parameters

- **`<path>`** — single string literal giving the file path (or glob pattern matching
  multiple files) to read.

`READ_PARQUET` takes no other arguments — Parquet's schema is read straight from the
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

## Notes

- Column names and types come directly from the schema embedded in the Parquet file(s);
  there is no `AS alias(col1, col2, ...)` form to rename columns — use `SELECT ... AS
  new_name` instead. A plain relation alias (`AS alias`, no column list) is supported.
- Standard filter and column pushdown apply: `WHERE` predicates and the columns your
  query actually references are pushed into the scan.
- A glob path (containing `*`, `?`, or `[`) matches multiple files; their combined
  content is read as one relation. Non-`.parquet` files matched by a glob are silently
  excluded.
- `gs://bucket/object` paths are supported and are always fetched anonymously (a public
  GCS object is read; a private one fails with an error) — Opteryx never signs a request
  or uses platform credentials on your behalf for a path given to `READ_PARQUET`. Glob
  patterns are not supported for `gs://` paths, because listing a bucket's contents
  needs a permission a public, unauthenticated read does not have. Use `gs://`, not
  `gcs://`.

## See Also

- [READ_CSV](read-csv.md)
- [READ_JSONL](read-jsonl.md)
- [CREATE TABLE](create-table.md)
