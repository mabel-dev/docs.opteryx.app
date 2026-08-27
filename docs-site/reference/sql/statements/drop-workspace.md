---
title: DROP WORKSPACE Statement — Opteryx Reference
description: SQL DROP WORKSPACE statement syntax for permanently deleting a workspace, everything in it, and its storage in Opteryx
---

# DROP WORKSPACE

The `DROP WORKSPACE` statement permanently deletes a workspace and **everything
in it** — every materialized view, dataset, view, and collection, their storage,
and the access grants issued on the workspace — then the workspace itself.

There is no grace period and no restore. Nothing is left in the catalog or on
disk after it returns.

## Syntax

~~~sql
DROP WORKSPACE [ IF EXISTS ] <workspace>;
~~~

- **`<workspace>`** — a workspace name, never a qualified (dotted) name. This
  statement names a workspace, not anything inside one.
- `IF EXISTS` — skip without error if the workspace does not exist, instead of
  refusing the statement.

~~~sql
DROP WORKSPACE staging;
~~~

## Deletion Protection

Workspaces are created with `deletion_protection` **on**, and `DROP WORKSPACE`
refuses while it is on. Turning it off first is the deliberate signal of
intent:

~~~sql
ALTER WORKSPACE staging SET deletion_protection TO OFF;
DROP WORKSPACE staging;
~~~

See [ALTER WORKSPACE](alter-workspace).

## Who May Drop

Requires the `owner` role on the **whole workspace** — a pattern matching the
workspace itself, such as `staging.*`. Owning part of it (`staging.reports.*`)
is not enough. See
[Security & Permissions](/docs/core-concepts/access-and-permissions).

## What Happens, In Order

Materialized views are dropped first — workspace-wide, before any plain
dataset — so no view in the workspace can still be holding a source dataset
when that dataset's turn comes. Then every dataset and view, then the
now-empty collections, with each dataset's storage reclaimed inline. The
workspace's access grants are removed, and finally the workspace record
itself.

Two things stop it, correctly, partway:

- A **materialized view in another workspace** that reads a dataset here. That
  is a real external dependency this statement cannot override — drop or
  redefine that view first.
- A **locked dataset**. Clear the lock and re-run.

## Externally-Bound Workspaces

A workspace bound to an external catalog is **unlinked**, not destroyed: its
datasets are someone else's, so nothing is dropped, no storage is reclaimed,
and the external catalog is never touched. Only the binding goes.

## Notes

- `DROP WORKSPACE` never cascades *across* workspaces — only its own contents
  are dropped.
- A running session that could see the workspace keeps failing normally on the
  next statement against it; the name is gone from the catalog immediately.

## See Also

- [ALTER WORKSPACE](alter-workspace)
- [DROP COLLECTION](drop-collection)
- [DROP TABLE](drop-table)
