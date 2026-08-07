---
title: INSERT Statement — Opteryx Reference
description: SQL INSERT statement syntax and examples for adding data in Opteryx
---

# INSERT

The `INSERT` statement adds new rows to a table.

## Basic Syntax

> Warning: INSERT is experimental and only works against local or limited storage backends. It is not suitable for production use.

~~~sql
INSERT INTO table_name [(column1, column2, ...)]
VALUES (value1, value2, ...);
~~~

The column list is optional. Omitting it inserts into the table's columns in schema
order. When it is given, it must name **every** column in the target table — see
[Partial Inserts](#partial-inserts) below.

## Single Row Insert

~~~sql
INSERT INTO users (id, name, email, active)
VALUES (1, 'John Doe', 'john@example.com', TRUE);
~~~

## Multiple Row Insert

~~~sql
INSERT INTO users (id, name, email, active)
VALUES 
  (1, 'John Doe', 'john@example.com', TRUE),
  (2, 'Jane Smith', 'jane@example.com', TRUE),
  (3, 'Bob Johnson', 'bob@example.com', FALSE);
~~~

## Insert Without a Column List

Values are matched to the table's columns in schema order:

~~~sql
INSERT INTO users
VALUES (1, 'John Doe', 'john@example.com', TRUE);
~~~

## Insert from SELECT

~~~sql
INSERT INTO users_backup (id, name, email)
SELECT id, name, email FROM users WHERE archived = FALSE;
~~~

## Partial Inserts

Inserting into a subset of a table's columns is **not supported**. An explicit column
list must name every column in the target table; a shorter list is rejected when the
query is planned, rather than leaving the unlisted columns to be filled with something
you did not ask for:

~~~
INSERT explicit column list must list all target columns
(target has 4, got 3). Partial column inserts are not yet supported.
~~~

The list may reorder columns relative to the schema — it just cannot omit any.

## Notes

- INSERT is experimental and only works against local or limited storage backends.
- The column list is optional; when present it must be complete (see above).
- Column order in the VALUES clause must match the column list, or the table's schema
  order when no list is given.
- The number of values per row, and each value's type, are checked at plan time against
  the target's schema — a mismatch is rejected before any data is written.
- `INSERT OVERWRITE` is not supported.
