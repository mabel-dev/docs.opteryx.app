---
title: SHOW GRANTS ON Statement — Opteryx Reference
description: SQL SHOW GRANTS ON statement syntax for listing the grants held on a workspace, collection or dataset in Opteryx
---

# SHOW GRANTS ON

The `SHOW GRANTS ON` statement lists who holds what on a workspace, collection,
or dataset — one row per stored grant. It is the access-list view as SQL.

For the current session's *own* grants, use bare [SHOW GRANTS](show-grants).

## Syntax

~~~sql
SHOW GRANTS ON WORKSPACE workspace_name;
SHOW GRANTS ON COLLECTION collection_name;
SHOW GRANTS ON DATASET dataset_name;
~~~

## Result Columns

| Column | Description |
|--------|-------------|
| `user` | The user the grant was issued to |
| `pattern` | The name pattern the grant covers, e.g. `production.sales.*` |
| `level` | The object level the pattern addresses — `workspace`, `collection` or `dataset` |
| `role` | `reader`, `writer` or `owner` |

Rows are ordered by user, then pattern.

## Example

~~~sql
SHOW GRANTS ON WORKSPACE production;
~~~

~~~
 user   | pattern                  | level      | role
--------+--------------------------+------------+--------
 dara   | production.sales.orders  | dataset    | reader
 jai    | production.sales.*       | collection | writer
 morgan | production.*             | workspace  | owner
~~~

## What Each Form Lists

`SHOW GRANTS ON WORKSPACE` lists **every** grant in the workspace, whatever
level each is scoped to — the full access list. Naming a `COLLECTION` or
`DATASET` lists only the grants at exactly that object, one-to-one with what
[GRANT](grant) and [REVOKE](revoke) there act on; a broader grant that merely
covers the object appears in the workspace listing, not the object's.

## Who May Look

The caller must hold `OWNER` covering the object — the same authority a `GRANT`
or `REVOKE` there needs, deliberately: who may see the grants on an object is
who may change them. A reader cannot enumerate who else holds what.

## Notes

- Available where the deployment provides a policy service; embedded and
  command-line sessions refuse the statement.
- The object kind asserts the name's shape — a `WORKSPACE` is one part, a
  `COLLECTION` two, a `DATASET` three.

## See Also

- [GRANT](grant)
- [REVOKE](revoke)
- [SHOW GRANTS](show-grants)
