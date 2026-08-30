---
title: ALTER TRIGGER Statement — Opteryx Reference
description: SQL ALTER TRIGGER statement syntax and examples for suspending and resuming a trigger in Opteryx
---

# ALTER TRIGGER

The `ALTER TRIGGER` statement suspends or resumes one trigger, or transfers the identity
its unattended runs execute as.

A suspended trigger still exists and is still reached when its table commits; it simply
enqueues nothing and records that it was suppressed. Prefer this to
[DROP TRIGGER](drop-trigger) when pausing: a dropped trigger is indistinguishable from one
that was never created, whereas a suspended one shows that it was switched off
deliberately, when, and by whom.

## Syntax

~~~sql
ALTER TRIGGER <trigger_name>
    ON <table_name>
    { SUSPEND | RESUME };

ALTER TRIGGER <trigger_name>
    ON <table_name>
    OWNER TO { <principal> | CURRENT_USER };
~~~

## Parameters

- **`<trigger_name>`** — the trigger to change. Use
  [SHOW TRIGGERS FOR](show-triggers) to list the triggers on a table.
- **`<table_name>`** — the table the trigger is attached to, fully qualified as
  `<workspace>.<collection>.<table_name>`.
- `SUSPEND` — stop the trigger firing, keeping it in place.
- `RESUME` — let it fire again.
- `OWNER TO` — transfer the identity the trigger's runs execute as. The incoming owner
  must be a user or a service account — platform identities are refused, because they
  carry no billing account and the trigger's runs are billed to its owner.

## Examples

### Suspend a Trigger
~~~sql
ALTER TRIGGER ingest_on_events ON my_workspace.raw.events SUSPEND;
~~~

### Resume It
~~~sql
ALTER TRIGGER ingest_on_events ON my_workspace.raw.events RESUME;
~~~

### Transfer Its Owner
~~~sql
ALTER TRIGGER ingest_on_events ON my_workspace.raw.events OWNER TO svc_ingest;
~~~

## Notes

- Requires the `writer` role on the table the trigger is attached to, the same as creating
  one.
- Suspension is recorded on the **trigger**, not the task. A task fired by several tables
  can be paused on one of them and left running on the others.
- A suspended trigger's table continues to accept commits normally; only the reaction is
  suppressed.
- What a trigger runs cannot be altered in place — repoint it with
  [CREATE OR REPLACE TRIGGER](create-trigger).
