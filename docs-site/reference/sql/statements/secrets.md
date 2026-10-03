---
title: CREATE / DROP / SHOW SECRET — Opteryx Reference
description: Store a credential in a workspace with CREATE SECRET, remove it with DROP SECRET, list secrets with SHOW SECRETS, and use one to read a private bucket with READ_PARQUET, READ_JSONL or READ_CSV
---

# Secrets

A secret is a credential stored, encrypted, in a workspace, so a query can read a
private bucket without the credential being written into the query. You create one
once with `CREATE SECRET`, then name it with `credentials =>` in
[READ_PARQUET](read-parquet), [READ_JSONL](read-jsonl) or [READ_CSV](read-csv).

Secrets are **write-only**. No statement ever returns a stored value, to anyone,
including the person who created it.

## Syntax

~~~sql
CREATE [ OR REPLACE ] SECRET [ IF NOT EXISTS ] <name> IN <workspace>
    ( TYPE '<type>', <KEY> { :<parameter> | '<literal>' } [, ...] );

DROP SECRET [ IF EXISTS ] <name> IN <workspace>;

SHOW SECRETS IN <workspace>;
~~~

- **`<name>`** — 1–63 letters, digits and underscores, not starting with a digit.
  Names are lowercased. A name is unique within its workspace; `alerts` in
  `analytics` and `alerts` in `staging` are unrelated secrets.
- **`IN <workspace>`** — required. A bare workspace name, not a dotted one. `FROM`
  is accepted in place of `IN` on `DROP SECRET` and `SHOW SECRETS`.
- **`TYPE`** — a string literal, one of the types below. The type is fixed when the
  secret is created; changing it is `CREATE OR REPLACE`.
- **`<KEY>`** — each option takes either a named parameter (`:name`) or a string
  literal. Unknown keys and repeated keys are errors, not ignored.
- `OR REPLACE` replaces the value atomically. `IF NOT EXISTS` leaves an existing
  secret untouched. Using both together is refused as a contradiction.

## Types

### `gcs_service_account`

Reads `gs://` paths with a Google Cloud service-account key.

| Key | Required | Value |
| --- | --- | --- |
| `KEY` | yes | The service-account JSON key file, as one string. It must be a `"type": "service_account"` key whose `token_uri` is Google's. |
| `SCOPE` | yes | A `gs://bucket/prefix/` the secret may read under. |

~~~sql
CREATE SECRET billing_reader IN analytics (
    TYPE  'gcs_service_account',
    KEY   :service_account_json,
    SCOPE 'gs://acme-exports/billing/'
);
~~~

### `aws_access_key`

Reads `s3://` paths with an AWS access key.

| Key | Required | Value |
| --- | --- | --- |
| `ACCESS_KEY_ID` | yes | The access key id. |
| `SECRET_ACCESS_KEY` | yes | The secret access key. |
| `SESSION_TOKEN` | for `ASIA…` key ids | Required when the key id is a temporary (`ASIA…`) one. |
| `REGION` | no | An AWS region name, such as `eu-west-2`. |
| `SCOPE` | yes | An `s3://bucket/prefix/` the secret may read under. |

~~~sql
CREATE SECRET lake_reader IN analytics (
    TYPE              'aws_access_key',
    ACCESS_KEY_ID     :key_id,
    SECRET_ACCESS_KEY :secret,
    REGION            'eu-west-2',
    SCOPE             's3://acme-lake/exports/'
);
~~~

### `http_endpoint`

A URL plus optional headers.

| Key | Required | Value |
| --- | --- | --- |
| `URL` | yes | An `https://` URL whose host resolves to a public address, with no credentials in it. |
| `HEADER_AUTHORIZATION` | no | Sent as `Authorization`. |
| `HEADER_X_API_KEY` | no | Sent as `X-Api-Key`. |
| `HEADER_X_AUTH_TOKEN` | no | Sent as `X-Auth-Token`. |

> Be Aware: an `http_endpoint` secret can be created, but **nothing uses it yet**.
> Delivering trigger notifications to an endpoint is not built. Creating one today
> stores it and does nothing else.

### `SCOPE`

`SCOPE` is required on both object-store types. It is a **prefix, not a glob**, and it
is matched on a bucket boundary: a scope of `gs://logs/` never admits
`gs://logs_private/`. Every file a read touches — the path you wrote, and every file a
glob expands to — must fall under it, or the read is refused before anything is
fetched. A bare bucket (`gs://logs`) means the whole bucket. Scopes containing `.`,
`..` or empty path segments are refused rather than normalised. The scheme must match
the type: `gs://` for `gcs_service_account`, `s3://` for `aws_access_key`.

`SCOPE` is a location, not a credential: it is stored in the clear and `SHOW SECRETS`
returns it.

Nothing is fetched from the store when a secret is created. A key that is well-formed
but wrong, or lacks access to the bucket, surfaces on the first read, with the store's
own refusal.

## Supplying Values

### From the Studio

Write the value inline as a string literal. Before the statement is stored, logged or
run, the value is lifted out and replaced by a placeholder named after its key, so your
query history shows, for example:

~~~sql
CREATE SECRET billing_reader IN analytics (
    TYPE 'gcs_service_account', KEY :redacted_key, SCOPE 'gs://acme-exports/billing/'
)
~~~

The Studio's **Variables** panel cannot supply a secret's value. Parameters for
`CREATE SECRET` are taken only from the request that submits it, never from saved
variables.

