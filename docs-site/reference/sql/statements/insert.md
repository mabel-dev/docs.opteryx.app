---
title: INSERT Statement — Opteryx Reference
description: SQL INSERT statement syntax and examples for adding data in Opteryx
---

# INSERT

The `INSERT` statement adds new rows to a table.

## Basic Syntax

```sql
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);
```

## Single Row Insert

```sql
INSERT INTO users (id, name, email, active)
VALUES (1, 'John Doe', 'john@example.com', TRUE);
```

## Multiple Row Insert

```sql
INSERT INTO users (id, name, email, active)
VALUES 
  (1, 'John Doe', 'john@example.com', TRUE),
  (2, 'Jane Smith', 'jane@example.com', TRUE),
  (3, 'Bob Johnson', 'bob@example.com', FALSE);
```

## Insert from SELECT

```sql
INSERT INTO users_backup (id, name, email)
SELECT id, name, email FROM users WHERE archived = FALSE;
```

## Notes

- Not all data stores support INSERT operations; availability depends on the backend.
- Column order in the VALUES clause must match the column order in the INSERT INTO clause.
- If all columns have values, you can omit the column list: `INSERT INTO users VALUES (...);`
- DEFAULT values (if defined) are used for omitted columns.
