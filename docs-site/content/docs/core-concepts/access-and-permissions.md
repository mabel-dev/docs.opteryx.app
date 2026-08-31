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

- **`writer` can remove data, not just add it.** `TRUNCATE TABLE` (a full wipe), `DELETE`, `UPDATE` and `MERGE` all sit at the same tier as `INSERT` — they are writes to the table's contents, and the engine draws no line between adding rows and removing them. There's no way to grant append-only access that's protected from truncation or deletion.
- **`writer` cannot replace a table.** `CREATE OR REPLACE TABLE` has the same blast radius as `DROP TABLE` - the existing data and history are gone - so it requires `owner`, even though `CREATE TABLE` for a brand-new table only requires `writer`.
- **`writer` cannot change a table's clustering.** `ALTER TABLE ... CLUSTER BY` changes the table's physical layout rather than its contents, so it sits at the same `owner` tier as `DROP TABLE`, not the `writer` tier that governs inserts and truncates.
- **`DROP COLLECTION` checks the grant against the collection's own name, not a pattern over its contents.** An `owner` grant on `workspace.staging.*` covers every table and view *inside* the `staging` collection but does not match `workspace.staging` itself, so it does not permit dropping the collection. You need a grant that matches `workspace.staging` directly - an exact grant on it, or a workspace-wide `workspace.*`.
- **`ALTER WORKSPACE` needs ownership of the workspace itself, and owning its contents is not enough.** This goes one level further than the `DROP COLLECTION` rule above: even a workspace-wide `workspace.*` grant does not permit it, because that pattern covers everything *in* the workspace without matching the workspace's own name. You need a grant matching `workspace` directly, or a global `*`. Workspace properties govern the whole workspace, so the grant has to be scoped to it.
- **`ALTER TABLE ... RENAME TO` is checked at both ends.** It needs `owner` on the source (the table stops existing under that name) *and* create permission at the target, so owning a table does not let you move it into a collection you have no grant on.
- **Granting is `owner`-only, and never self-service.** Only an `owner` whose own grant covers the object may `GRANT` or `REVOKE` on it - owning `billing.*` does not let you administer `ops.*`. You cannot grant yourself access, so bootstrapping a workspace's first owner is not something a `GRANT` can do; that happens when the workspace is created.

## Workspace boundaries

Workspaces are the primary isolation and billing boundary. A grant on a broader pattern (e.g. the whole workspace) applies to every dataset it matches unless a narrower, more specific grant exists.

Two schemas are handled specially and can't be targeted by a policy:

- **`public.*`** is read-only for everyone, regardless of any grant - you can't be given `writer` or `owner` there.
- **`personal.<username>.*`** is fully owned by that user - no grant is needed, and no one else can be granted access to it.

## Managing grants

Grants are managed in SQL, alongside every other statement you run. There is no
separate API to call and no JSON policy document to assemble.

~~~sql
GRANT WRITER ON COLLECTION analytics.sales TO USER bastian;
REVOKE WRITER ON COLLECTION analytics.sales FROM USER bastian;
~~~

See [`GRANT`](/docs/reference/sql/statements/grant) and
[`REVOKE`](/docs/reference/sql/statements/revoke) for the full syntax. Each acts
on exactly one policy: there is no in-place edit, so changing someone's role is a
`REVOKE` followed by a `GRANT`.

To read grants back, [`SHOW GRANTS ON`](/docs/reference/sql/statements/show-grants-on)
lists the policies attached to an object, and
[`SHOW EFFECTIVE GRANTS ON`](/docs/reference/sql/statements/show-effective-grants-on)
also includes the broader grants above it - so a dataset reachable only through a
workspace-wide grant still names the person who holds it. Both are `owner`-gated on
the same authority a `GRANT` there would need: who may see the grants is who may
change them.

## Audit & Logging

All access is audited at query time. Audit logs are retained according to the account's retention settings and are accessible to workspace owners.

For API-level authentication, see the [Authentication API](/docs/reference/api/authentication-api).

## Platform identities

Not every row in an access list is a person. `federator` is a platform-managed system identity used for materialized view ownership and background compaction - see [Federator](/docs/core-concepts/federator) for what it is and why it needs write access.
