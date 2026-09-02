---
title: ALTER TRIGGER Statement — Opteryx Reference
description: SQL ALTER TRIGGER statement syntax and examples for suspending, resuming, re-owning and rate-limiting a trigger in Opteryx
---

# ALTER TRIGGER

The `ALTER TRIGGER` statement suspends or resumes one trigger, transfers the identity
its unattended runs execute as, or sets the minimum interval between two of its firings.

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

ALTER TRIGGER <trigger_name>
    ON <table_name>
    SET MINIMUM INTERVAL TO <n> [ SECONDS | MINUTES ];
~~~

## Parameters

- **`<trigger_name>`** — the trigger to change. Use
  [SHOW TRIGGERS FOR](show-triggers) to list the triggers on a table.
- **`<table_name>`** — the table the trigger is attached to, fully qualified as
  `<workspace>.<collection>.<table_name>`.
- `SUSPEND` — stop the trigger firing, keeping it in place.
- `RESUME` — let it fire again.
- `SET MINIMUM INTERVAL TO` — the floor between two firings, as a whole number of
  `SECONDS` (the default unit) or `MINUTES`. Once the trigger fires, commits inside the
  interval after it are recorded as `throttled` rather than fired. `TO 0` removes the
  floor so every commit fires.
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

### Throttle It
~~~sql
ALTER TRIGGER ingest_on_events ON my_workspace.raw.events
    SET MINIMUM INTERVAL TO 5 MINUTES;
~~~

### Fire on Every Commit
~~~sql
ALTER TRIGGER ingest_on_events ON my_workspace.raw.events
    SET MINIMUM INTERVAL TO 0;
~~~

### Transfer Its Owner
~~~sql
ALTER TRIGGER ingest_on_events ON my_workspace.raw.events OWNER TO svc_ingest;
~~~

## Notes

- Requires the `writer` role on the table the trigger is attached to, the same as creating
  one.
- Suspension is recorded on the **trigger**, not the task. A task has one trigger, so
  suspending it stops the task's unattended runs entirely; the task can still be run by
  hand with [EXECUTE](execute).
- A suspended trigger's table continues to accept commits normally; only the reaction is
  suppressed.
- **A new trigger starts with a two-minute floor.** The floor is a throttle: the first
  commit in a burst fires, and commits inside the interval after it do not. A throttled
  commit is not queued for later — the target stays as of the first commit in the burst
  until the next commit after the interval fires again. Nothing is lost: a refresh
  rebuilds in full, and a windowed task's next run widens its window back over the
  skipped commits. Set the floor `TO 0` on a trigger that must react to every commit.
  Triggers created before the floor existed have none, and this statement is how they
  acquire one.
- Two commits landing within milliseconds of each other cannot both fire: the right to
  fire is claimed atomically on the trigger's record, so the floor holds for exactly the
  burst it exists for.
- The floor is per **trigger**. A view with two sources has two refresh triggers and two
  floors; a task has one trigger, so its floor is one number.
- A throttled firing is not an error and is not alerted. It shows as `throttled` in
  `last_fired_status`, and the floor itself in `minimum_interval_seconds`, in
  [SHOW TRIGGERS FOR](show-triggers) and
  [information_schema.triggers](../advanced/adv-information-schema).
- Lowering the floor takes effect at the next commit. Raising it does not undo a firing
  that has already happened.
- What a trigger runs cannot be altered in place — repoint it with
  [CREATE OR REPLACE TRIGGER](create-trigger).
