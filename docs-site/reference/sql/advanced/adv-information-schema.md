---
title: Information Schema - Querying Opteryx's Catalog Metadata
description: Query information_schema.tables and information_schema.columns to discover the tables, views, and column definitions available in an Opteryx workspace.
---

# Information Schema

`information_schema` is a reserved schema that exposes metadata about the tables, views, and columns registered in an Opteryx workspace's catalog. It is read from the catalog live at query time — not a fixed or generated snapshot — so it reflects whatever exists in the catalog at the moment the query runs.

Five views are currently available: `tables`, `columns`, `views`, `schemata`, and `triggers`.

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

| Column                 | Type        | Description                                       |
|------------------------|-------------|----------------------------------------------------|
| `table_catalog`        | `VARCHAR`   | The workspace name                                 |
| `table_schema`         | `VARCHAR`   | The collection/namespace the table belongs to      |
| `table_name`           | `VARCHAR`   | The table or view name                             |
| `table_type`           | `VARCHAR`   | `BASE TABLE` or `VIEW`                             |
| `table_sort_order`     | `VARCHAR`   | The dataset's configured sort order                |
| `snapshot_id`          | `INT64`     | The current snapshot's identifier                  |
| `snapshot_sequence_id` | `INT64`     | The current snapshot's write sequence number       |
| `table_updated_at`     | `TIMESTAMP` | When the current snapshot was committed            |
| `table_file_count`     | `INT64`     | Data files held at the current snapshot            |
| `table_bytes`          | `INT64`     | Total bytes held at the current snapshot           |
| `table_record_count`   | `INT64`     | Records held at the current snapshot               |

```sql
SELECT table_schema, table_name, table_type
  FROM opteryx.information_schema.tables
 ORDER BY table_schema, table_name;
```

The statistics columns come from the table's current snapshot. **Views have no snapshot, so
they report `NULL` for all of them** — as does a table that has never been committed to.
Reading them costs one extra catalog round trip per table; project only `table_type` and the
name columns if you don't need them.

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

> Be Aware: `information_schema.columns` only covers tables — views are not included. A view's columns are only known once its query is planned, and that isn't done just to populate this listing. Use `information_schema.views` for a view's SQL text.

---

## `information_schema.views`

One row per view in the workspace's catalog, with its definition. This is a separate view
from `tables`, which lists views too but carries only their name and type — `tables` never
opens a view's document, `views` does.

| Column            | Type        | Description                                    |
|-------------------|-------------|------------------------------------------------|
| `table_catalog`   | `VARCHAR`   | The workspace name                             |
| `table_schema`    | `VARCHAR`   | The collection/namespace the view belongs to   |
| `table_name`      | `VARCHAR`   | The view name                                  |
| `view_definition` | `VARCHAR`   | The view's SQL text                            |
| `view_owner`      | `VARCHAR`   | Who created the view                           |
| `view_updated_at` | `TIMESTAMP` | When the view was last updated                 |

```sql
SELECT table_schema, table_name, view_definition
  FROM opteryx.information_schema.views
 WHERE table_schema = 'reporting';
```

It does one catalog round trip per view found, so filter by `table_schema`/`table_name`
where you can.

---

## `information_schema.schemata`

One row per collection in the workspace. Deliberately thin: `information_schema` is scoped
to a single workspace, so `catalog_name` is constant across every row, and the catalog
exposes no readable per-collection metadata beyond the name.

| Column         | Type      | Description                    |
|----------------|-----------|--------------------------------|
| `catalog_name` | `VARCHAR` | The workspace name             |
| `schema_name`  | `VARCHAR` | The collection/namespace name  |

```sql
SELECT schema_name
  FROM opteryx.information_schema.schemata
 ORDER BY schema_name;
```

A collection is listed only if you can read **at least one** table or view inside it. The
per-row `READ` check the other views apply is per-*table*, so without this a collection you
have no access to anywhere would still have its existence disclosed here.

---

## `information_schema.triggers`

One row per trigger in the workspace's catalog — the refresh triggers created by
[CREATE MATERIALIZED VIEW](/docs/reference/sql/statements/create-materialized-view), which
re-run a materialized view's query when data is committed to a source table.

| Column               | Type        | Description                                                        |
|----------------------|-------------|--------------------------------------------------------------------|
| `trigger_catalog`    | `VARCHAR`   | The workspace name                                                 |
| `trigger_collection` | `VARCHAR`   | The collection the trigger belongs to                              |
| `trigger_name`       | `VARCHAR`   | The trigger name, generated as `refresh__<collection>__<view_name>__<suffix>` |
| `event_object_table` | `VARCHAR`   | The source table the trigger is attached to, as `collection.dataset` |
| `action_kind`        | `VARCHAR`   | The kind of action the trigger performs                            |
| `target_view`        | `VARCHAR`   | The materialized view the trigger refreshes                        |
| `created_by`         | `VARCHAR`   | Who created the trigger                                            |
| `created_at`         | `TIMESTAMP` | When the trigger was created                                       |
| `last_fired_at`      | `TIMESTAMP` | When the trigger last fired                                        |
| `last_fired_status`  | `VARCHAR`   | How the last firing went — the place to look when a materialized view seems stale |

```sql
SELECT trigger_name, event_object_table, target_view, last_fired_at, last_fired_status
  FROM opteryx.information_schema.triggers;
```

For the triggers on a single table, [SHOW TRIGGERS FOR](/docs/reference/sql/statements/show-triggers)
is the shorthand.

---

## Permissions

`information_schema.tables`, `information_schema.columns` and `information_schema.views` only ever show tables and views the querying identity has [read permission](/docs/core-concepts/access-and-permissions) on. A table that isn't readable to you simply doesn't appear in the results — it isn't hidden with an error, and it isn't visible with its schema exposed. This applies row-by-row, so a query against `information_schema` always succeeds even if you have no access to any tables in the workspace; it just returns no rows.

`information_schema.triggers` follows the same rule against the trigger's **source table**, and `information_schema.schemata` against the collection's contents — a collection appears only if something inside it is readable to you.

A missing execution context denies everything rather than falling back to showing all rows.

---

## Limitations

This is an early implementation. Known gaps:

- `tables`, `columns`, `views`, `schemata` and `triggers` are implemented. `routines` is not.
- `information_schema.columns` and `information_schema.views` do one catalog round trip per table or view found. Predicate pushdown covers only equality and `IN` on the enumeration key columns (`table_catalog`, `table_schema`, `table_name`, and `table_type` on `tables`) — those are known before any round trip, so filtering on them skips the lookups entirely. Every other predicate is applied after the fact, so an unfiltered query against a workspace with a very large number of tables is proportionally slower.