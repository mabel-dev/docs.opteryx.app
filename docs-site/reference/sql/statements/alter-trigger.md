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
- `SET MINIMUM INTERVAL TO` — the floor between two firings, as a whole number of
  seconds (the default unit) or minutes. Inside the interval after a firing, a commit
  to the table records `last_fired_status: throttled` on the trigger and fires nothing.
  `0` removes the floor, so the trigger fires on every commit.

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

### Fire at Most Once Every Five Minutes
~~~sql
ALTER TRIGGER ingest_on_events ON my_workspace.raw.events SET MINIMUM INTERVAL TO 5 MINUTES;
~~~

### Fire on Every Commit
~~~sql
ALTER TRIGGER ingest_on_events ON my_workspace.raw.events SET MINIMUM INTERVAL TO 0;
~~~

## Notes

- Requires the `writer` role on the table the trigger is attached to, the same as creating
  one.
- Suspension is recorded on the **trigger**, not the task. A task fired by several tables
  can be paused on one of them and left running on the others.
- A suspended trigger's table continues to accept commits normally; only the reaction is
  suppressed.
- The minimum interval is a throttle, not a debounce: the **first** commit in a burst
  fires, and later commits inside the interval do not. The target is therefore current as
  of that first commit until the next commit after the interval fires again. A throttled
  task run loses nothing — the next run's window widens back over the skipped commits —
  and a throttled refresh re-reads everything when it next fires.
- New triggers are created with a minimum interval of 120 seconds. Triggers created before
  the setting existed have none and fire on every commit; this statement is how they
  acquire one. The current value is `minimum_interval_seconds` in
  [information_schema.triggers](../advanced/adv-information-schema#information_schematriggers).
- Two commits landing within milliseconds of each other cannot both fire: the right to
  fire is claimed atomically on the trigger's record, so the floor holds for exactly the
  burst it exists for.
- **A new trigger starts with a two-minute floor.** The floor is a throttle: the first
  commit in a burst fires, and commits inside the interval after it do not. A throttled
  commit is not queued for later — a refresh trigger's view catches up on the next firing,
  because a refresh rebuilds in full, but a task fired with a window is never handed that
  commit's rows. Set the floor `TO 0` on a task trigger that must see every commit.
- The floor is per **trigger**, not per target. A task fired by two tables, or a view
  with two sources, has two triggers and two floors.
- A throttled firing is not an error and is not alerted. It shows as `throttled` in
  `last_fired_status`, and the floor itself in `minimum_interval_seconds`, in
  [SHOW TRIGGERS FOR](show-triggers) and
  [information_schema.triggers](../advanced/adv-information-schema).
- Lowering the floor takes effect at the next commit. Raising it does not undo a firing
  that has already happened.
- What a trigger runs cannot be altered in place — repoint it with
  [CREATE OR REPLACE TRIGGER](create-trigger).
