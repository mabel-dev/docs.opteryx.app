---
title: SHOW FUNCTIONS Statement — Opteryx Reference
description: SQL SHOW FUNCTIONS statement syntax and examples for listing the scalar, aggregate and window functions Opteryx accepts
---

# SHOW FUNCTIONS

The `SHOW FUNCTIONS` statement lists every function name a query can call: scalar functions and their aliases, aggregates, and window functions. Each row also gives the kind of function and a one-line summary.

## Syntax

~~~sql
SHOW FUNCTIONS [ LIKE '<pattern>' | ILIKE '<pattern>' | WHERE <condition> ];
~~~

## Parameters

- **`LIKE '<pattern>'`** — keep only the functions whose name matches the pattern. `%` matches any run of characters and `_` matches exactly one. The match ignores case, as it does for every `SHOW` filter.
- **`ILIKE '<pattern>'`** — the same filter, spelled the other way.
- **`WHERE <condition>`** — keep the rows where the condition holds. It can test any result column, for example `kind`.

## Result Columns

| Column | Description |
|--------|-------------|
| `name` | The name to call the function by |
| `kind` | `scalar`, `aggregate` or `window` |
| `summary` | One line on what the function does |

Rows are sorted by `name`.

## Examples

### List Every Function
~~~sql
SHOW FUNCTIONS;
~~~

### Find Functions by Name
~~~sql
SHOW FUNCTIONS LIKE 'date%';
~~~

| name | kind | summary |
|------|------|---------|
| DATEDIFF | scalar | Difference between two dates in the specified unit. |
| DATETRUNC | scalar | Truncate a date or timestamp to the given unit, written DATETRUNC(unit, value). |
| DATE_DIFF | scalar | Difference between two dates in the specified unit. |
| DATE_TRUNC | scalar | Truncate a date or timestamp to the given unit, written DATE_TRUNC(unit, value). |

### List the Window Functions
~~~sql
SHOW FUNCTIONS WHERE kind = 'window';
~~~

## Notes

- An alias gets its own row, with the same summary as the function it stands for: `UCASE` is listed beside `UPPER`.
- Each name is listed once, under its plain call. `COUNT` appears once, although `COUNT(*)`, `COUNT(expr)` and `COUNT(DISTINCT expr)` are all accepted. Aggregates that also run as window functions (`SUM(x) OVER (...)`) are listed as `aggregate`.
- A pattern with no `LIKE` in front, such as `SHOW FUNCTIONS 'date%'`, is rejected.
- The list includes a few names the query planner handles itself, such as `DATE_TRUNC` and `GROUPING`, and `MATCH`, which is written `MATCH (column) AGAINST (text)`.

## See Also

- [Functions](/docs/reference/sql/functions)
- [Aggregates](/docs/reference/sql/aggregates)
- [Window Functions](window-functions)
- [SHOW VARIABLES](show-variables)
