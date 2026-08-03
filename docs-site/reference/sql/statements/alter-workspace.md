---
title: ALTER WORKSPACE Statement — Opteryx Reference
description: SQL ALTER WORKSPACE statement syntax and examples for setting workspace-level properties such as delete_protection in Opteryx
---

# ALTER WORKSPACE

The `ALTER WORKSPACE` statement sets a property on a workspace itself - the top level of
the naming hierarchy (`workspace.collection.table`), rather than anything inside it.

## Basic Syntax

~~~sql
ALTER WORKSPACE [workspace] SET [property] TO [value];
~~~

## Properties

| Property | Values | Purpose |
|----------|--------|---------|
| `delete_protection` | `ON` / `OFF` (also `TRUE` / `FALSE`) | Refuse deletion of the workspace while set |

Only the properties listed above can be set. Any other name is rejected when the query is
planned, so a typo cannot quietly become a new, meaningless property.

## Examples

### Turn Delete Protection On
~~~sql
ALTER WORKSPACE production SET delete_protection TO ON;
~~~

### Turn Delete Protection Off
~~~sql
ALTER WORKSPACE production SET delete_protection TO OFF;
~~~

`TRUE` and `FALSE` are accepted as synonyms for `ON` and `OFF`.

## Delete Protection

`delete_protection` guards **the workspace itself**. While it is on, the workspace cannot
be deleted; the attempt is refused with an error naming the statement that clears the flag.

It is a guard against losing a whole workspace - every collection, table and view in it -
in a single action.

Workspaces are created and deleted through the platform, not through SQL: there is no
`CREATE WORKSPACE` or `DROP WORKSPACE` statement. `ALTER WORKSPACE` sets the flag; the
deletion it guards happens elsewhere. To delete a protected workspace, clear the flag
first:

~~~sql
ALTER WORKSPACE production SET delete_protection TO OFF;
~~~

### What It Does Not Block

Delete protection has no effect on anything *inside* the workspace. All of these work
normally in a protected workspace:

- [DROP TABLE](drop-table.md), [DROP VIEW](drop-view.md), [DROP COLLECTION](drop-collection.md)
- [TRUNCATE TABLE](truncate-table.md)
- [ALTER TABLE ... RENAME TO](alter-table.md#rename-to)
- [INSERT](insert.md), or `CREATE TABLE ... AS SELECT` with `OR REPLACE`

`delete_protection` is not a workspace-wide drop freeze, and there is no per-table or
per-collection equivalent — restricting who can drop an individual relation is done with
[access policies](/docs/core-concepts/access-and-permissions), by not granting `owner` on
it, rather than with a flag.

## Notes

- Requires the `owner` role on the workspace **itself**. This is deliberately not implied
  by owning things inside it: a grant like `production.*` covers everything *in* the
  workspace but does not match the workspace's own name. You need a pattern that matches
  `production` directly, such as an exact grant on `production` or a global `*`. See
  [Security & Permissions](/docs/core-concepts/access-and-permissions).
- The setting is stored on the workspace and applies to every session, not just the one
  that set it.
- Protection is re-read each time a workspace deletion is attempted, so turning it on takes
  effect immediately for sessions that are already connected.
- Requires a connector with a catalog to store workspace properties in - not every backend
  supports this.
- `ALTER WORKSPACE` names a workspace, not a table within one. A qualified name such as
  `workspace.collection` is rejected.
