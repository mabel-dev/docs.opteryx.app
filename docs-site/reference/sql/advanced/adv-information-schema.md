---
title: Information Schema - Querying Opteryx's Catalog Metadata
description: Query information_schema.tables and information_schema.columns to discover the tables, views, and column definitions available in an Opteryx workspace.
---

# Information Schema

`information_schema` is a reserved schema that exposes metadata about the tables, views, and columns registered in an Opteryx workspace's catalog. It is read from the catalog live at query time — not a fixed or generated snapshot — so it reflects whatever exists in the catalog at the moment the query runs.

Eight views are currently available: `tables`, `columns`, `views`, `schemata`, `triggers`, `tasks`, `column_relationships`, and `grants`.

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

## `information_schema.column_relationships`

One row per relationship declared with
[ALTER TABLE ... ADD CONSTRAINT](/docs/reference/sql/statements/alter-table#add-constraint) —
a record that a column holds values corresponding to a column of another table.

**Nothing here is enforced.** A write that breaks a relationship succeeds, and the engine
never consults these rows when planning a query. They exist so that people and tools can
see how the tables in a workspace fit together.

| Column                    | Type        | Description                                                        |
|---------------------------|-------------|--------------------------------------------------------------------|
| `constraint_catalog`      | `VARCHAR`   | The workspace name                                                 |
| `constraint_collection`   | `VARCHAR`   | The collection the declaring table belongs to                      |
| `constraint_name`         | `VARCHAR`   | The name given to the declaration, and the handle `DROP CONSTRAINT` uses |
| `table_name`              | `VARCHAR`   | The declaring table, as `collection.dataset`                       |
| `column_name`             | `VARCHAR`   | Its column — the near end of the relationship                      |
| `referenced_table_name`   | `VARCHAR`   | The referenced table, as `collection.dataset`                      |
| `referenced_column_name`  | `VARCHAR`   | Its column — the far end                                           |
| `relationship_kind`       | `VARCHAR`   | `maps` — the columns hold corresponding values                     |
| `cardinality`             | `VARCHAR`   | As declared, never derived from the data. A foreign key means `many_to_one` |
| `origin`                  | `VARCHAR`   | `asserted` — somebody wrote it down                                |
| `status`                  | `VARCHAR`   | `active`                                                           |
| `asserted_by`             | `VARCHAR`   | Who declared it                                                    |
| `asserted_at`             | `TIMESTAMP` | When it was declared                                               |
| `verified_at`             | `TIMESTAMP` | When the declaration was last checked against the data. Always `NULL` today — nothing checks |

```sql
SELECT table_name, column_name, referenced_table_name, referenced_column_name
  FROM opteryx.information_schema.column_relationships;
```

A row is listed against the table the constraint was declared **on**. To find what points
*at* a table, filter on `referenced_table_name` — that reads every declaration in the
workspace rather than one table's, so it is the slower direction.


---

## `information_schema.grants`

The workspace's access, as a relation. One row per **object and policy that reaches it** —
for the workspace itself, each collection, and each table and view, every stored access
policy whose pattern covers it. `SHOW GRANTS ON` and `SHOW EFFECTIVE GRANTS ON` answer the
same questions one object at a time, as statements; this is both answers for the whole
workspace, so a client can read access live and narrow it with `WHERE`.

| Column             | Type      | Description                                                                 |
|--------------------|-----------|-----------------------------------------------------------------------------|
| `grant_catalog`    | `VARCHAR` | The workspace name                                                          |
| `grant_collection` | `VARCHAR` | The object's collection. `NULL` on the workspace row                        |
| `object_kind`      | `VARCHAR` | `workspace`, `collection` or `dataset` — the kinds the grant statements name |
| `object_name`      | `VARCHAR` | The object, fully qualified: `w`, `w.c` or `w.c.d` — what `GRANT ... ON <kind> <object>` takes |
| `grantee`          | `VARCHAR` | Who holds the policy                                                        |
| `role`             | `VARCHAR` | `owner`, `writer` or `reader`                                               |
| `pattern`          | `VARCHAR` | The policy's own pattern — the thing to `REVOKE` to remove this access      |
| `level`            | `VARCHAR` | The level that pattern addresses: `workspace`, `collection` or `dataset`    |
| `origin`           | `VARCHAR` | `explicit` — the policy is stored **at** this object; `inherited` — it covers the object from the collection or workspace above |

`origin` is the column the view exists for. The `explicit` rows are what `SHOW GRANTS ON`
reports for an object, and what a `GRANT` or `REVOKE` there acts on. The `inherited` rows
are what `SHOW EFFECTIVE GRANTS ON` adds — a dataset with nothing granted on it directly is
still reachable by the workspace owner, and this says so, naming the policy that does it.

One row per covering policy, never one per person: a user who reaches a dataset through
both a collection grant and a workspace grant gets two rows, because either policy alone
keeps the access in place and an administrator has to know which to change.

```sql
-- Everything stored in the workspace: every policy, once, at its own object.
SELECT object_name, grantee, role
  FROM opteryx.information_schema.grants
 WHERE origin = 'explicit';

-- Everyone who can reach one dataset, and through which policy.
SELECT grantee, role, pattern, level, origin
  FROM opteryx.information_schema.grants
 WHERE object_name = 'opteryx.sales.orders';
```

Every stored policy appears as `explicit` at its own pattern exactly once, **whether or not
the catalog still holds what it names** — a grant on a dataset that has since been dropped
is listed rather than lost, which is exactly the grant a listing needs to be complete for.
The workspace row lists the policies that cover the workspace as an object (`w.*`); the
whole workspace's policies are the `explicit` rows.

Filtering on `object_name` with `=` reads that one object without walking the catalog at
all — the read a dataset page makes. Whatever the filter, the catalog is listed once and the
policy store read once.

---

## Permissions

`information_schema.tables`, `information_schema.columns` and `information_schema.views` only ever show tables and views the querying identity has [read permission](/docs/core-concepts/access-and-permissions) on. A table that isn't readable to you simply doesn't appear in the results — it isn't hidden with an error, and it isn't visible with its schema exposed. This applies row-by-row, so a query against `information_schema` always succeeds even if you have no access to any tables in the workspace; it just returns no rows.

`information_schema.triggers` follows the same rule against the trigger's **source table**, and `information_schema.schemata` against the collection's contents — a collection appears only if something inside it is readable to you.

`information_schema.column_relationships` requires **both** tables to be readable, not just the one the constraint was declared on. A row names the other table's collection, dataset and column, so showing it to someone who can read only one side would disclose the shape of data they have no access to. A relationship you can half-see does not appear at all.

A missing execution context denies everything rather than falling back to showing all rows.

`information_schema.grants` is gated differently, because it is not about data. A row
describes who can reach an object, which is strictly more sensitive than the object's
existence, so a row is shown only where the querying identity could **administer** the
object — owner authority covering it, the same gate `SHOW GRANTS ON` holds. A collection
owner sees their collection and what is under it; everything else is simply absent, not
refused.

---

## Limitations

This is an early implementation. Known gaps:

- `tables`, `columns`, `views`, `schemata`, `triggers`, `tasks`, `column_relationships` and `grants` are implemented. `routines` is not.
- `information_schema.columns` and `information_schema.views` do one catalog round trip per table or view found. Predicate pushdown covers only equality and `IN` on the enumeration key columns (`table_catalog`, `table_schema`, `table_name`, and `table_type` on `tables`) — those are known before any round trip, so filtering on them skips the lookups entirely. Every other predicate is applied after the fact, so an unfiltered query against a workspace with a very large number of tables is proportionally slower.