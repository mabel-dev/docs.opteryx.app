---
title: SHOW SECRETS Statement — Opteryx Reference
description: SQL SHOW SECRETS statement syntax for listing an Opteryx workspace's stored secrets, without their values
---

# SHOW SECRETS

The `SHOW SECRETS` statement lists a workspace's secrets, one row each, ordered by
name. It never returns a value.

## Syntax

~~~sql
SHOW SECRETS { IN | FROM } <workspace>;
~~~

`IN <workspace>` is required; there is no bare `SHOW SECRETS`.

~~~sql
SHOW SECRETS IN analytics;
~~~

## Result Columns

| Column | Type | Description |
| --- | --- | --- |
| `secret_name` | `VARCHAR` | The secret's name |
| `secret_type` | `VARCHAR` | `gcs_service_account`, `aws_access_key` or `http_endpoint` |
| `scope` | `VARCHAR` | The `SCOPE` prefix; `NULL` for `http_endpoint` |
| `created_by` | `VARCHAR` | Who created it |
| `created_at` | `TIMESTAMP` | When it was created |
| `updated_by` | `VARCHAR` | Who created it or last replaced it |
| `updated_at` | `TIMESTAMP` | When it was created or last replaced |
| `last_used_at` | `TIMESTAMP` | Last **attempted** use — a read that was then refused still counts |
| `use_count` | `BIGINT` | Number of uses |

`SHOW SECRETS` is a read of
[`<workspace>.information_schema.secrets`](/docs/reference/sql/advanced/adv-information-schema),
which has the same rows plus a `secret_catalog` column, and can be filtered like any
table:

~~~sql
SELECT secret_name, last_used_at
  FROM analytics.information_schema.secrets
 WHERE last_used_at IS NULL;
~~~

## Who May List

Requires `ALTER` on the **whole workspace** — the same right as creating and dropping
secrets. Without it the statement fails with
`User does not have permission to manage secrets in workspace ws` rather than returning
no rows, so an empty result always means the workspace has no secrets.

## See Also

- [CREATE SECRET](create-secret)
- [DROP SECRET](drop-secret)
- [Secret Management](/docs/reference/sql/advanced/adv-secret-management)
