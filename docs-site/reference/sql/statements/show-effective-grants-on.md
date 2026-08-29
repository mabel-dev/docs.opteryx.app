---
title: SHOW EFFECTIVE GRANTS ON Statement — Opteryx Reference
description: SQL SHOW EFFECTIVE GRANTS ON statement syntax for listing every grant that reaches a workspace, collection or dataset in Opteryx, including those held further up
---

# SHOW EFFECTIVE GRANTS ON

The `SHOW EFFECTIVE GRANTS ON` statement lists every grant that **reaches** a
workspace, collection or dataset — including the ones held further up that cover
it without naming it.

This is the other question about an object. [SHOW GRANTS ON](show-grants-on)
answers what is stored *at* it, one-to-one with what [GRANT](grant) and
[REVOKE](revoke) there act on. That listing is empty for a dataset whose only
reachable-by grant is a workspace owner's — and reading that emptiness as
"nobody can get to this" is the mistake this statement exists to prevent.

## Syntax

~~~sql
SHOW EFFECTIVE GRANTS ON WORKSPACE workspace_name;
SHOW EFFECTIVE GRANTS ON COLLECTION collection_name;
SHOW EFFECTIVE GRANTS ON DATASET dataset_name;
~~~

## Result Columns

| Column | Description |
|--------|-------------|
| `user` | The user the grant was issued to |
| `pattern` | The pattern of the grant that reaches the object, e.g. `production.*` |
| `level` | The object level that pattern addresses — `workspace`, `collection` or `dataset` |
| `role` | `reader`, `writer` or `owner` |

The same four columns as `SHOW GRANTS ON`, in the same order. `pattern` and
`level` are what make a row explain itself: against a dataset, a row reading
`(morgan, production.*, workspace, owner)` says *why* Morgan reaches it without
needing a fifth column.

## Example

Consider a dataset with no grants of its own, inside a collection one person can
write, inside a workspace one person owns.

~~~sql
SHOW GRANTS ON DATASET production.sales.orders;
~~~

~~~
 user | pattern | level | role
------+---------+-------+------
(no rows)
~~~

~~~sql
SHOW EFFECTIVE GRANTS ON DATASET production.sales.orders;
~~~

~~~
 user   | pattern            | level      | role
--------+--------------------+------------+--------
 jai    | production.sales.* | collection | writer
 morgan | production.*       | workspace  | owner
~~~

Nothing changed between the two queries. The first lists what is attached to the
dataset; the second lists what can reach it.

## One Row Per Covering Grant

Not one row per user, and no highest-role-wins collapse. A user may reach an
object through more than one grant, and **which grant confers the access is
exactly what has to change to take it away** — so all of them are listed. A
caller that wants a single effective role per user collapses the rows itself.

## Naming a Workspace

`SHOW EFFECTIVE GRANTS ON WORKSPACE` returns what
[SHOW GRANTS ON](show-grants-on) `WORKSPACE` returns. A workspace listing is
already every grant at every level, so nothing covers it that is not in it. The
two statements differ only for a `COLLECTION` or a `DATASET`.

## Who May Look

The caller must hold `OWNER` covering the object — the same gate as
`SHOW GRANTS ON`, and deliberately not relaxed because this statement reports
more. It names every principal who can reach the object, which is more of the
thing the owner gate protects, not less.

## Notes

- Coverage is decided by the permissions service using **the same matcher that
  decides real queries**, never a second implementation of it. The listing
  cannot report access the engine would not actually grant.
- Available where the deployment provides a policy service; embedded and
  command-line sessions refuse the statement.
- The object kind asserts the name's shape — a `WORKSPACE` is one part, a
  `COLLECTION` two, a `DATASET` three.

## See Also

- [SHOW GRANTS ON](show-grants-on) — what is stored *at* an object
- [SHOW GRANTS](show-grants) — the current session's own grants
- [GRANT](grant)
- [REVOKE](revoke)
