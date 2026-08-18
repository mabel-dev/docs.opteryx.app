---
title: DELETE Statement — Opteryx Reference
description: DELETE is not currently supported in Opteryx
---

# DELETE

`DELETE` removes specific rows from a table.

> Warning: **DELETE is not currently supported.** Opteryx rejects it at parse time with `Opteryx does not support 'DELETE' type queries.` — there is no backend, experimental or otherwise, that accepts it.

## Working Around It

Opteryx is built for read-heavy analytical workloads, not row-level mutation.

- To remove specific rows, rewrite the table with the rows excluded:

~~~sql
CREATE OR REPLACE TABLE workspace.collection.sessions AS
SELECT * FROM workspace.collection.sessions
 WHERE expires_at >= CURRENT_TIMESTAMP;
~~~

  This replaces the whole table with the query's output — it is not a
  partial, in-place delete, and requires a connector that supports
  `CREATE TABLE`.

  Because it reads and rewrites every row, this is **not recommended for
  tables with millions of rows or more** — the cost scales with the size
  of the whole table, not with how many rows are actually removed. For
  large tables, prefer partitioning the data so only the affected
  partitions need rewriting, or batch the rewrite during a low-traffic
  window.

- To remove every row while keeping the table and its schema, use
  [TRUNCATE TABLE](truncate-table).

- To remove the table entirely, use [DROP TABLE](drop-table).

## Notes

- See [CREATE TABLE](create-table) for the `OR REPLACE` form used above.

## See Also

- [UPDATE](update)
- [INSERT](insert)
- [TRUNCATE TABLE](truncate-table)
- [DROP TABLE](drop-table)
