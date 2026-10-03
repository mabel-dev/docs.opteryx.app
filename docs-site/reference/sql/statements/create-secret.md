---
title: CREATE SECRET Statement — Opteryx Reference
description: SQL CREATE SECRET statement syntax for storing a write-only credential in an Opteryx workspace, to read private gs:// and s3:// buckets with READ_PARQUET, READ_JSONL and READ_CSV
---

# CREATE SECRET

The `CREATE SECRET` statement stores a credential, encrypted, in a workspace. A query
then names it with `credentials =>` in [READ_PARQUET](read-parquet),
[READ_JSONL](read-jsonl) or [READ_CSV](read-csv) to read a private bucket.

Secrets are **write-only**: no statement ever returns the value, including to the
person who created it. See [Secret Management](/docs/reference/sql/advanced/adv-secret-management)
for how secrets are scoped, protected and used.

## Syntax

~~~sql
CREATE [ OR REPLACE ] SECRET [ IF NOT EXISTS ] <name> IN <workspace>
    ( TYPE '<type>', <KEY> { :<parameter> | '<literal>' } [, ...] );
~~~

- **`<name>`** — 1–63 letters, digits and underscores, not starting with a digit.
  Names are lowercased, and unique within their workspace.
- **`IN <workspace>`** — required. A bare workspace name, not a dotted one.
- **`TYPE`** — a string literal: `gcs_service_account`, `aws_access_key` or
  `http_endpoint`. The type is fixed when the secret is created.
- **`<KEY>`** — each option takes either a named parameter (`:name`) or a string
  literal. Unknown and repeated keys are errors, not ignored.
- `OR REPLACE` — replace an existing secret's value atomically. Keeps `created_by` and
  `created_at`; resets `last_used_at` and `use_count`. There is no `ALTER SECRET`.
- `IF NOT EXISTS` — leave an existing secret untouched instead of refusing. Using it
  together with `OR REPLACE` is refused as a contradiction.

`CREATE SECRET` must be the only statement in its request.

## Types

### `gcs_service_account`

Reads `gs://` paths with a Google Cloud service-account key.

| Key | Required | Value |
| --- | --- | --- |
| `KEY` | yes | The service-account JSON key file, as one string. It must be a `"type": "service_account"` key whose `token_uri` is Google's. |
| `SCOPE` | yes | A `gs://bucket/prefix/` the secret may read under. |

### `aws_access_key`

Reads `s3://` paths with an AWS access key.

| Key | Required | Value |
| --- | --- | --- |
| `ACCESS_KEY_ID` | yes | The access key id. |
| `SECRET_ACCESS_KEY` | yes | The secret access key. |
| `SESSION_TOKEN` | for `ASIA…` key ids | Required when the key id is a temporary (`ASIA…`) one. |
| `REGION` | no | An AWS region name, such as `eu-west-2`. |
| `SCOPE` | yes | An `s3://bucket/prefix/` the secret may read under. |

### `http_endpoint`

A URL plus optional headers.

| Key | Required | Value |
| --- | --- | --- |
| `URL` | yes | An `https://` URL whose host resolves to a public address, with no credentials in it. |
| `HEADER_AUTHORIZATION` | no | Sent as `Authorization`. |
| `HEADER_X_API_KEY` | no | Sent as `X-Api-Key`. |
| `HEADER_X_AUTH_TOKEN` | no | Sent as `X-Auth-Token`. |

> Be Aware: an `http_endpoint` secret can be created, but **nothing uses it yet** —
> delivering trigger notifications to an endpoint is not built.

`SCOPE` is a prefix, not a glob, matched on a bucket boundary, and its scheme must match
the type — see [SCOPE](/docs/reference/sql/advanced/adv-secret-management). Nothing is
fetched from the store at creation; a key that is well-formed but wrong surfaces on the
first read.

## Examples

### Write the Value Inline (Studio)

~~~sql
CREATE SECRET billing_reader IN analytics (
    TYPE  'gcs_service_account',
    KEY   '{"type": "service_account", ...}',
    SCOPE 'gs://acme-exports/billing/'
);
~~~

The literal is lifted out before the statement is stored or logged; history shows
`KEY :redacted_key`.

### Bind the Values as Parameters (API)

~~~sql
CREATE SECRET lake_reader IN analytics (
    TYPE              'aws_access_key',
    ACCESS_KEY_ID     :key_id,
    SECRET_ACCESS_KEY :secret,
    REGION            'eu-west-2',
    SCOPE             's3://acme-lake/exports/'
);
~~~

with `key_id` and `secret` sent in the `parameters` of `POST /api/v1/jobs`. The
Studio's Variables panel cannot supply these — see
[Supplying values](/docs/reference/sql/advanced/adv-secret-management).

### Replace a Value

~~~sql
CREATE OR REPLACE SECRET lake_reader IN analytics (
    TYPE              'aws_access_key',
    ACCESS_KEY_ID     :new_key_id,
    SECRET_ACCESS_KEY :new_secret,
    SCOPE             's3://acme-lake/exports/'
);
~~~

## Who May Create

Requires `ALTER` on the **whole workspace** — the `owner` role on a pattern matching the
workspace itself, such as `analytics.*`. The workspace must have a billing account.

## Errors

| You see | Because |
| --- | --- |
| `CREATE SECRET references parameter(s) with no value: :name` | A `:name` placeholder was not given a value in `parameters`. |
| `You do not have permission to manage secrets in workspace ws.` | You do not own the whole workspace. |
| HTTP 409: `workspace ws has no billing account, so it has no key to encrypt secrets under` | The workspace has no billing account. |
| HTTP 409: `secret ws.name already exists (use CREATE OR REPLACE SECRET to replace its value)` | Use `OR REPLACE` or `IF NOT EXISTS`. |
| `gcs_service_account requires SCOPE` (and similar) | A required key is missing. |
| `aws_access_key with a temporary (ASIA) key id requires SESSION_TOKEN` | Temporary keys need their session token. |

## See Also

- [DROP SECRET](drop-secret)
- [SHOW SECRETS](show-secrets)
- [Secret Management](/docs/reference/sql/advanced/adv-secret-management)
- [READ_PARQUET](read-parquet)
