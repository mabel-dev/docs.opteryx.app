---
title: Secret Management — Opteryx Reference
description: How Opteryx stores credentials as write-only, workspace-scoped secrets, how to supply values safely, how SCOPE limits what a secret can read, and how to use one with READ_PARQUET, READ_JSONL and READ_CSV
---

# Secret Management

A secret is a credential stored, encrypted, in a workspace, so a query can read a
private bucket without the credential being written into the query. You create it once
with [CREATE SECRET](/docs/reference/sql/statements/create-secret), then name it with
`credentials =>` when you read:

~~~sql
SELECT *
  FROM READ_PARQUET('gs://acme-exports/billing/2026-10/*.parquet',
                    credentials => 'analytics.billing_reader');
~~~

| Statement | Purpose |
| --- | --- |
| [CREATE SECRET](/docs/reference/sql/statements/create-secret) | Store a credential, or replace one with `OR REPLACE` |
| [DROP SECRET](/docs/reference/sql/statements/drop-secret) | Remove a stored credential |
| [SHOW SECRETS](/docs/reference/sql/statements/show-secrets) | List a workspace's secrets, never their values |

---

## Write-Only

No statement ever returns a stored value, to anyone, including the person who created
it. There is no `SHOW CREATE SECRET` and no `ALTER SECRET`. To change a value, run
`CREATE OR REPLACE SECRET` with the new one; to check what a secret is for, look at its
type and `SCOPE` in `SHOW SECRETS`.

---

## One Workspace Each

A secret belongs to exactly one workspace and is invisible from every other: `alerts`
in `analytics` and `alerts` in `staging` are unrelated. There are no account-wide
secrets — a credential needed in three workspaces is created three times, and removing
it from one is a `DROP SECRET` there.

A workspace needs a billing account to hold secrets, because the encryption key belongs
to the account. Without one, `CREATE SECRET` is refused with HTTP 409.

---

## Who May Manage and Use Them

Creating, replacing, dropping, listing **and using** a workspace's secrets all require
`ALTER` on the **whole workspace** — the `owner` role on a pattern matching the
workspace itself, such as `analytics.*`. Owning a collection or dataset in it is not
enough, and there is no per-secret grant: anyone who can use a secret can also replace
or drop it. See [Security & Permissions](/docs/core-concepts/access-and-permissions).

---

## Supplying Values

### In the Studio

Write the value inline as a string literal. Before the statement is stored, logged or
run, each value is lifted out and replaced by a placeholder named after its key, so
your query history shows:

~~~sql
CREATE SECRET billing_reader IN analytics (
    TYPE 'gcs_service_account', KEY :redacted_key, SCOPE 'gs://acme-exports/billing/'
)
~~~

The Studio's **Variables** panel cannot supply a secret's value: parameters for
`CREATE SECRET` are taken only from the request that submits it, never from saved
variables.

### Through the API

Bind each value as a named parameter and send it in the `parameters` of
`POST /api/v1/jobs`. The statement text then never holds the value at all:

~~~json
{
  "sql_text": "CREATE SECRET lake_reader IN analytics (TYPE 'aws_access_key', ACCESS_KEY_ID :key_id, SECRET_ACCESS_KEY :secret, SCOPE 's3://acme-lake/exports/')",
  "parameters": { "key_id": "AKIA...", "secret": "..." }
}
~~~

Parameters must be named (`:name`, not `?` or `$1`) and string-valued. Names starting
`redacted_` are reserved.

### What Opteryx Does Not Control

Once a value arrives, Opteryx keeps it out of query history, logs, query plans and
error messages. It cannot reach what happens before that:

- your browser's editor storage, if you type a value into the Studio editor;
- your shell history, if you put a value on a command line;
- notebooks, which save cell source;
- BI tools and proxies that log statements before sending them.

Bind values from a source that is not itself saved where you can.

---

## SCOPE

Both object-store types (`gcs_service_account`, `aws_access_key`) require a `SCOPE`:
the prefix the secret may read under. The credential's own permissions are your outer
boundary; `SCOPE` is Opteryx's, so a key that can reach more than one bucket is still
only ever pointed at the one you named.

- It is a **prefix, not a glob**.
- It is matched on a **bucket boundary**: `gs://logs/` never admits
  `gs://logs_private/`.
- **Every file a read touches** must fall under it — the path you wrote, and every file
  a glob expands to — checked before anything is fetched.
- A bare bucket (`gs://logs`) means the whole bucket. Scopes containing `.`, `..` or
  empty path segments are refused rather than normalised.
- The scheme must match the type: `gs://` for `gcs_service_account`, `s3://` for
  `aws_access_key`.

`SCOPE` is a location, not a credential: it is stored in the clear and `SHOW SECRETS`
returns it.

---

## Using a Secret

[READ_PARQUET](/docs/reference/sql/statements/read-parquet),
[READ_JSONL](/docs/reference/sql/statements/read-jsonl) and
[READ_CSV](/docs/reference/sql/statements/read-csv) take
`credentials => '<workspace>.<name>'`. The value is a string literal naming the secret,
qualified with its workspace — not a column, an expression or a parameter — and it
applies to `gs://` and `s3://` paths only. With it, glob patterns work on those paths.

Without `credentials =>`, `gs://` and `s3://` reads stay anonymous. A secret is
**never inferred from a path**: a path that falls under some secret's `SCOPE` does not
pick that secret up.

Each use stamps the secret's `last_used_at` and increments `use_count`. Both record the
last **attempted** use: a read refused by `SCOPE` or by the store still counts.

---

## Rotating and Revoking

- **Rotate**: issue a new credential at its source, run `CREATE OR REPLACE SECRET` with
  it, then retire the old one at the source. The replace is atomic — there is no moment
  the secret exists without a value.
- **Leaked**: `DROP SECRET` it **and** revoke the credential where it was issued.
  Dropping the secret stops Opteryx using it; it does not invalidate the credential
  anywhere else.

---

## `http_endpoint`

A third type, `http_endpoint` (a URL plus optional headers), can be created and listed,
but **nothing uses it yet**: delivering trigger notifications to an endpoint is not
built.

---

## Troubleshooting

| You see | Because |
| --- | --- |
| `CREATE SECRET references parameter(s) with no value: :name` | A `:name` placeholder had no value in `parameters`. In the Studio, write the value inline instead. |
| `the path is outside the SCOPE of secret ws.name` / `'file' is outside the SCOPE of secret ws.name` | The path, or a file a glob expanded to, is not under the secret's `SCOPE`. |
| `secret ws.name is of type gcs_service_account, which cannot read s3:// paths` | The secret's type does not match the path's scheme. |
| `You do not have permission to use secrets in workspace ws.` | You do not own the whole workspace the secret belongs to. |
| `User does not have permission to manage secrets in workspace ws` | The same, from `DROP SECRET`, `SHOW SECRETS` or `information_schema.secrets`. |
| `secret ws.name does not exist` | Check the name and the workspace in `credentials =>`. |
| HTTP 409 on `CREATE SECRET`: `... has no billing account ...` | The workspace has no billing account. |
| A refusal from Google Cloud Storage or S3 on the first read | The key is valid in form but the store rejected it, or it lacks access to the object. Opteryx reports the store's own refusal. |
