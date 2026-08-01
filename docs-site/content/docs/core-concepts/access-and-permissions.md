# Security & Permissions

Opteryx uses workspaces as the default permission boundary. Within a workspace, access is granted with a **role** on a **resource pattern** - a glob over `collection.dataset` (e.g. `analytics.*` for every dataset in a collection, or `analytics.sales` for one dataset). A grant on `*` covers the whole workspace.

## Roles and capabilities

| Action | reader | writer | owner |
| --- | :---: | :---: | :---: |
| Query a dataset (`SELECT`) | ✅ | ✅ | ✅ |
| Insert / append rows | | ✅ | ✅ |
| Create a new table or view | | ✅ | ✅ |
| Truncate a table (remove all rows) | | ✅ | ✅ |
| Drop a table or view | | | ✅ |
| `CREATE OR REPLACE` an existing table | | | ✅ |
| View a table's manifest (`SHOW MANIFEST FOR`) | | | ✅ |
| Grant or revoke access to other users | | | ✅ |

Each role includes everything the role below it can do - **owner** implies **writer**, which implies **reader**.

A couple of things that surprise people:

- **`writer` can truncate a table.** Opteryx doesn't yet support row-level `UPDATE` or `DELETE FROM ... WHERE`, so `TRUNCATE TABLE` (a full wipe) is the only "delete" primitive that exists, and it's granted at the same tier as insert. There's no way to grant append-only access that's protected from truncation.
- **`writer` cannot replace a table.** `CREATE OR REPLACE TABLE` has the same blast radius as `DROP TABLE` - the existing data and history are gone - so it requires `owner`, even though `CREATE TABLE` for a brand-new table only requires `writer`.
- **There's also an `admin` role**, but it only applies to the [Policy API](/docs/reference/api/policy-api) - an admin can view and manage other users' grants on a pattern they administer. It does **not** grant any query access on its own; an admin who also needs to run queries needs a separate `reader`/`writer`/`owner` grant.

## Workspace boundaries

Workspaces are the primary isolation and billing boundary. A grant on a broader pattern (e.g. the whole workspace) applies to every dataset it matches unless a narrower, more specific grant exists.

Two schemas are handled specially and can't be targeted by a policy:

- **`public.*`** is read-only for everyone, regardless of any grant - you can't be given `writer` or `owner` there.
- **`personal.<username>.*`** is fully owned by that user - no grant is needed, and no one else can be granted access to it.

## Policy API

Grants are managed via the [Policy API](/docs/reference/api/policy-api), which accepts JSON policy documents identifying a principal, a role, and a resource pattern.

Example - granting `writer` on every dataset in the `sales` collection:

```json
{
  "principal": { "identity": "bastian" },
  "role": "writer",
  "pattern": "sales.*"
}
```

## Audit & Logging

All access is audited at query time. Audit logs are retained according to the account's retention settings and are accessible to workspace owners.

For API-level authentication, see the [Authentication API](/docs/reference/api/authentication-api).