### From the API

Bind each value as a parameter and send it in the `parameters` of
`POST /api/v1/jobs`. The statement text then never holds the value at all:

~~~json
{
  "sql_text": "CREATE SECRET lake_reader IN analytics (TYPE 'aws_access_key', ACCESS_KEY_ID :key_id, SECRET_ACCESS_KEY :secret, SCOPE 's3://acme-lake/exports/')",
  "parameters": { "key_id": "AKIA...", "secret": "..." }
}
~~~

Parameters must be named (`:name`) and string-valued. Names starting `redacted_` are
reserved. `CREATE SECRET` must be the only statement in its request.

### What Opteryx Does Not Control

Opteryx keeps the value out of history, logs and query plans once it arrives. It
cannot reach what happens before that:

- your browser's editor storage, if you type a value into the Studio editor;
- your shell history, if you put the value on a command line;
- notebooks, which save cell source;
- BI tools and proxies that log statements before sending them.

Prefer binding the value as a parameter from a source that is not itself saved.

## Using a Secret

Name the secret with `credentials =>`, qualified with its workspace:

~~~sql
SELECT *
  FROM READ_PARQUET('gs://acme-exports/billing/2026-10/*.parquet',
                    credentials => 'analytics.billing_reader');
~~~

`READ_JSONL` and `READ_CSV` take the same option. With `credentials =>`, glob patterns
work on `gs://` and `s3://` paths. The value must be a string literal — not a column,
an expression or a parameter — and it applies to `gs://` and `s3://` paths only.

Without `credentials =>`, `gs://` and `s3://` reads stay anonymous. A secret is
**never inferred from a path**: a path that falls under some secret's `SCOPE` does not
pick that secret up.

Each use updates the secret's `last_used_at` and `use_count`.

## Listing Secrets

`SHOW SECRETS IN <workspace>` returns one row per secret, ordered by name, without its value:

| Column | Type | Description |
| --- | --- | --- |
| `secret_name` | `VARCHAR` | The secret's name |
| `secret_type` | `VARCHAR` | `gcs_service_account`, `aws_access_key` or `http_endpoint` |
| `scope` | `VARCHAR` | The `SCOPE` prefix (null for `http_endpoint`) |
| `created_by` | `VARCHAR` | Who created it |
| `created_at` | `TIMESTAMP` | When it was created |
| `updated_by` | `VARCHAR` | Who created it or last replaced it |
| `updated_at` | `TIMESTAMP` | When it was created or last replaced |
| `last_used_at` | `TIMESTAMP` | Last **attempted** use — a read that was then refused still counts |
| `use_count` | `BIGINT` | Number of uses |

The same rows are readable as
[`<workspace>.information_schema.secrets`](/docs/reference/sql/advanced/adv-information-schema),
which adds a `secret_catalog` column (the workspace).

## Replacing and Revoking

There is no `ALTER SECRET` and no `SHOW CREATE SECRET`. To change a value, run
`CREATE OR REPLACE SECRET` with the new one. Replacing keeps `created_by` and
`created_at`, and resets `last_used_at` and `use_count`.

If a credential leaks, `DROP SECRET` it **and** reissue or revoke the credential at its
source (rotate the service-account key, deactivate the AWS access key). Dropping the
secret stops Opteryx using it; it does not invalidate the credential anywhere else.

## Who May Manage and Use Secrets

Creating, replacing, dropping, listing **and using** a workspace's secrets all require
`ALTER` on the **whole workspace** — the `owner` role on a pattern matching the
workspace itself, such as `analytics.*`. Owning part of it is not enough, and there is
no per-secret grant. See
[Security & Permissions](/docs/core-concepts/access-and-permissions).

Secrets belong to one workspace. There are no account-wide secrets: a credential needed
in three workspaces is created three times, and revoking it from one is a `DROP SECRET`
there.

A workspace needs a billing account to hold secrets: the encryption key belongs to the
account.

## Errors

| You see | Because |
| --- | --- |
| `CREATE SECRET references parameter(s) with no value: :name` | A `:name` placeholder was not given a value in `parameters`. In the Studio, write the value inline instead. |
| `... is outside the SCOPE of secret ws.name` | The path, or a file a glob expanded to, is not under the secret's `SCOPE`. |
| `secret ws.name is of type gcs_service_account, which cannot read s3:// paths` (or the reverse) | The secret's type does not match the path's scheme. |
| `You do not have permission to manage secrets in workspace ws` / `... to use secrets in workspace ws` | You do not own the whole workspace. |
| `User does not have permission to manage secrets in workspace ws` | The same, from `DROP SECRET`, `SHOW SECRETS` or `information_schema.secrets`. The whole listing is refused; it is never returned empty. |
| HTTP 409: `workspace ws has no billing account, so it has no key to encrypt secrets under` | The workspace has no billing account. |
| HTTP 409: `secret ws.name already exists` | Use `CREATE OR REPLACE` or `IF NOT EXISTS`. |
| `secret ws.name does not exist` | Check the name and workspace in `credentials =>`, or use `DROP SECRET IF EXISTS`. |
| A refusal from Google Cloud Storage or S3 on the first read | The key is valid in form but the store rejected it, or it lacks access to the object. Opteryx reports the store's refusal. |

## See Also

- [READ_PARQUET](read-parquet)
- [READ_JSONL](read-jsonl)
- [READ_CSV](read-csv)
- [Information schema](/docs/reference/sql/advanced/adv-information-schema)
