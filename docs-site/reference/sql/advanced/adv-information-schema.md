---
title: Information Schema - Querying Opteryx's Catalog Metadata
description: Query information_schema.tables and information_schema.columns to discover the tables, views, and column definitions available in an Opteryx workspace.
---

# Information Schema

`information_schema` is a reserved schema that exposes metadata about the tables, views, and columns registered in an Opteryx workspace's catalog. It is read from the catalog live at query time — not a fixed or generated snapshot — so it reflects whatever exists in the catalog at the moment the query runs.

Two views are currently available: `tables` and `columns`.

```sql
SELECT *
  FROM opteryx.information_schema.tables;
```

## Addressing

`information_schema` sits inside a workspace's own namespace, addressed the same three-part way as any other catalog table — `<workspace>.information_schema.<view>`:

```sql
SELECT *
  FROM opteryx.information_schema.tables;

SELECT *
  FROM opteryx.information_schema.columns;
```

`information_schema` is only reachable through a catalog-backed workspace. It has no meaning against a plain filesystem/Parquet connection, and querying it there returns an unknown-relation error rather than an empty result.

---

## `information_schema.tables`

One row per table or view in the workspace's catalog.

| Column           | Type      | Description                                       |
|------------------|-----------|----------------------------------------------------|
| `table_catalog`  | `VARCHAR` | The workspace name                                 |
| `table_schema`   | `VARCHAR` | The collection/namespace the table belongs to      |
| `table_name`     | `VARCHAR` | The table or view name                             |
| `table_type`     | `VARCHAR` | `BASE TABLE` or `VIEW`                             |

```sql
SELECT table_schema, table_name, table_type
  FROM opteryx.information_schema.tables
 ORDER BY table_schema, table_name;
```

---

## `information_schema.columns`

One row per column of every table in the workspace's catalog.

| Column             | Type      | Description                                          |
|--------------------|-----------|--------------------------------------------------------|
| `table_catalog`    | `VARCHAR` | The workspace name                                     |
| `table_schema`     | `VARCHAR` | The collection/namespace the table belongs to          |
| `table_name`       | `VARCHAR` | The table name                                          |
| `column_name`      | `VARCHAR` | The column name                                         |
| `ordinal_position` | `INTEGER` | The column's 1-based position in the table              |
| `data_type`        | `VARCHAR` | The column's Opteryx type, e.g. `VARCHAR`, `DECIMAL(10,2)` |
| `is_nullable`      | `VARCHAR` | `YES` or `NO`                                            |

```sql
SELECT column_name, data_type, is_nullable
  FROM opteryx.information_schema.columns
 WHERE table_schema = 'test'
   AND table_name = 'planets'
 ORDER BY ordinal_position;
```

!!! note
    `information_schema.columns` only covers tables — views are not included. A view's columns are only known once its query is planned, and that isn't done just to populate this listing.

---

## Permissions

`information_schema.tables` and `information_schema.columns` only ever show tables the querying identity has [read permission](/docs/core-concepts/access-and-permissions) on. A table that isn't readable to you simply doesn't appear in the results — it isn't hidden with an error, and it isn't visible with its schema exposed. This applies row-by-row, so a query against `information_schema` always succeeds even if you have no access to any tables in the workspace; it just returns no rows.

---

## Limitations

This is an early implementation. Known gaps:

- Only `tables` and `columns` are implemented. `schemata`, `views`, and `routines` are not yet available.
- `information_schema.columns` does one metadata lookup per table in the catalog and has no filter pushdown yet — an unfiltered query against a workspace with a very large number of tables will be proportionally slower than filtering by `table_schema`/`table_name` first.