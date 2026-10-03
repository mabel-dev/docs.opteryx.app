---
title: DROP SECRET Statement — Opteryx Reference
description: SQL DROP SECRET statement syntax for removing a stored credential from an Opteryx workspace
---

# DROP SECRET

The `DROP SECRET` statement removes a stored secret from a workspace. Any read that
names it with `credentials =>` fails from then on.

## Syntax

~~~sql
DROP SECRET [ IF EXISTS ] <name> { IN | FROM } <workspace>;
~~~

- **`<name>`** — the secret's name.
- **`IN <workspace>`** — required; `FROM` is accepted too.
- `IF EXISTS` — skip without error if the secret does not exist.

~~~sql
DROP SECRET billing_reader IN analytics;
~~~

## Dropping Is Not Revoking

`DROP SECRET` stops Opteryx using a credential. It does not invalidate the credential
anywhere else. If a credential leaked, drop the secret **and** revoke or rotate the
credential where it was issued (the service-account key in Google Cloud, the access key
in AWS). See [Secret Management](/docs/reference/sql/advanced/adv-secret-management).

## Who May Drop

Requires `ALTER` on the **whole workspace** — the `owner` role on a pattern such as
`analytics.*`.

## Errors

| You see | Because |
| --- | --- |
| `secret ws.name does not exist (use DROP SECRET IF EXISTS to make this quiet)` | No secret by that name in that workspace. |
| `User does not have permission to manage secrets in workspace ws` | You do not own the whole workspace. |

## See Also

- [CREATE SECRET](create-secret)
- [SHOW SECRETS](show-secrets)
- [Secret Management](/docs/reference/sql/advanced/adv-secret-management)
