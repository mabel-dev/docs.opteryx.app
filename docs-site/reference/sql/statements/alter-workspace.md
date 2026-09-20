---
title: ALTER WORKSPACE Statement — Opteryx Reference
description: SQL ALTER WORKSPACE statement syntax and examples for setting workspace-level properties such as deletion_protection, egress_protection and maintenance in Opteryx
---

# ALTER WORKSPACE

The `ALTER WORKSPACE` statement sets a property on a workspace itself - the top level of
the naming hierarchy (`workspace.collection.table`), rather than anything inside it.

## Syntax

~~~sql
ALTER WORKSPACE <workspace> SET <property> TO <value>;

ALTER WORKSPACE <source> SET SECURE <object> TO <workspace> [, <workspace> ...];
ALTER WORKSPACE <source> DROP SECURE <object>;
~~~

`<workspace>` names the workspace itself — not a collection or table within it; see
[Notes](#notes) below. The two `SECURE` forms are the narrow exemption from
`egress_protection`, described under [SECURE](#secure-the-sanctioned-exemption).

## Properties

| Property | Values | Default | Purpose |
|----------|--------|---------|---------|
| `deletion_protection` | `ON` / `OFF` (also `TRUE` / `FALSE`) | `ON` | Refuse deletion of the workspace |
| `egress_protection` | `ON` / `OFF` (also `TRUE` / `FALSE`) | `ON` | Refuse automated copies of this workspace's data into another workspace |
| `maintenance` | `ON` / `OFF` (also `TRUE` / `FALSE`) | `ON` | Let the platform keep this workspace's data compacted (Opteryx storage only) |

Only the properties listed above can be set. Any other name is rejected when the query is
planned, so a typo cannot quietly become a new, meaningless property.

Two of the three are **protections, and both default to `ON`**. That is deliberate and
uniform: every workspace property named `..._protection` is safe when on, so you can scan a
workspace's settings for `OFF` without having to reason about which way each one points. A
workspace you have never configured is protected on both counts.

`maintenance` is not a protection and is the odd one out in a second way as well: it is the
only property here that is not stored on the workspace. See
[Maintenance](#maintenance) below.

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

### Stop the Platform Compacting a Workspace
~~~sql
ALTER WORKSPACE landing SET maintenance TO OFF;
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

- [DROP TABLE](drop-table), [DROP VIEW](drop-view), [DROP COLLECTION](drop-collection)
- [TRUNCATE TABLE](truncate-table)
- [ALTER TABLE ... RENAME TO](alter-table#rename-to)
- [INSERT](insert), or `CREATE TABLE ... AS SELECT` with `OR REPLACE`

`deletion_protection` is not a workspace-wide drop freeze, and there is no per-table or
per-collection equivalent — restricting who can drop an individual relation is done with
[access policies](/docs/core-concepts/access-and-permissions), by not granting `owner` on
it, rather than with a flag.

## Egress Protection

`egress_protection` guards **the data in the workspace against being copied out of it**.
While it is on, a statement that would read this workspace's tables and write a durable
copy into a *different* workspace is refused. That covers:

- `CREATE TABLE other.mart.copy AS SELECT ... FROM landing.events`
- `CREATE OR REPLACE TABLE other.mart.copy AS SELECT ... FROM landing.events`
- `INSERT INTO other.mart.copy SELECT ... FROM landing.events`
- `CREATE MATERIALIZED VIEW other.mart.copy AS SELECT ... FROM landing.events`, at creation
  **and** at every refresh

`INSERT` is covered as well as `CREATE`, deliberately: it copies just as durably, and a
boundary that stopped only `CREATE TABLE ... AS SELECT` would be two statements away from
being bypassed.

The refusal happens when the statement is planned, before anything is written, and reports
as an error naming the source workspace and the statement that would clear the flag.

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
[REFRESH MATERIALIZED VIEW](refresh-materialized-view) is a write like any other, so it
meets this check when it is planned, and it meets it again in the catalog before an
automatic refresh is even queued. A [task](create-task) fired by a
[trigger](create-trigger) is checked the same way: in the catalog before the run is
queued, where a refusal is recorded on the trigger as `egress-blocked`, and again when
the run is planned.

## Maintenance

`maintenance` decides whether the platform keeps this workspace's data compacted. While it
is on, Opteryx periodically merges a table's many small files into fewer, larger ones -
which is what keeps scans fast as a table grows by small, frequent writes. You will see the
work as a `Compaction: <strategy>, N files -> 1 file` commit in a dataset's history.

It is on by default, it applies to every table in the workspace, and there is no charge for
it.

**It applies to Opteryx storage only.** Compaction rewrites a table's file layout, and
Opteryx only does that in storage it owns. A workspace whose tables live in an external
catalog — Iceberg, or a database bound as a metastore — is read by Opteryx and never
rewritten by it, so their layout stays that catalog's own business and this setting has
nothing to act on. The statement is still accepted there; it simply turns nothing on. In
the web app it is a setting of **Opteryx storage** specifically, shown inside that card and
absent for a workspace backed by anything else.

~~~sql
ALTER WORKSPACE landing SET maintenance TO OFF;   -- stop compacting this workspace
ALTER WORKSPACE landing SET maintenance TO ON;    -- resume
~~~

### It Is Held at the Workspace

Maintenance is set on the workspace and **inherited by everything in it**. A collection or
a table does not have its own setting to turn off, in the same way a table does not have
its own copy of a grant made at the workspace above it - it shows the inherited value and
points at where that value is managed.

There is no way to exclude one table from an otherwise-maintained workspace. That is the
same rule access policies follow: an inherited grant is not revoked at the table, it is
revoked where it was granted.

### What It Actually Changes

Unlike the two protections, `maintenance` is not a flag stored on the workspace. Compaction
runs as a platform identity, and what the setting turns on and off is that identity's write
access to this workspace - so the setting IS the access, with no second copy of the answer
that could disagree with it.

Two consequences worth knowing:

- Turning maintenance off takes effect on the next compaction the platform would have run.
  Nothing already committed is undone; compaction only ever rewrites file layout, never
  rows.
- `GRANT` and `REVOKE` naming a platform identity are refused. Maintenance is how that
  access is managed, and a second route to the same state is a route to the two disagreeing.

### Reading It Back

`maintenance` is the one workspace property with an `information_schema` table, because
it is the one whose value is not simply what you last set:

~~~sql
SELECT * FROM landing.information_schema.maintenance;
~~~

| catalog_name | maintenance |
|--------------|-------------|
| `landing`    | `true`      |

One row, for the workspace - everything inside inherits it. Readable by anyone who can
reach the workspace, since it says nothing about who holds access to it.

On a workspace backed by an external catalog the value is not meaningful: `true` there says
the platform holds the access, not that anything is being compacted.

## SECURE: The Sanctioned Exemption

Turning `egress_protection` off is all-or-nothing: it unlocks every copy out of the
workspace, for everyone, until somebody turns it back on. Often what actually needs to
be allowed is one known statement — a platform pipeline that moves billing events into
another workspace, say. `SECURE` is the narrow form: it sanctions **one named object**,
copying into **named destination workspaces**, and leaves the lock on for everything
else.

~~~sql
-- Run against the SOURCE workspace: the one whose data leaves.
ALTER WORKSPACE landing SET SECURE platform.ops.billing_events_ingest TO platform;

-- Withdraw it. The object's next copy is refused again.
ALTER WORKSPACE landing DROP SECURE platform.ops.billing_events_ingest;
~~~

- **`<source>`** is the workspace being copied *out of*. The statement relaxes that
  workspace's protection, so it is that workspace's owner who runs it — the same
  requirement as `SET egress_protection TO OFF`, and for the same reason. Nobody else
  can grant the exemption: not the object's author, not the destination's owner.
- **`<object>`** is the task or materialized view doing the copying, **fully qualified**
  as `<workspace>.<collection>.<name>`. It usually lives in a different workspace from
  the source, so a short name is refused rather than guessed.
- **The destinations** are workspace names, not relations. A copy is allowed or refused
  per crossing, so that is the grain the sanction is kept at. The source cannot name
  itself: a copy that stays inside one workspace is never egress.

### What Is Sanctioned, Exactly

Both the object **and** the destination must match. A task's statement can be redefined
with `CREATE OR REPLACE TASK`, so a sanction that followed the object wherever it later
pointed would let a redefinition carry an exemption into a workspace the source never
agreed to. Sanction the destinations you mean.

Only the object named is exempt. The same `INSERT ... SELECT` typed by hand at a prompt
is still refused: a hand-typed statement names no object a source could have sanctioned.
What makes a task's run exempt is that a task ran it — [EXECUTE](execute) carries the
task's identity onto the write it expands to, and so does a trigger firing it.

The sanction is re-read every time the object copies, in the catalog before an
unattended run is queued and again when any run is planned. Dropping it takes effect on
the object's next copy.

### Why the Record Lives on the Source

The sanction is stored on the **source** workspace, not on the object. That placement is
the enforcement, not merely the filing: a flag on the object would be settable by whoever
may edit the object — the party the protection exists to protect against — which would
make egress protection advisory. Where the record lives, only the source's owner can
write it.

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
- There is no `SHOW` form or `information_schema` table that reads the two protections
  back, including the objects a workspace has marked `SECURE`. `maintenance` is the
  exception - see [Reading It Back](#reading-it-back).
- A refused copy names both remedies in its error, the `SECURE` statement for the exact
  object first: sanctioning one door is usually what was wanted, not unlocking the
  building.

## See Also

- [CREATE TASK](create-task), [EXECUTE](execute), [CREATE TRIGGER](create-trigger)
- [SHOW GRANTS](show-grants)
- [ALTER TABLE](alter-table)
- [ALTER VIEW](alter-view)
- [ALTER MATERIALIZED VIEW](alter-materialized-view)
