---
title: Variables — Opteryx Reference
description: User and system variables in Opteryx — how to set them, read them, and give them defaults.
---

# Variables

A session has two kinds of variable:

| Written as | Kind | Who may set it |
|---|---|---|
| `@name` | User variable — yours to define, carries no meaning to the engine | Anyone |
| `@@name` | System variable — describes or changes engine behaviour | Depends on the variable |

Variables belong to the session. A new connection starts from the engine defaults, and nothing set in one session is seen by another.

Use [SHOW VARIABLES](statements/show-variables) to list the variables visible to your session, with each one's value, type, owner and visibility.

## Reading a variable

A variable can be used anywhere a value can:

~~~sql
SELECT @@version;

SELECT * FROM orders WHERE created_at >= @cutoff;
~~~

Reading a user variable that has not been set is an error, not `NULL`, so a misspelt name is caught rather than quietly matching nothing.

## Setting a variable

Use [SET](statements/set):

~~~sql
SET @cutoff = '2026-01-01'::TIMESTAMP;
~~~

The value is worked out once, when the `SET` runs, and the result is what the variable holds. It can be an expression over constants and other variables:

~~~sql
SET @limit = 10 * 1000;
SET @started = NOW();   -- the time the SET ran, not the time it is read
~~~

> Be Aware: A value that cannot be reduced to a single value when the `SET` runs is refused — for example `SET @r = RANDOM()`. Column references are not allowed, as a `SET` has no table to read them from.

### Setting a default

Inside its own `SET`, a user variable that has not been set yet reads as `NULL`. That makes `COALESCE` a "set this only if it is not already set" statement:

~~~sql
SET @ip = COALESCE(@ip, '192.168.4.80'::IPV4);
~~~

If `@ip` already has a value it is kept; otherwise it becomes `192.168.4.80`.

> Note: This applies only to the variable being assigned. Any other unset variable in the value is still an error, so `SET @ip = COALESCE(@other, ...)` fails if `@other` has not been set.

### Counters

A variable can be updated from its own value:

~~~sql
SET @counter = COALESCE(@counter, 0) + 1;
~~~

The `COALESCE` matters the first time. Without it, an unset `@counter` reads as `NULL`, `NULL + 1` is `NULL`, and the counter never starts counting.

## System variables

Most system variables are **not** settable from SQL — they report a limit or setting fixed by the server, or identity stamped onto the session. `SHOW VARIABLES` shows each one's owner; only `USER`-owned variables can be changed, and setting one you are not permitted to change is refused rather than quietly ignored.

A system variable is set by name, with or without the `@@`:

~~~sql
SET @@nprobe = 4;
SET nprobe = 4;

SELECT @@nprobe;
~~~

## See Also

- [SET](statements/set)
- [SHOW VARIABLES](statements/show-variables)
