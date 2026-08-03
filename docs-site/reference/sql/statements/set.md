---
title: SET Statement — Opteryx Reference
description: SQL SET statement syntax and examples for assigning session variables in Opteryx
---

# SET

The `SET` statement assigns a value to a variable for the current session. Variables set
this way live for the life of the connection and are visible to
[SHOW VARIABLES](show-variables.md).

## Basic Syntax

~~~sql
SET @variable_name = value;
SET @@system_variable = value;
~~~

## Variable Kinds

| Prefix | Kind | Who may set it |
|--------|------|----------------|
| `@name` | User variable — yours to define, carries no meaning to the engine | Anyone |
| `@@name` | System variable — changes engine behaviour | Depends on the variable |

A bare name with no prefix is treated as a system variable, and setting one you are not
permitted to change is refused:

~~~
User does not have permission to set variable `sql_select_limit`
~~~

## Examples

### Set a User Variable
~~~sql
SET @cutoff = '2026-01-01';

SELECT * FROM orders WHERE created_at >= @cutoff;
~~~

### Set a System Variable
~~~sql
SET @@sql_select_limit = 1000;
~~~

## Notes

- Variables are per-session. A new connection starts from the engine defaults, and nothing
  set this way persists beyond the session.
- Use [SHOW VARIABLES](show-variables.md) to list the variables visible to the session,
  along with each one's value, type, owner (`INTERNAL` or `USER`) and visibility.
- Some system variables are restricted to platform administrators; setting one you do not
  hold permission for is refused rather than quietly ignored.
