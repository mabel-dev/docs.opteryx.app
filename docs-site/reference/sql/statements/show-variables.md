---
title: SHOW VARIABLES Statement — Opteryx Reference
description: SQL SHOW VARIABLES statement syntax and examples for listing session and system variables in Opteryx
---

# SHOW VARIABLES

The `SHOW VARIABLES` statement lists the session and system variables visible to the current connection.

## Basic Syntax

~~~sql
SHOW VARIABLES;
~~~

## Result Columns

| Column | Description |
|--------|-------------|
| `name` | Variable name |
| `value` | Current value, as text |
| `type` | Variable's data type |
| `owner` | `INTERNAL` (engine-managed) or `USER` (set with `SET`) |
| `visibility` | `UNRESTRICTED`, or `RESTRICTED` (shown only to platform administrators) |

## Notes

- `SHOW VARIABLES LIKE '<pattern>'` is not supported — only the bare form.
- Some variables are visible only to platform administrators; other callers see a shorter list.
