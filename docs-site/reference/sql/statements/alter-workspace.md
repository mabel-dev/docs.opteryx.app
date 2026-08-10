---
title: ALTER WORKSPACE Statement — Opteryx Reference
description: SQL ALTER WORKSPACE statement syntax and examples for setting workspace-level protections such as deletion_protection and egress_protection in Opteryx
---

# ALTER WORKSPACE

The `ALTER WORKSPACE` statement sets a property on a workspace itself - the top level of
the naming hierarchy (`workspace.collection.table`), rather than anything inside it.

## Basic Syntax

~~~sql
ALTER WORKSPACE [workspace] SET [property] TO [value];
~~~

## Properties

| Property | Values | Default | Purpose |
|----------|--------|---------|---------|
| `deletion_protection` | `ON` / `OFF` (also `TRUE` / `FALSE`) | `ON` | Refuse deletion of the workspace |
| `egress_protection` | `ON` / `OFF` (also `TRUE` / `FALSE`) | `ON` | Refuse automated copies of this workspace's data into another workspace |

Only the properties listed above can be set. Any other name is rejected when the query is
planned, so a typo cannot quietly become a new, meaningless property.

Both properties are **protections, and both default to `ON`**. That is deliberate and
uniform: every workspace property named `..._protection` is safe when on, so you can scan a
workspace's settings for `OFF` without having to reason about which way each one points. A
workspace you have never configured is protected on both counts.

`TRUE` and `FALSE` are accepted as synonyms for `ON` and `OFF`.

## Examples

### Allow the Workspace To Be Deleted
~~~sql
ALTER WORKSPACE production SET deletion_protection TO OFF;
~~~

### Protect It Again
~~~sql
ALTER WORKSPACE production SET deletion_protection TO ON;
~~~

### Allow Data To Be Copied Out
~~~sql
ALTER WORKSPACE landing SET egress_protection TO OFF;
~~~

## Deletion Protection

`deletion_protection` guards **the workspace itself**. While it is on, the workspace cannot
be deleted; the attempt is refused with an error naming the statement that clears the flag.

It is a guard against losing a whole workspace - every collection, table and view in it -
in a single action. It is on from the moment a workspace exists, so deleting one is always
a deliberate two-step.

Workspaces are created and deleted through the platform, not through SQL: there is no
`CREATE WORKSPACE` or `DROP WORKSPACE` statement. `ALTER WORKSPACE` sets the flag; the
deletion it guards happens elsewhere. To delete a workspace, clear the flag first:

~~~sql
ALTER WORKSPACE production SET deletion_protection TO OFF;
~~~

### What It Does Not Block

Deletion protection has no effect on anything *inside* the workspace. All of these work
normally in a protected workspace:

- [DROP TABLE](drop-table.md), [DROP VIEW](drop-view.md), [DROP COLLECTION](drop-collection.md)
- [TRUNCATE TABLE](truncate-table.md)
- [ALTER TABLE ... RENAME TO](alter-table.md#rename-to)
- [INSERT](insert.md), or `CREATE TABLE ... AS SELECT` with `OR REPLACE`

`deletion_protection` is not a workspace-wide drop freeze, and there is no per-table or
per-collection equivalent — restricting who can drop an individual relation is done with
[access policies](/docs/core-concepts/access-and-permissions), by not granting `owner` on
it, rather than with a flag.

## Egress Protection

`egress_protection` guards **the data in the workspace against being copied out of it**.
While it is on, a statement that would read this workspace's tables and write a durable
copy into a *different* workspace is refused. That is intended to cover:

- `CREATE TABLE other.mart.copy AS SELECT ... FROM landing.events`
- `CREATE MATERIALIZED VIEW other.mart.copy AS SELECT ... FROM landing.events`, at creation
  **and** at every refresh

> **Not yet enforced.** The property can be set and stored today, and the catalog refuses
> the copies described here, but **no SQL statement currently consults it**: the engine does
> not call the check on the `CREATE TABLE ... AS SELECT` path, and a materialized view
> cannot name a source in another workspace at all yet. Setting `egress_protection` today
> therefore prevents nothing. It is documented here because the default is already `ON`, so
> the setting is live and visible — but do not rely on it as a control until this note is
> removed.

The **source** workspace's setting decides, never the destination's — the property protects
data *leaving*. A copy that stays inside the source workspace is not egress and is never
affected, so ordinary same-workspace tables, views and materialized views are untouched by
this setting whatever it is set to.

### Why It Exists

Granting someone `reader` on `landing.*` is understood as "may look at this data". Without
this protection it silently also means "may copy all of landing anywhere they can write,
permanently, on a refresh schedule" — a much larger grant than anyone intends. A
materialized view built that way keeps refreshing long after the person who created it has
moved on, and it lives somewhere this workspace's owners do not govern.

Egress protection separates those two things. Reading stays a permission; copying out
becomes a decision the source workspace's owners make explicitly.

### What It Does Not Do

**It is not containment, and must not be relied on as containment.** Anyone who can read
the data can still `SELECT` it, export it, download it, and paste the rows wherever they
like. Nothing here prevents that, and nothing can — it is an egress boundary, in the way a
network perimeter is, not a permission.

What it stops is the *systematic, automated, recurring* copy: the standing table or
materialized view that keeps a full mirror of someone else's data fresh forever off the back
of a single read grant. That is where the volume is, and it is the part a read grant is
never understood to include.

A refresh of an existing materialized view that is blocked by this setting fails visibly —
the view stops updating and records why — rather than silently continuing to copy.

## Notes

- Requires the `owner` role on the workspace **itself**. This is deliberately not implied
  by owning things inside it: a grant like `production.*` covers everything *in* the
  workspace but does not match the workspace's own name. You need a pattern that matches
  `production` directly, such as an exact grant on `production` or a global `*`. See
  [Security & Permissions](/docs/core-concepts/access-and-permissions).
- The setting is stored on the workspace and applies to every session, not just the one
  that set it.
- Both protections are re-read each time the action they guard is attempted, so turning one
  on takes effect immediately for sessions that are already connected — including for
  materialized views that were created while it was off.
- Requires a connector with a catalog to store workspace properties in - not every backend
  supports this.
- `ALTER WORKSPACE` names a workspace, not a table within one. A qualified name such as
  `workspace.collection` is rejected.
- There is no `SHOW` form or `information_schema` table that reads these settings back.
