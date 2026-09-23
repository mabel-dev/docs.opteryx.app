---
title: CREATE TABLE Statement — Opteryx Reference
description: SQL CREATE TABLE and CREATE TABLE AS SELECT (CTAS) statement syntax and examples for creating tables in Opteryx
---

# CREATE TABLE

The `CREATE TABLE` statement creates a new table. Opteryx supports two forms:

| Form | Purpose |
|------|---------|
| [Explicit Columns](#explicit-columns) | Create an empty table with a hand-written column list |
| [AS SELECT (CTAS)](#as-select-ctas) | Create a table by materializing the result of a query |

`CREATE OR REPLACE TABLE ... AS SELECT` atomically replaces an existing table's contents with a new query result.

## Syntax

~~~sql
CREATE TABLE <table_name> (
  <column_name> <type> [ NOT NULL ]
      [ CONSTRAINT <constraint_name> REFERENCES <table_name> ( <column> ) NOT ENFORCED ] [, ...]
  [, CONSTRAINT <constraint_name>
       FOREIGN KEY ( <column> ) REFERENCES <table_name> ( <column> ) NOT ENFORCED ] [, ...]
);

CREATE [ OR REPLACE ] TABLE [ IF NOT EXISTS ] <table_name> AS
SELECT ...;
~~~

`<table_name>` is fully qualified as `<workspace>.<collection>.<table_name>`.

## Explicit Columns

~~~sql
CREATE TABLE <table_name> (
  <column_name> <type> [ NOT NULL ]
      [ CONSTRAINT <constraint_name> REFERENCES <table_name> ( <column> ) NOT ENFORCED ] [, ...]
  [, CONSTRAINT <constraint_name>
       FOREIGN KEY ( <column> ) REFERENCES <table_name> ( <column> ) NOT ENFORCED ] [, ...]
);
~~~

### Parameters

- **`<table_name>`** — fully qualified as `<workspace>.<collection>.<table_name>`.
- **`<column_name> <type>`** — one entry per column, comma-separated.
- `NOT NULL` — **recorded in the schema, not enforced.** See below.
- `CONSTRAINT ... REFERENCES ... NOT ENFORCED` — declares an informational foreign
  key, **recorded and never checked.** See
  [Declaring a Relationship](#declaring-a-relationship) below.

### NOT NULL Is Recorded, Not Enforced

A column may be declared `NOT NULL`. The declaration is accepted and stored — the
column's schema entry reads `nullable: false`, and [SHOW COLUMNS](show-columns)
reports it — but **Opteryx does not enforce it**. An `INSERT` writing `NULL` into a
`NOT NULL` column succeeds, and the `NULL` is stored and read back:

~~~sql
CREATE TABLE my_workspace.my_collection.readings (
  sensor_id INT64 NOT NULL,
  observed   VARCHAR
);

INSERT INTO my_workspace.my_collection.readings VALUES (NULL, 'x');
-- succeeds; sensor_id reads back NULL
~~~

This is deliberate and consistent across the engine: Opteryx enforces no integrity
constraints at all — no `PRIMARY KEY`, `FOREIGN KEY`, `CHECK` or `UNIQUE` either
(see [SQL Conformance](../conformance)). `NOT NULL` is carried so a schema
imported from, or exported to, another system keeps its shape and its intent;
treat it as documentation of what the data *should* contain, and validate on the
way in if you need the guarantee.

For the same reason `ALTER TABLE ... ALTER COLUMN ... SET NOT NULL` is rejected
rather than accepted and ignored — see [ALTER TABLE](alter-table).

### Declaring a Relationship

A table can record that one of its columns holds values corresponding to a column of
another table — a customer reference that matches a customer id — as a foreign key
marked `NOT ENFORCED`. This is the same declaration
[ALTER TABLE ... ADD CONSTRAINT](alter-table#add-constraint) makes, written into the
statement that creates the table. There are two spellings, and they record the same
thing.

At the end of the column list:

~~~sql
CREATE TABLE support.helpdesk.tickets (
  ticket_id    INT64 NOT NULL,
  customer_ref INT64,
  CONSTRAINT tickets_customer_fk
    FOREIGN KEY (customer_ref) REFERENCES support.crm.customers (id) NOT ENFORCED
);
~~~

Or on the column itself, where the column is the near end and takes no column list:

~~~sql
CREATE TABLE support.helpdesk.tickets (
  ticket_id    INT64 NOT NULL,
  customer_ref INT64
    CONSTRAINT tickets_customer_fk REFERENCES support.crm.customers (id) NOT ENFORCED
);
~~~

**Nothing is enforced.** A write that breaks the relationship succeeds, and the engine
never consults the declaration when planning a query. It is recorded so that people and
tools can see how your tables fit together; read it back from
[`information_schema.column_relationships`](/docs/reference/sql/advanced/adv-information-schema).

- `NOT ENFORCED` is required and is never assumed. A plain `FOREIGN KEY` is an enforcing
  one, and Opteryx will not accept a rule it has no intention of applying.
- `CONSTRAINT <constraint_name>` is required, and names must be unique within the
  statement. The name is the only handle
  [ALTER TABLE ... DROP CONSTRAINT](alter-table#drop-constraint) has on the relationship.
- One column on each side. A composite key is not supported.
- The column must be one this statement declares. The referenced column must exist, and
  the referenced table must be in the same workspace as the one being created.
- Clauses that describe enforcement are rejected: `ON DELETE`, `ON UPDATE`, `MATCH`,
  `DEFERRABLE`, `INITIALLY` and `NOT VALID`.
- Needs at least `reader` on the referenced table, on top of what creating the table
  needs, so a relationship cannot be declared into data you have never seen.

Every other constraint is rejected rather than accepted and ignored: `PRIMARY KEY`,
`UNIQUE`, `CHECK` and `INDEX` at table level, and `PRIMARY KEY`, `UNIQUE`, `CHECK`,
`DEFAULT`, `COMMENT` and `COLLATE` on a column.

### Examples

#### Create a Table with Explicit Columns
~~~sql
CREATE TABLE my_workspace.my_collection.users (
  id BIGINT,
  name VARCHAR,
  email VARCHAR,
  active BOOLEAN
);
~~~

## AS SELECT (CTAS)

~~~sql
CREATE [ OR REPLACE ] TABLE [ IF NOT EXISTS ] <table_name> AS
SELECT ...;
~~~

Commonly called CTAS.

### Parameters

- **`<table_name>`** — fully qualified as `<workspace>.<collection>.<table_name>`.
- `OR REPLACE` — replace an existing table's contents with the query result instead of
  failing if the table already exists.
- `IF NOT EXISTS` — skip creation without error if the table already exists, instead of
  failing.

### Examples

#### Create a Table from a Query (CTAS)
~~~sql
CREATE TABLE my_workspace.my_collection.active_users AS
SELECT id, name, email
  FROM my_workspace.my_collection.users
 WHERE active = TRUE;
~~~

#### Create a Table from an External File
~~~sql
CREATE TABLE my_workspace.my_collection.packages AS
SELECT *
  FROM read_parquet('https://example.com/data/packages-*.parquet');
~~~

#### Skip Creation if the Table Already Exists
~~~sql
CREATE TABLE IF NOT EXISTS my_workspace.my_collection.active_users AS
SELECT id, name, email
  FROM my_workspace.my_collection.users
 WHERE active = TRUE;
~~~

#### Replace an Existing Table's Contents
~~~sql
CREATE OR REPLACE TABLE my_workspace.my_collection.active_users AS
SELECT id, name, email
  FROM my_workspace.my_collection.users
 WHERE active = TRUE AND last_login > '2026-01-01';
~~~

### Notes

- Every selected column must resolve to a concrete type; a column that is entirely `NULL` (with no other type information) is rejected.
- A CTAS cannot declare a constraint: its columns come from the `SELECT` and are not known until it is bound. Create the table, then declare the relationship with [ALTER TABLE ... ADD CONSTRAINT](alter-table#add-constraint).
- Plain `CREATE TABLE ... AS SELECT` fails if the target table already exists. Use `CREATE TABLE IF NOT EXISTS ... AS SELECT` to skip silently, or `CREATE OR REPLACE TABLE ... AS SELECT` to replace it.
- `CREATE OR REPLACE TABLE ... AS SELECT` creates the table if it doesn't exist yet, or atomically replaces its contents if it does. The replacement is all-or-nothing: if the query fails partway through, the existing table is left completely untouched.
- Replacing an existing table currently requires the new query's columns to match the existing table's columns exactly. Changing the column set with `CREATE OR REPLACE` is not yet supported.
- Replacing an existing table's contents requires `owner` access — the same requirement as `DROP TABLE`, since it discards the table's previous contents.

## Notes

- Use fully qualified names: `<workspace>.<collection>.<table_name>`.
- `CREATE TABLE ... AS SELECT` cannot be combined with an explicit column list — the target's columns are always derived from the query.
- Creating a new table requires `writer` or `owner` access to the target.
- To keep a CTAS result up to date automatically as its sources change, use [CREATE MATERIALIZED VIEW](create-materialized-view) — the self-refreshing variant of `CREATE TABLE ... AS SELECT`.
- A materialized view is **not** a table: this statement is rejected against one. Its contents come from its defining `SELECT` — see [REFRESH MATERIALIZED VIEW](refresh-materialized-view#a-materialized-view-is-not-a-table).

## See Also

- [CREATE MATERIALIZED VIEW](create-materialized-view)
- [ALTER TABLE](alter-table)
- [DROP TABLE](drop-table)
- [TRUNCATE TABLE](truncate-table)
- [INSERT](insert)
