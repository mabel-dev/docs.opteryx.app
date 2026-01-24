import DocRenderer from '@/app/components/DocRenderer'

export default function Page(){
  const source = `
# Security & Permissions

Opteryx uses workspaces as the default permission boundary. Within a workspace access can be granted at workspace level or at the table (dataset) level.

## Roles and capabilities

- **read** — can query and read dataset rows and metadata.
- **write** — can modify table contents (insert/replace) and create snapshots.
- **own** — full administrative control for the resource, including changing permissions and deleting tables.

Roles may be granted at the workspace level (applies to all datasets in the workspace) or scoped to individual tables.

## Workspace boundaries

Workspaces are the primary isolation and billing boundary. By default, permissions applied to a workspace propagate to its datasets unless an explicit per-table override exists.

## Policy API

Policies and ACLs can be managed via the Policy API (see [Policy API](/docs/reference/api/policy-api.md)). The Policy API accepts JSON policy documents describing principals, resources and allowed actions.

Example (pseudo) policy fragment:

```
{
  "resource": "workspace:personal/bastian",
  "principal": "user:bastian",
  "actions": ["read","write"]
}
```

## Audit & Logging

All access is audited at query time. Audit logs are retained according to the account's retention settings and are accessible to workspace owners.

For API-level authentication, see the [Authentication API](/docs/reference/api/authentication-api.md).
`

  return <DocRenderer source={source} />
}
