# Security & Permissions

Opteryx uses workspaces as the default permission boundary. Within a workspace, access is granted with a **role** on a **resource pattern** - a glob over `collection.dataset` (e.g. `analytics.*` for every dataset in a collection, or `analytics.sales` for one dataset). A grant on `*` covers the whole workspace.

## Roles and capabilities

| Action | reader | writer | owner |
| --- | :---: | :---: | :---: |
| Query a dataset (`SELECT`) | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Insert / append rows | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Create a new table or view | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Truncate a table (remove all rows) | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Drop a table or view | | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Drop a collection | | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| `CREATE OR REPLACE` an existing table | | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| `ALTER TABLE ... CLUSTER BY` | | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| `ALTER TABLE ... RENAME TO` | | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| `ALTER WORKSPACE ... SET` | | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| View a table's manifest (`SHOW MANIFEST FOR`) | | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |
| Grant or revoke access to other users | | | <img src="/images/square-check.svg" alt="Allowed" class="table-check" /> |

Each role includes everything the role below it can do - **owner** implies **writer**, which implies **reader**.

A couple of things that surprise people:

- **`writer` can truncate a table.** Opteryx doesn't yet support row-level `UPDATE` or `DELETE FROM ... WHERE`, so `TRUNCATE TABLE` (a full wipe) is the only "delete" primitive that exists, and it's granted at the same tier as insert. There's no way to grant append-only access that's protected from truncation.
- **`writer` cannot replace a table.** `CREATE OR REPLACE TABLE` has the same blast radius as `DROP TABLE` - the existing data and history are gone - so it requires `owner`, even though `CREATE TABLE` for a brand-new table only requires `writer`.
- **`writer` cannot change a table's clustering.** `ALTER TABLE ... CLUSTER BY` changes the table's physical layout rather than its contents, so it sits at the same `owner` tier as `DROP TABLE`, not the `writer` tier that governs inserts and truncates.
- **`DROP COLLECTION` checks the grant against the collection's own name, not a pattern over its contents.** An `owner` grant on `workspace.staging.*` covers every table and view *inside* the `staging` collection but does not match `workspace.staging` itself, so it does not permit dropping the collection. You need a grant that matches `workspace.staging` directly - an exact grant on it, or a workspace-wide `workspace.*`.
- **`ALTER WORKSPACE` needs ownership of the workspace itself, and owning its contents is not enough.** This goes one level further than the `DROP COLLECTION` rule above: even a workspace-wide `workspace.*` grant does not permit it, because that pattern covers everything *in* the workspace without matching the workspace's own name. You need a grant matching `workspace` directly, or a global `*`. Workspace properties govern the whole workspace, so the grant has to be scoped to it.
- **`ALTER TABLE ... RENAME TO` is checked at both ends.** It needs `owner` on the source (the table stops existing under that name) *and* create permission at the target, so owning a table does not let you move it into a collection you have no grant on.
- **There's also an `admin` role**, but it only applies to the [Control API](/docs/reference/api/control-api) - an admin can view and manage other users' grants on a pattern they administer. It does **not** grant any query access on its own; an admin who also needs to run queries needs a separate `reader`/`writer`/`owner` grant.

## Workspace boundaries

Workspaces are the primary isolation and billing boundary. A grant on a broader pattern (e.g. the whole workspace) applies to every dataset it matches unless a narrower, more specific grant exists.

Two schemas are handled specially and can't be targeted by a policy:

- **`public.*`** is read-only for everyone, regardless of any grant - you can't be given `writer` or `owner` there.
- **`personal.<username>.*`** is fully owned by that user - no grant is needed, and no one else can be granted access to it.

## Managing grants

Grants are managed via the [Control API](/docs/reference/api/control-api), which accepts JSON policy documents identifying a principal, a role, and a resource pattern.

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

## Platform identities

Not every row in an access list is a person. `federator` is a platform-managed system identity used for materialized view ownership and background compaction - see [Federator](/docs/core-concepts/federator) for what it is and why it needs write access.
