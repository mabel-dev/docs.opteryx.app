---
title: SHOW GRANTS Statement — Opteryx Reference
description: SQL SHOW GRANTS statement syntax and examples for inspecting the access policies held by the current session in Opteryx
---

# SHOW GRANTS

The `SHOW GRANTS` statement lists the access policies held by the current connection —
the same patterns and roles the engine matches against when it decides whether a statement
is allowed. Use it to answer "why can't I see this table?" without leaving SQL.

## Syntax

~~~sql
SHOW GRANTS;
~~~

It takes no options — there is nothing to specify beyond the statement itself.

## Result Columns

| Column | Description |
|--------|-------------|
| `pattern` | The name pattern the grant applies to, e.g. `production.*` |
| `role` | `reader`, `writer` or `owner` |
| `actions` | The actions that role permits, derived from the role |

## Examples

~~~sql
SHOW GRANTS;
~~~

~~~
 pattern      | role   | actions
--------------+--------+--------------------------------------------------
 production.* | owner  | ALTER, CREATE, DELETE, DROP, MANIFEST, READ, UPDATE, WRITE
 public.*     | reader | READ
~~~

## Reading the Result

A statement is permitted if **any** row's `pattern` matches the object being addressed and
that row's `role` permits the action. Patterns are glob-style, so `production.*` matches
everything inside the `production` workspace — but **not** the workspace name itself, and
not a collection's own name. That is why owning everything *in* a workspace does not let
you [DROP COLLECTION](drop-collection.md) or [ALTER WORKSPACE](alter-workspace.md); those
need a pattern matching the collection or workspace directly.

The roles are cumulative in what they permit:

| Role | Can |
|------|-----|
| `reader` | Read data |
| `writer` | Read, and change what is *in* a relation (`INSERT`, `TRUNCATE`, `CREATE`) |
| `owner` | All of the above, plus change or remove the relation itself (`DROP`, `ALTER`, `SHOW MANIFEST FOR`) |

## This Statement Grants Nothing

`SHOW GRANTS` reports; it does not confer. **Opteryx has no `GRANT` or `REVOKE`
statement.** Access policies are issued by the platform's policy service and handed to the
session when it connects, so the engine can only ever narrow what you may do, never widen
it. To change a policy, use the platform's access-control API rather than SQL.

Policies are resolved once, when the session connects. A policy changed elsewhere is
picked up by the next connection, not by a session already running.

## Notes

- Reports the **current session** only. There is no `SHOW GRANTS FOR <user>`; asking for
  one is rejected rather than quietly answered for yourself.
- A session holding no policies returns no rows. No rows means no grants — it is never a
  blank row standing for unrestricted access.
- The `actions` column is derived from the role, so it always agrees with what is actually
  enforced.
- See [Security & Permissions](/docs/core-concepts/access-and-permissions) for how
  policies are assigned.

## See Also

- [ALTER WORKSPACE](alter-workspace.md)
- [DROP COLLECTION](drop-collection.md)
- [SHOW VARIABLES](show-variables.md)
