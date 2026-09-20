# Federator

`federator` is a platform-managed system identity, not a person. It exists so that automated, long-running platform operations aren't tied to any individual's account.

You do not normally need to know it exists. This page is here for when you meet the name - in a dataset's history, or in an error - and want to know what it is.

## What it does

**It keeps your tables compacted.** Background compaction periodically merges a table's many small files into fewer, larger ones, which is what keeps scans fast as a table grows by small, frequent writes. You'll see the work as a `Compaction: <strategy>, N files → 1 file` commit on a dataset's history, and the commit is attributed to the platform rather than to a person, because no person ran it.

Compaction rewrites a table's storage, so it needs write access to what it is compacting.

## You manage it as a setting, not as a grant

Compaction is turned on and off per workspace, with [`ALTER WORKSPACE`](/docs/reference/sql/statements/alter-workspace#maintenance):

```sql
ALTER WORKSPACE analytics SET maintenance TO OFF;   -- stop compacting this workspace
ALTER WORKSPACE analytics SET maintenance TO ON;    -- resume
```

It is on by default and covers every table in the workspace.

It applies to **Opteryx storage only**, and the web app treats it as what it is: a setting of Opteryx storage, shown with the rest of that workspace's storage settings. If a workspace's tables live in an external catalog, Opteryx reads them but never rewrites them, so there is nothing to compact and no setting to offer. In the web app it is a switch on the workspace's settings, and a collection or table shows the inherited value without its own control - maintenance is held at the workspace, exactly as a grant made there is.

Underneath, the setting is that write access: turning maintenance on grants it and turning maintenance off revokes it. That is why there is nothing else to configure and nothing to keep in step - the setting and the access are one thing. It is also why `GRANT` and `REVOKE` naming a platform identity are refused: maintenance is how that access is managed, and a second route to the same state is a route to the two disagreeing.

> **This changed.** Compaction used to be enabled by adding `federator` to a workspace's access list at `writer`, and turned off by revoking it. That worked, but it asked an administrator to know what `federator` was before they could keep their own tables fast. Existing workspaces were not affected by the change: the access they already had became the setting they already had.

## Reading it back

```sql
SELECT * FROM analytics.information_schema.maintenance;
```

One row, for the workspace. Everything inside inherits it.

## Recognizing it

In the web app, platform identities are shown as the platform rather than as accounts - a commit from compaction reads as Opteryx's own work, with a robot icon, and not as a colleague you don't recognise. They do not appear in a workspace's access list, because there is nothing there for you to act on.

## What it does not do

`federator` is not an account you can be given, log in as, or grant things to. It cannot own a materialized view: a view's refresh runs unattended and forever, so its owner has to be a principal who can be billed, and a platform identity is not one. `ALTER MATERIALIZED VIEW ... OWNER TO` names a real account - see [Tasks and Triggers](/docs/guides/tasks-and-triggers).
