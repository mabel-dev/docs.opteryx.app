---
title: REVOKE Statement — Opteryx Reference
description: SQL REVOKE statement syntax for revoking a granted reader, writer or owner role on a workspace, collection or dataset from a user in Opteryx
---

# REVOKE

The `REVOKE` statement removes a role a user was granted on a workspace,
collection, or dataset. It deletes exactly **one** access policy — the one
granting exactly this role, on exactly this object, to this user.

## Syntax

~~~sql
REVOKE READER | WRITER | OWNER ON WORKSPACE workspace_name FROM USER user_name;
REVOKE READER | WRITER | OWNER ON COLLECTION collection_name FROM USER user_name;
REVOKE READER | WRITER | OWNER ON DATASET dataset_name FROM USER user_name;
~~~

~~~sql
REVOKE WRITER ON COLLECTION production.sales FROM USER jai;
~~~

## Resolution Is Exact

A revoke names exactly what was granted — the role, the object, and its level.
If no policy matches all three, the statement is an error that says why:

- **Same object, different role** — the error names the role actually held.
- **Access held at a different level** — revoking `READER` on a dataset from a
  user whose read comes from a workspace-level grant is refused, naming the
  workspace-level policy. A revoke never narrows a broader grant, and never
  reports success while leaving the access in place; revoke the covering grant
  at its own level, or leave it be.
- **Nothing held** — a plain not-found. A revoke of something never granted is
  an error, not a no-op.

## Who May Revoke

The caller must hold `OWNER` covering the object, and **nobody can revoke their
own access** — ask another owner. Because you cannot act on your own grants, the
last owner of an object can never remove themselves, so an object cannot be
orphaned from SQL.

There is no `ALTER` for grants: to change a user's role on an object, `REVOKE`
the old role and `GRANT` the new one.

## Notes

- Available where the deployment provides a policy service; embedded and
  command-line sessions refuse the statement.
- Every applied revoke is recorded in the audit log.
- A revoke affects sessions created after it is applied; a running session keeps
  the policies it connected with.

## See Also

- [GRANT](grant)
- [SHOW GRANTS ON](show-grants-on)
- [SHOW GRANTS](show-grants)
