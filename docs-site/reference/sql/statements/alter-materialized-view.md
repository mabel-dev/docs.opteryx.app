---
title: ALTER MATERIALIZED VIEW Statement — Opteryx Reference
description: SQL ALTER MATERIALIZED VIEW statement syntax and examples for transferring ownership and suspending automatic refresh of a materialized view in Opteryx
---

# ALTER MATERIALIZED VIEW

Changes a materialized view's **refresh owner**, or **suspends and resumes** its automatic
refresh.

## Syntax

~~~sql
ALTER MATERIALIZED VIEW <view> OWNER TO { <principal> | CURRENT_USER };
ALTER MATERIALIZED VIEW <view> { SUSPEND | RESUME };
~~~

`<view>` is fully qualified as `<workspace>.<collection>.<view_name>`.

These are the only properties of a view you can alter. Everything else about it — its
columns, its contents, the tables it reads — follows from its defining `SELECT`, and changes
by redefining that with `CREATE OR REPLACE MATERIALIZED VIEW`.

## OWNER TO

A materialized view refreshes as a **pinned identity**, recorded when the view is created and
shown as `runs_as`. Every automatic refresh runs with that principal's permissions and is
billed to them — not to whoever's write happened to trigger it.

~~~sql
ALTER MATERIALIZED VIEW analytics.daily_orders OWNER TO 'etl@example.com';
ALTER MATERIALIZED VIEW analytics.daily_orders OWNER TO CURRENT_USER;
~~~

This statement is the **only** thing that moves that identity. In particular, redefining a
view with `CREATE OR REPLACE MATERIALIZED VIEW` does not: fixing a colleague's view does not
make you responsible for keeping it fresh, and does not hand your permissions to whoever
edits it next.

`CURRENT_USER` resolves to the identity running the statement — the way to take ownership of
a view yourself. Quoting it (`'CURRENT_USER'`) instead names a principal literally called
`CURRENT_USER`, following the usual SQL distinction.

### Parameters

- **`<principal>`** — the identity to make the view's refresh owner. Every automatic refresh
  runs, and is billed, as this principal from then on.
- `CURRENT_USER` — the identity running the statement; the way to take ownership yourself.

### Why This Needs Workspace Owner

`OWNER TO <principal>` requires the `owner` role on the **workspace**, deliberately stricter
than owning the view itself.

When a view is created, its owner is necessarily an identity that held every permission the
definition needed — because it was the identity that ran it. This statement is the one thing
that can break that: it can point a view's refresh at a principal with *broader* permissions
than the caller's own, and nothing can inspect another principal's grants to prevent it. A
workspace owner can already grant themselves anything in the workspace, so requiring that
tier escalates nothing that was not already available.

`OWNER TO CURRENT_USER` is the safe case — it can only ever point a view at the person
running it, so no permission can be borrowed.

### If The Owner Loses Access

Refreshes stop, **visibly**: the job fails and `last_refresh_status` records the denial. That
is intended. The alternative — quietly falling back to whoever's commit fired the refresh —
would make a view's behaviour depend on which principal happened to write last, and could run
it with permissions it was never granted.

For views that must outlive an individual, set the owner to a service principal.

## SUSPEND and RESUME

Stops and restarts automatic refresh.

~~~sql
ALTER MATERIALIZED VIEW analytics.daily_orders SUSPEND;
ALTER MATERIALIZED VIEW analytics.daily_orders RESUME;
~~~

A suspended view stays **queryable** and keeps its current contents; writes to its sources
simply stop queuing refreshes. Suspension is recorded — who suspended it and when — and
survives commits to the view, so it stays suspended until someone resumes it.

Suspending is expressed on the **view**, never on the triggers underneath it. A view reading
four tables has four triggers, and disabling three of them would not stop it refreshing — it
would refresh from a subset of its sources and produce quietly incomplete results.

Useful for:

- holding a view still during maintenance on its sources
- stopping a view that refreshes more often, or more expensively, than it needs to
- parking a view that is failing, while the cause is investigated, without losing its
  definition or its refresh history

`SUSPEND` requires the `writer` role on the view — not the workspace-owner tier `OWNER TO`
needs. Suspending borrows nobody's permissions: anyone who may replace a view's contents may
certainly stop them being replaced automatically.

### Suspend, Don't Drop The Trigger

Dropping a view's refresh trigger also stops it refreshing, and used to be the only way. It
is a worse tool. A missing trigger is indistinguishable from one that was never created or
that something broke, so "deliberately switched off" and "quietly broken" look identical
afterwards. A suspended view says which it is, since when, and by whom — and resumes with one
statement rather than a reconstruction.

## Examples

~~~sql
-- Hand a view to the service principal that should keep it fresh
ALTER MATERIALIZED VIEW analytics.daily_orders OWNER TO 'svc-etl';

-- Take ownership of a view whose owner has left
ALTER MATERIALIZED VIEW analytics.daily_orders OWNER TO CURRENT_USER;

-- Hold a view still while its source table is rebuilt
ALTER MATERIALIZED VIEW analytics.daily_orders SUSPEND;
-- ... maintenance ...
ALTER MATERIALIZED VIEW analytics.daily_orders RESUME;
REFRESH MATERIALIZED VIEW analytics.daily_orders;
~~~

Resuming does not itself trigger a refresh — the view stays as it was until its next source
write, so follow with [REFRESH MATERIALIZED VIEW](refresh-materialized-view.md) if you need it
current immediately.

## Notes

- Refused if the named relation is not a materialized view.
- `ALTER TABLE` and `ALTER WORKSPACE` are unaffected; only statements naming
  `ALTER MATERIALIZED VIEW` are handled here.
- `OWNER TO CURRENT_USER` requires an authenticated session — there is otherwise no identity
  to assign the view to.
- Requires a connector with a catalog. Not every backend supports materialized views.

## See Also

- [CREATE MATERIALIZED VIEW](create-materialized-view.md)
- [REFRESH MATERIALIZED VIEW](refresh-materialized-view.md)
- [DROP MATERIALIZED VIEW](drop-materialized-view.md)
