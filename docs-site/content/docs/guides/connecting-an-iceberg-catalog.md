---
title: Connecting an Iceberg Catalog - Opteryx
description: Point an Opteryx.app workspace at your own Apache Iceberg REST catalog - Apache Polaris, Google BigLake, or any REST-spec catalog - with ambient or stored credentials, connection testing, and a dataset list you refresh on demand.
---

# Connecting an Iceberg Catalog

This guide is for [opteryx.app](https://opteryx.app), the hosted service. By default a workspace's tables live in Opteryx's own storage — you upload data, Opteryx keeps it. A workspace can instead be pointed at **your** [Apache Iceberg](https://iceberg.apache.org/) REST catalog: your catalog stays in charge of the tables, and Opteryx queries them where they are.

Nothing is copied and nothing is migrated. `SELECT` runs against the tables your catalog reports, at the snapshot it reports them, every time.

## What You Get, and What You Don't

Connected catalogs are **read-only**.

| Works | Doesn't |
|---|---|
| `SELECT`, joins, aggregates, `EXPLAIN` | `CREATE`, `INSERT`, `UPDATE`, `DELETE`, `DROP` |
| Predicate pushdown and file pruning from Iceberg statistics | Materialized views, triggers, webhooks on these tables |
| Datasets listed in Studio and over [OData](/docs/guides/querying-via-odata) | Iceberg views |
| Cross-workspace joins against your Opteryx-hosted data | Nested types — `struct`, `map`, `list` columns |

A query that writes to a connected workspace fails; it does not fall back to Opteryx storage.

## Before You Start

- **An Iceberg REST catalog reachable over the public internet, on `https`.** Opteryx will not send a credential over an unencrypted connection, and it refuses addresses that resolve to private, loopback, or link-local ranges. A catalog inside your VPC with no public endpoint cannot be reached.
- **Read access for whichever identity you choose below**, on both the catalog and the object storage holding its data files.
- **Workspace ownership.** Binding a catalog can carry a credential and redefines where a workspace's data comes from, so only a workspace *owner* can do it. Owners and admins can read the settings, test the connection, and refresh the dataset list.

## The Choice Is Made When the Workspace Is Created

Where a workspace's tables live is fixed at creation. There is no convert and no revert — moving a workspace to different storage means deleting it and creating it again. The connection *settings* stay editable forever, because endpoints move and secrets rotate; the choice of storage does not.

In Studio, the New workspace form asks the question directly: Opteryx storage, or your own catalog. Choosing your own catalog reveals the connection fields.

## Connection Settings

| Field | What it is |
|---|---|
| Catalog type | `rest` — the Iceberg REST catalog spec. It is the only type supported today. |
| Catalog address | The REST endpoint, e.g. `https://polaris.example.com/api/catalog`. `https` only. |
| Warehouse | The warehouse or catalog name your server expects, e.g. `opteryx_fixture` or `bl://projects/…/catalogs/…`. |
| Anything else | Any other [PyIceberg](https://py.iceberg.apache.org/configuration/) catalog property, through the raw JSON editor. |

The form renders the common fields; the raw JSON editor beside it is the authority and accepts any property your catalog needs — `oauth2-server-uri`, `scope`, `header.<Name>` for an extra HTTP header, and so on. Three keys are refused because Opteryx sets them itself: `workspace`, `connector`, and `prefix`.

## Authentication

Two modes, and the difference is whether Opteryx stores a secret.

**Ambient** — Opteryx authenticates as its own service identity. Nothing is stored. The connection form shows you the identity to allowlist in your catalog. This is the right mode for a catalog that already understands Google identities, such as BigLake.

**Stored** — you hand over a secret. It is encrypted with envelope encryption under a KMS key before it touches storage; only the ciphertext is persisted, and it is never returned by the API or rendered back into the form. A stored credential is write-only, so replacing it means typing a new one, never editing an old one.

A stored secret is delivered to the catalog client at a property you choose — `token` for a bearer token, `credential` for the OAuth2 client-credentials flow (`<client-id>:<client-secret>`), or any other property path your catalog reads. Exactly one secret is stored per binding.

## Test the Connection

Both the New workspace form and the Catalog settings panel have a **Test connection** button, and it is worth using before you commit — the storage choice is permanent, so the answer should arrive while the decision is still reversible.

The test reports one of a fixed set of outcomes — reachable, DNS failure, TLS failure, authorization rejected, not found, timeout, blocked address. It never shows text from your catalog: a REST catalog can echo a bearer token back inside an error body, and that body is not something to put on a screen or in a log.

One honest caveat: an **ambient** test is reported as inconclusive. The service that runs the test and the engine that runs your queries authenticate as different identities, so a green tick proves the address is reachable and well-formed, not that the query engine may read your catalog. A stored-credential test exercises the real credential and does not carry that caveat.

## Refreshing the Dataset List

Queries always go straight to your catalog, so a table is queryable the moment your catalog has it. **Listing** is separate: the Studio dataset tree and the OData service document read a stored list of names, schemas, and statistics that Opteryx projects from your catalog.

That list is refreshed only when someone presses **Refresh dataset list**. Nothing refreshes it automatically — not on page load, not after a settings change, not on a lookup miss. A refresh lists every namespace in your catalog and then loads every table it finds, which is a real cost against your catalog and possibly on your bill, so the decision stays with you. The panel states how old the list is, and a "dataset not found" error on a connected workspace says the same thing and recommends a refresh.

Refresh after you create, rename, or drop tables — or whenever you want the tree to match reality.

If your catalog cannot be reached, the refresh fails and the stored list is left exactly as it was.

## Grants Take Time to Reach Opteryx

A grant you make is not visible to Opteryx immediately, and the delay is longer than IAM's own. Opteryx authenticates with a token that carries its group memberships **as they were when the token was issued**, so a newly granted identity is not seen until that token expires and a new one is issued — up to an hour.

Underneath that, IAM takes its own few minutes, and permissions do not all become active together. In testing, one query failed on four different permissions in turn, minutes apart, as each landed: the auth scope, then `serviceusage.services.use`, then `biglake.tables.get`, then `storage.objects.get` on the data files.

So after granting, expect the first queries to fail, and read the errors rather than changing settings:

- **The error changes between attempts** — grants are still landing. Wait.
- **The error is identical for an hour** — something is genuinely missing. Use the table below.

If you have granted everything and only the data-file read still fails (`Parquet pipeline error: HTTP 403`), the grants are correct and Opteryx is holding a token issued before them. That clears on its own.

## Querying

Nothing special. The workspace name is the first identifier, your Iceberg namespace and table follow:

```sql
SELECT event_id, event_ts, country
  FROM polaris_test.interop_ns.events
 WHERE event_id >= 400000 AND event_id < 400010;
```

`EXPLAIN ANALYZE` reports what was skipped, so you can confirm Iceberg statistics are doing their job:

```
Parquet Read   polaris_test.interop_ns.events   est_rows 50000   rows 10   94 ms
OPTIMIZATIONS
├─ files pruned                          applied 4×
├─ predicate pushdown into scan          applied
```

[Access policies](/docs/core-concepts/access-and-permissions) apply exactly as they do to Opteryx-hosted workspaces — the connected catalog is a source of tables, not a bypass of permissions.

## Example: Apache Polaris

[Apache Polaris](https://polaris.apache.org/) implements the REST spec's OAuth2 client-credentials flow, so the binding stores a principal's client secret and PyIceberg drives the token exchange.

```json
{
  "catalog_type": "rest",
  "uri": "https://polaris.example.com/api/catalog",
  "oauth2-server-uri": "https://polaris.example.com/api/catalog/v1/oauth/tokens",
  "warehouse": "opteryx_fixture",
  "scope": "PRINCIPAL_ROLE:ALL",
  "header.X-Iceberg-Access-Delegation": ""
}
```

Auth mode **stored**, with the secret delivered as `credential` and the value in `<client-id>:<client-secret>` form.

Three settings worth explaining:

- **`oauth2-server-uri` is explicit.** Left out, the client guesses the token endpoint from `uri` and warns about it — printing a config value to a log and relying on a fallback that is being removed.
- **`scope`** is Polaris's own principal-role scope; without it the token carries no role.
- **`header.X-Iceberg-Access-Delegation` is deliberately empty.** It opts out of Polaris credential vending, so Polaris serves metadata only and Opteryx reads the data files with its own identity. Leave it out and the client asks for vended credentials by default.

Grant the principal read-only access. Opteryx never writes.

## Example: Google BigLake

BigLake's Iceberg REST catalog authenticates with Google credentials, so this is the ambient case — no secret is stored at all.

```json
{
  "catalog_type": "rest",
  "uri": "https://biglake.googleapis.com/iceberg/v1/restcatalog",
  "warehouse": "gs://YOUR-WAREHOUSE-BUCKET",
  "auth": { "type": "google", "google": { "scopes": ["https://www.googleapis.com/auth/cloud-platform"] } },
  "header.x-goog-user-project": "PROJECT"
}
```

The `warehouse` takes one of two forms, depending on how your catalog was created. A single-bucket catalog (`CATALOG_TYPE_GCS_BUCKET`, whose name *is* the bucket name) uses `gs://BUCKET`. A multi-bucket catalog (`CATALOG_TYPE_BIGLAKE`) uses `bl://projects/PROJECT/catalogs/CATALOG`.

`auth.google.scopes` is not optional in practice. The field is labelled optional and shows the value below as grey placeholder text — that grey is an example, not a value. Leave it empty and the connection fails at authentication with `invalid_scope`.

`header.x-goog-user-project` sets the project billed for the catalog requests.

### Grants

Three roles, and all three are needed. Replace `OPTERYX_IDENTITY` with the identity shown in the connection form:

```bash
gcloud projects add-iam-policy-binding PROJECT \
  --member="OPTERYX_IDENTITY" --role="roles/biglake.viewer"

gcloud projects add-iam-policy-binding PROJECT \
  --member="OPTERYX_IDENTITY" --role="roles/serviceusage.serviceUsageConsumer"

gcloud storage buckets add-iam-policy-binding gs://YOUR-WAREHOUSE-BUCKET \
  --member="OPTERYX_IDENTITY" --role="roles/storage.objectViewer"
```

`serviceusage.serviceUsageConsumer` is the one people miss, and it is invisible until you try. The BigLake API attributes each call to a project, and a caller from outside that project must be permitted to use it. Anyone testing from inside their own project never sees this, because a project's own members can always use it — it appears only once the caller is genuinely external, which Opteryx always is.

The bucket grant is on the one bucket holding your warehouse, not on the project. Opteryx can see nothing else.

If your organization enforces `iam.allowedPolicyMemberDomains`, these grants are refused before IAM evaluates them, because the identity is outside your organization. Add Opteryx's customer ID to the allowed values first.

## AWS S3 Tables and AWS Glue

**Not supported today.** Both are worth stating plainly rather than leaving to a failed connection test.

Amazon S3 Tables does expose an Iceberg REST endpoint, so it looks like it should drop into the settings above. It doesn't, for two reasons, each of which is on its own sufficient:

1. **It authenticates with AWS SigV4**, which signs every request with an access key ID *and* a secret access key. A binding stores exactly one secret. There is no shape of the current credential store that carries an AWS key pair.
2. **Ambient mode is a Google identity.** Opteryx's engine runs on Google Cloud and its ambient credential is a Google service account — there is nothing for an AWS account to grant it.
The engine *can* now read `s3://` data files — a scan resolves an S3 path and reads it with the same range-read path it uses for Google Cloud Storage, so that is no longer one of the reasons. The two above are each still sufficient on their own.

AWS Glue is a different protocol again — not a REST-spec catalog — and is not one of the catalog types Opteryx offers.

What *does* work today is any Iceberg REST catalog that authenticates with a bearer token or OAuth2 client credentials, over a warehouse Opteryx's identity can read. If AWS support matters to you, [tell us](/docs/support/getting-help) — the credential model and the catalog-type list are both designed to grow, and demand is what orders them.

## Rotating a Credential

Publish the new secret through the Catalog settings panel, or `PUT` the binding again. Every write bumps the binding's version, and every worker rebuilds its connection on the next query that touches the workspace — no restart, no redeploy, no window where queries fail.

That applies to the binding's own settings and to a **stored** secret. It does not apply to **ambient** mode, where there is no secret to rotate: changing what the ambient identity is allowed to do is a change in *your* IAM, not a binding write, so nothing here notices it and the previous section's timing applies instead.

Rotate at your catalog first if the old secret must stop working immediately: a revoked client secret stops new tokens being issued, but an already-issued bearer token stays valid until it expires. That is how OAuth2 is specified, not a gap in Opteryx.

## Doing It Through the API

Everything in Studio is the [Control API](/docs/reference/api). Get a token first, exactly as in [Running a Query via the API](/docs/guides/running-a-query-via-the-api).

| Call | Purpose | Who |
|---|---|---|
| `GET /v1/catalog-kinds` | Catalog types this deployment offers, the fields each wants, and the ambient identity to allowlist | Any token |
| `POST /v1/catalog-connections/test` | Test a draft connection before the workspace exists | Account member |
| `GET /v1/workspaces/{name}/catalog` | Read the binding — never the credential | Owner or admin |
| `PUT /v1/workspaces/{name}/catalog` | Create or replace the binding | Owner |
| `POST /v1/workspaces/{name}/catalog/test` | Test the saved binding | Owner or admin |
| `POST /v1/workspaces/{name}/catalog/sync` | Refresh the dataset list | Owner or admin |
| `DELETE /v1/workspaces/{name}/catalog` | Remove the binding | Owner |

Binding a workspace to Polaris:

```bash
curl -X PUT https://control.opteryx.app/v1/workspaces/analytics/catalog \
  -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjIwMjYwNzA3IiwidHlwIjoiSldUIn0...' \
  -H 'Content-Type: application/json' \
  -d '{
        "kind": "iceberg",
        "config": {
          "catalog_type": "rest",
          "uri": "https://polaris.example.com/api/catalog",
          "oauth2-server-uri": "https://polaris.example.com/api/catalog/v1/oauth/tokens",
          "warehouse": "opteryx_fixture",
          "scope": "PRINCIPAL_ROLE:ALL",
          "header.X-Iceberg-Access-Delegation": ""
        },
        "auth": {
          "mode": "stored",
          "secret": "CLIENT_ID:CLIENT_SECRET",
          "inject_as": "credential"
        }
      }'
```

```json
{ "workspace": "analytics", "bound": true, "kind": "iceberg", "version": 1755648000000 }
```

The workspace must already exist and have an owner, and the caller must be one of them.

Reading it back returns the config and the auth *mode*, never the ciphertext, plus when the dataset list was last refreshed:

```bash
curl https://control.opteryx.app/v1/workspaces/analytics/catalog \
  -H 'Authorization: Bearer eyJ...'
```

```json
{
  "workspace": "analytics",
  "bound": true,
  "kind": "iceberg",
  "config": { "catalog_type": "rest", "uri": "https://polaris.example.com/api/catalog", "warehouse": "opteryx_fixture" },
  "auth": { "mode": "stored", "kms_key": "projects/…/cryptoKeys/…", "inject_as": "credential" },
  "version": 1755648000000,
  "updated_by": "you@example.com",
  "listing_synced_at_ms": 1755648120000,
  "listing_count": 42
}
```

Refreshing the dataset list reports what changed:

```bash
curl -X POST https://control.opteryx.app/v1/workspaces/analytics/catalog/sync \
  -H 'Authorization: Bearer eyJ...'
```

```json
{ "workspace": "analytics", "added": 3, "removed": 0, "updated": 1, "total": 42, "unreadable": 0, "duration_ms": 4120 }
```

`unreadable` counts tables your catalog listed but would not open — usually a permissions gap on those specific tables, or a type Opteryx doesn't read. They keep whatever detail an earlier refresh stored.

There is no SQL for any of this. There is no `ALTER WORKSPACE … SET CATALOG`, deliberately: a binding write can carry a secret, and secrets in query text end up wherever query text goes.

## Billing

Query and processing charges are the same as for any workspace — see the [Cost Model](/docs/core-concepts/cost-model). Storage never appears on your bill for a connected workspace, because Opteryx stores nothing. Your catalog provider bills you for what Opteryx asks of them, which is one reason the dataset-list refresh is yours to trigger.

## Troubleshooting

**A permission error, and you have granted everything.** Match the message — each one names a different missing piece, and they surface in this order:

| Message contains | What it means |
|---|---|
| `invalid_scope` | Google auth scopes is empty. Set it to `https://www.googleapis.com/auth/cloud-platform`. |
| `Caller does not have required permission to use project` | `roles/serviceusage.serviceUsageConsumer` on the project. |
| `biglake.catalogs.get denied` | `roles/biglake.viewer` on the project. |
| `biglake.tables.get denied` | `roles/biglake.viewer` again — the grant is right, it has not reached Opteryx yet. |
| `storage.objects.get denied` | `roles/storage.objectViewer` on the warehouse bucket. |
| `Parquet pipeline error: HTTP 403` | The data files, read after the catalog. The last to clear, and usually a token that predates your grant. |

**"Dataset not found" on a table you know exists.** The dataset list is stale, or the table is outside the namespaces your credential can list. Refresh the dataset list; the error tells you how old it is.

**The connection test says the address is blocked.** The address is `http`, or it resolves to a private or loopback range. Opteryx only connects to public `https` endpoints.

**Queries fail with an authorization error after a rotation at your catalog.** The stored secret is no longer valid. Publish the new one through the Catalog settings panel — the fix is a binding write, not a redeploy.

**A column is missing or a table won't open.** Iceberg `struct`, `map`, and `list` columns aren't read today. A table whose schema is entirely unreadable shows in the list with no columns and fails at query time.

**Everything worked and then a whole namespace vanished from the tree.** Refresh the dataset list — the tree shows the last projection, not live state.
