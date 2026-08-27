---
title: GRANT Statement — Opteryx Reference
description: SQL GRANT statement syntax for granting a reader, writer or owner role on a workspace, collection or dataset to a user in Opteryx
---

# GRANT

The `GRANT` statement gives a user a role on a workspace, collection, or dataset.
It adds exactly **one** access policy — the named role, on the named object, to the
named user.

## Syntax

~~~sql
GRANT READER | WRITER | OWNER ON WORKSPACE workspace_name TO USER user_name;
GRANT READER | WRITER | OWNER ON COLLECTION collection_name TO USER user_name;
GRANT READER | WRITER | OWNER ON DATASET dataset_name TO USER user_name;
~~~

The object kind states the shape of the name: a `WORKSPACE` is one part
(`production`), a `COLLECTION` two (`production.sales`), a `DATASET` three
(`production.sales.orders`). A name that does not match its kind is an error —
it is never silently reinterpreted as a different kind.

~~~sql
GRANT READER ON DATASET production.sales.orders TO USER dara;
GRANT WRITER ON COLLECTION production.sales TO USER jai;
GRANT OWNER  ON WORKSPACE production TO USER morgan;
~~~

## What a Grant Covers

A grant at a level covers everything below it: `WRITER ON WORKSPACE production`
can write every dataset in the workspace, present and future. Roles are ranked —
`owner` over `writer` over `reader` — and a role permits everything the ranks
below it permit.

| Role | Can |
|------|-----|
| `READER` | Read data |
| `WRITER` | Read, and change what is *in* a relation (`INSERT`, `TRUNCATE`, `CREATE`) |
| `OWNER` | All of the above, plus change or remove the relation itself (`DROP`, `ALTER`), and administer its grants (`GRANT`, `REVOKE`, `SHOW GRANTS ON`) |

## Who May Grant

The caller must hold `OWNER` covering the object being granted on. Two further
rules hold without exception:

- **Nobody can grant themselves access.** Ask another owner. This is also what
  keeps an object from losing its last owner — you cannot act on your own grants
  in either direction.
- **A redundant grant is refused.** Granting a role the user already holds via an
  equal-or-broader policy is rejected, as is a second grant on the same object —
  a grant a listing would show twice is a grant that was written wrong. A *higher*
  role on a narrower object is legitimate elevation and accepted.

There is no `ALTER` for grants: to change a user's role on an object, `REVOKE`
the old role and `GRANT` the new one.

## Notes

- Available where the deployment provides a policy service; embedded and
  command-line sessions refuse the statement rather than pretending to apply it.
- Personal spaces cannot be granted on, and shared spaces belong to billing
  accounts — `public` and `personal` are never grantable.
- The principal is always `TO USER` — roles and groups are not grantable.
- Every applied grant is recorded in the audit log.
- A grant affects sessions created after it is applied; a running session keeps
  the policies it connected with.

## See Also

- [REVOKE](revoke)
- [SHOW GRANTS ON](show-grants-on)
- [SHOW GRANTS](show-grants)
