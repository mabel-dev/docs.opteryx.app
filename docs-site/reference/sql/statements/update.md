---
title: UPDATE Statement — Opteryx Reference
description: UPDATE is not currently supported in Opteryx
---

# UPDATE

`UPDATE` modifies existing rows in a table in place.

> Warning: **UPDATE is not currently supported.** Opteryx rejects it at parse time with `Opteryx does not support 'UPDATE' type queries.` — there is no backend, experimental or otherwise, that accepts it.

## Working Around It

Opteryx is built for read-heavy analytical workloads, not row-level mutation. To apply row-level changes, rewrite the table:

~~~sql
CREATE OR REPLACE TABLE workspace.collection.orders AS
SELECT *,
       CASE WHEN status = 'sale' THEN 99.99 ELSE price END AS price
  FROM workspace.collection.orders;
~~~

This replaces the whole table with the query's output — it is not a partial, in-place update, and requires a connector that supports `CREATE TABLE`.

## Notes

- See [CREATE TABLE](create-table.md) for the `OR REPLACE` form used above.

## See Also

- [DELETE](delete.md)
- [INSERT](insert.md)
