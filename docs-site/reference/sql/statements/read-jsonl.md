---
title: READ_JSONL — Opteryx Reference
description: Query a JSON Lines (JSONL) file directly by path, without registering it as a table
---

# READ_JSONL

`READ_JSONL` is a table function: it reads a JSON Lines file (one JSON object per line)
directly by path, without registering it as a table in a catalog first. Use it in a
`FROM` clause wherever a table name is expected.

## Syntax

~~~sql
FROM READ_JSONL(path)
~~~

~~~sql
FROM READ_JSONL(path, ignore_errors => boolean, infer_schema => boolean,
                       infer_sample_size => integer)
~~~

`path` must be a single string literal.

## Arguments

- **ignore_errors** `boolean`, default `false`
    If `false`, a malformed JSON record fails the query. If `true`, malformed records
    are skipped instead.
- **infer_schema** `boolean`, default `true`
- **infer_sample_size** `integer`, default `5`
    Number of rows sampled to infer each column's type.

## Examples

### Query a single file
~~~sql
SELECT *
  FROM READ_JSONL('data/events.jsonl');
~~~

### Skip malformed records instead of failing
~~~sql
SELECT *
  FROM READ_JSONL('data/events.jsonl', ignore_errors => true);
~~~

### Query a set of files with a glob
~~~sql
SELECT *
  FROM READ_JSONL('data/events-*.jsonl');
~~~

### Alias the relation
~~~sql
SELECT e.id, e.status
  FROM READ_JSONL('data/events.jsonl') AS e
 WHERE e.status = 'ok';
~~~

## Notes

- Supported column types are `INTEGER`, `FLOAT`, `BOOLEAN`, `VARCHAR`, and `NULL`. A
  column whose values don't fit one of these (for example a nested array or object)
  is not currently supported.
- Column names and types are inferred from the file's own content at query-plan time;
  there is no `AS alias(col1, col2, ...)` form to rename columns — use `SELECT ... AS
  new_name` instead. A plain relation alias (`AS alias`, no column list) is supported.
- Standard filter and column pushdown apply: simple `WHERE column op literal`
  predicates and the columns your query actually references are pushed into the read.
- A glob path (containing `*`, `?`, or `[`) matches multiple files; their combined
  content is read as one relation. Every matched file's columns and inferred types must
  agree with the first file's — a file whose schema disagrees fails the query rather
  than silently producing mismatched or missing columns.
- `gs://bucket/object` paths are supported and are always fetched anonymously (a public
  GCS object is read; a private one fails with an error) — Opteryx never signs a request
  or uses platform credentials on your behalf for a path given to `READ_JSONL`. Glob
  patterns are not supported for `gs://` paths, because listing a bucket's contents
  needs a permission a public, unauthenticated read does not have. Use `gs://`, not
  `gcs://`.
