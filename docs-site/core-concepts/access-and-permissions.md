---
title: Security & Permissions — Opteryx Reference
description: How Opteryx decides what a session may read, write, or change — access policies, roles, special-cased namespaces, and row-level filtering.
---

# Security & Permissions

Opteryx has no login step and no credential store of its own. A session's identity and
grants are asserted by whatever embeds Opteryx — typically a service that has already
authenticated the caller — and handed to the engine at connection time. From there, the
engine's job is narrow and mechanical: given the grants it was handed, decide whether a
statement is allowed, and refuse the ones that aren't.

**Opteryx never widens what a session can do.** There is no `GRANT` or `REVOKE`
statement. Access policies are issued elsewhere — by the platform's access-control
service — and are read-only from SQL's point of view; see
[SHOW GRANTS](/docs/reference/sql/statements/show-grants) to inspect them.

## Session Identity

A session carries:

| Field | Purpose |
|-------|---------|
| `user` | The caller's identity, used for attribution (who created a table, who dropped a collection) and for the `personal.<user>.*` namespace below |
| `memberships` | Group names the caller belongs to. **Informational only** — surfaced via [SHOW USER](/docs/reference/sql/statements/show-user), never consulted by a permission check |
| `entitlements` | Platform capabilities the caller holds, e.g. `platform_admin`. Gates a small set of server-side tuning variables — see [Engine Configuration](adv-engine-configuration) |
| `access_policies` | The pattern/role grants that decide what the caller may read or change — this page's real subject |
| `billing_account` | Who pays for the session. Distinct from `user`: many users can bill to one account |

`SHOW USER` reports identity; `SHOW GRANTS` reports policies. Neither can be set from SQL.

## Access Policies

A policy is a `{pattern, role}` pair: `pattern` is a glob matched against a fully
qualified name (`workspace.collection.table`), `role` is one of `reader`, `writer`,
`owner`. A session can hold several policies; a statement is allowed if **any** policy's
pattern matches the target and that policy's role permits the action.

```sql
SHOW GRANTS;
```
```
 pattern      | role   | actions
--------------+--------+------------------------------------------------------------
 production.* | owner  | ALTER, CREATE, DELETE, DROP, MANIFEST, READ, UPDATE, WRITE
 public.*     | reader | READ
```

### Roles Are Cumulative

| Role | Permits |
|------|---------|
| `reader` | Read data (`SELECT`) |
| `writer` | Everything `reader` can, plus change what's *in* a relation (`INSERT`, `TRUNCATE`, `CREATE TABLE`) |
| `owner` | Everything `writer` can, plus change or remove the relation itself (`DROP`, `ALTER TABLE`, `SHOW MANIFEST FOR`) |

The `owner` tier exists because some actions have a different blast radius than an
ordinary write: dropping a table destroys its history, and `ALTER TABLE ... CLUSTER BY`
changes what the table fundamentally is, not just its contents. A `writer` grant does not
imply either.

### Patterns Match Names, Not Path Depth

Matching is a plain glob (`fnmatch`) against the fully qualified name — `*` is not
dot-aware, so it swallows dots along with everything else. This has a sharp consequence:
a workspace-wide pattern matches the *names of things inside the workspace*, including a
collection's own two-part name, but never the bare workspace name itself, which has no
dot for `*` to stand in for:

| Pattern | Matches `production` | Matches `production.staging` | Matches `production.staging.t` |
|---|---|---|---|
| `production.staging.*` | no | no | **yes** |
| `production.*`         | no | **yes** | **yes** |
| `production`           | **yes** | no | no |

So `production.*` (owner) is enough to `DROP COLLECTION production.staging` — the
collection name matches it directly — but is **not** enough to
`ALTER WORKSPACE production`, which needs a pattern matching the bare workspace name
(`production` itself, or a global `*`).

The opposite gap is `production.staging.*`: owning everything created *inside* the
collection does not reach the collection's own name, so it cannot drop the collection —
only a pattern that matches `production.staging` itself (`production.staging`,
`production.*`, or `*`) can.

```sql
-- owner of `production.staging.*` (everything IN the collection) —
DROP COLLECTION production.staging;   -- refused: does not match the collection's own name

-- owner of `production.*` (the whole workspace) —
DROP COLLECTION production.staging;   -- allowed: `production.*` matches `production.staging`
ALTER WORKSPACE production SET delete_protection TO OFF;   -- refused: does not match `production`
```

See [ALTER WORKSPACE](/docs/reference/sql/statements/alter-workspace) and
[DROP COLLECTION](/docs/reference/sql/statements/drop-collection) for the specific tiers
each statement requires.

## Special-Cased Namespaces

Three name shapes are decided before any policy is consulted, and no policy can change
their outcome:

| Name shape | Access |
|------------|--------|
| No dot in the name (a local/ad-hoc dataset) | `READ` only, always |
| `public.*` | `READ` only, always |
| `personal.<user>.*`, where `<user>` is the session's own user | Every action, always |

`personal.<user>.*` is scoped to the session's **own** identity — it never grants access
to another user's personal namespace, regardless of any policy held.

## The Default Session Is an Owner of Everything

A session constructed with no `access_policies` at all is not a session with no
access — it defaults to `[{"pattern": "*", "role": "owner"}]`: unrestricted owner access
to everything. This is a convenience for local and single-tenant use, not a safe default
for an embedding that serves untrusted callers. Any embedding that enforces real
boundaries between callers must supply explicit, narrower policies for every session it
creates.

## Row-Level Filtering

Access policies decide whether a relation is reachable at all. A separate mechanism
narrows *which rows* of an otherwise-reachable relation are visible, applied per query
call rather than per session: a `visibility_filters` mapping from relation name to a
filter, expressed as the engine's internal DNF predicate form.

```python
session.execute_to_morsels(
    "SELECT name FROM $planets",
    visibility_filters={"$planets": [[("id", "Gt", 5)]]},
)
```

An empty filter list for a relation hides it entirely — the query succeeds and returns
zero rows, rather than an error. This is a caller-side mechanism (the embedding computes
the filter per request, typically from row-level rules held elsewhere); it is not
expressible in SQL and has no relationship to `access_policies`.

## What This Page Does Not Cover

Opteryx is a query engine, not a platform. It has no SQL surface for encryption,
transport security, secrets management, or compliance controls — those are properties of
how and where you deploy it (object storage encryption, TLS termination, a secrets
manager), not something the engine configures. Every write DDL/DML statement attributes
its change to the session's `user` (visible as the connector's `author` parameter), which
feeds whatever audit trail the catalog service you connect to keeps — but that trail is
the catalog's, not the engine's, and its shape is not documented here.

## Notes

- Policies are resolved once, when the session is constructed. A policy changed
  elsewhere is picked up by the *next* session, not by one already running.
- `ACTION_MAP` — the table mapping each SQL action to the roles that permit it — is fixed
  by the engine, not configurable per deployment.
- See [SHOW GRANTS](/docs/reference/sql/statements/show-grants) to answer "why can't I
  see this table?" from inside a session, and
  [SHOW USER](/docs/reference/sql/statements/show-user) for session identity.
