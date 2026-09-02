---
title: Tasks and Triggers - Acting When a Table Changes
description: How triggers work in Opteryx and how to build one. A task holds the statement, a trigger fires it on every commit to a table, and each run is handed the exact window of rows that commit changed. A blueprint, two worked examples, and the traps to avoid.
---

# Tasks and Triggers: Acting When a Table Changes

Something writes to a table, and you want something else to happen: new rows copied into a curated table, a history table extended, a downstream summary brought up to date. In most warehouses that means a scheduler polling for change. In Opteryx the commit itself does the work. A **trigger** on the table fires a **task** you recorded earlier, and the task is told exactly which rows the commit added or removed.

If you have used streams and tasks elsewhere, the shape is familiar, with one difference: nothing polls, and there is no schedule to set. A trigger fires because a commit landed, and the run is handed that commit's boundaries.

This guide is for [opteryx.app](https://opteryx.app), the hosted service. Tasks and triggers live in the catalog, so the embedded engine over local Parquet has nothing to attach them to.

## Two Objects, Not One

A **task** is a stored statement. It has a name in the catalog, like a table, and its SQL may contain `:name` placeholders that are filled in when it runs. A task carries no identity and no schedule. Run one by hand with [EXECUTE](/docs/reference/sql/statements/execute) and it runs as you, checked against your permissions at that moment.

A **trigger** is attached to a table and names a task. Every commit that writes data to the table fires it. Compaction and expiration do not, because they change no rows. The trigger is what makes a run unattended, so the trigger is what carries an identity: its runs execute as its owner, which starts out as whoever created it.

Splitting the two is deliberate. One task can be run by hand for a backfill, or replayed over an old window, without being redefined. And a trigger can be suspended, resumed or handed to another owner without touching the SQL.

A task has **one** trigger at most. The window a run is handed is a pair of snapshot ids from the table that fired it, and two firing tables would push two unrelated version sequences through the same two placeholders. See [One Task, One Trigger](#one-task-one-trigger) below for what to do when two tables should cause the same work.

For the common case where the task reads the table that fires it, one statement does both:

```sql
CREATE TASK my_workspace.ops.land_events
    ON my_workspace.raw.events
    AS ...;
```

A materialized view is the special case of all this. It is one `SELECT`, rebuilt in full on every commit, with the trigger created for you. If that is what you need, read [When a Materialized View Replaces a Pipeline](/docs/guides/when-a-materialized-view-replaces-a-pipeline) instead. Tasks are for when the statement is not a single `SELECT`, when the destination is too large to rebuild, or when you need to control what runs and when.

## The Window a Run Is Handed

A trigger does not just say "the table changed". It binds two values into the task's placeholders:

| Placeholder | Value |
|-------------|-------|
| `:current_version` | The snapshot the firing commit produced |
| `:parent_version` | The snapshot the table was at before that commit |

Read the table at both with `VERSION AS OF` and the difference is exactly what the commit did. For an append-only table, the new rows are the ones in the current version that were not in the parent:

```sql
SELECT c.*
  FROM my_workspace.raw.events VERSION AS OF :current_version AS c
  LEFT ANTI JOIN my_workspace.raw.events VERSION AS OF :parent_version AS p
    ON c.event_id = p.event_id;
```

The window is fixed when the trigger fires, not when the run is picked up. If the run waits, or is retried, it still means the same commit. That is also what makes a run replayable: give the same two ids to `EXECUTE` and you get the same result.

## A Blueprint

The steps below are the same whatever the task does. The order matters: prove the statement, then record it, then wire it. Nothing is unattended until the last step.

### 1. Prove the statement by hand

Write it as an ordinary query first, with `PREVIOUS` and `CURRENT` standing in for the placeholders:

```sql
SELECT c.*
  FROM my_workspace.raw.events VERSION AS OF CURRENT AS c
  LEFT ANTI JOIN my_workspace.raw.events VERSION AS OF PREVIOUS AS p
    ON c.event_id = p.event_id;
```

If this returns the rows the last commit added, the window logic is right. Fix it here, where a mistake is a wrong result set rather than a wrong write.

### 2. Record it as a task

Create the task without `ON`. It is defined but nothing fires it, which is what you want while you are still testing:

```sql
CREATE TASK my_workspace.ops.land_events AS
    INSERT INTO my_workspace.curated.events
    SELECT c.event_id, c.occurred_at, c.customer_id, c.amount
      FROM my_workspace.raw.events VERSION AS OF :current_version AS c
      LEFT ANTI JOIN my_workspace.raw.events VERSION AS OF :parent_version AS p
        ON c.event_id = p.event_id;
```

Every relation in a task must be fully qualified. There is no session workspace when the task runs unattended, so a two-part name cannot be resolved. Creating the task checks only that the SQL parses and the name is free. Permissions are checked when it runs, against whoever is running it.

### 3. Run it by hand

```sql
EXECUTE my_workspace.ops.land_events
    USING PREVIOUS AS parent_version,
          CURRENT AS current_version;
```

This runs as you. Query the destination and confirm the rows landed once, and only once.

### 4. Backfill the history

A trigger only fires for commits made after it exists. If the source already has history you want processed, list its snapshots and run the task over each gap with explicit ids:

```sql
SHOW SNAPSHOTS FOR my_workspace.raw.events;
```

```sql
EXECUTE my_workspace.ops.land_events
    USING 1785100000000 AS parent_version,
          1785166801372 AS current_version;
```

Older snapshots are reclaimed over time, so backfill before you rely on them being there. See [Time Travel](/docs/reference/sql/advanced/time-travel#snapshot-reclamation).

### 5. Wire the trigger

```sql
CREATE TRIGGER land_on_events
    ON my_workspace.raw.events
    EXECUTE my_workspace.ops.land_events;
```

This needs the `writer` role on the table, because attaching a trigger is an update to that table. The trigger's owner is you, so from here its runs execute with your permissions.

### 6. Watch it fire

Make a commit to the source, then look at the trigger:

```sql
SHOW TRIGGERS FOR my_workspace.raw.events;
```

The `last_fired_at` and `last_fired_status` columns tell you whether the run happened and how it went. A status of `throttled` means a commit landed inside the trigger's minimum interval (120 seconds for a new trigger) and was deliberately not fired again — see *A burst of commits fires once* below. For every trigger in a workspace at once, query [information_schema.triggers](/docs/reference/sql/advanced/information-schema#information_schematriggers).

### 7. Give it an owner that will outlive you

A trigger owned by a person stops working when that person's access is removed, and its runs are billed to them until then. For anything that should keep running, hand it to a service account:

```sql
ALTER TRIGGER land_on_events
    ON my_workspace.raw.events
    OWNER TO svc_ingest;
```

The new owner must be a user or a service account. Platform identities such as [Federator](/docs/core-concepts/federator) cannot own triggers, because they have no billing account. See [Access and permissions](/docs/core-concepts/access-and-permissions) for what the service account needs to hold: `reader` on the source and `writer` on the destination, checked afresh on every fire.

## Example 1: Landing New Rows in a Curated Table

A raw events table receives whatever the upstream system sends, including rows you would rather not query directly. A curated table holds a cleaned copy, and it should grow as raw grows without ever being rebuilt.

The tables:

```sql
CREATE TABLE my_workspace.raw.events AS
SELECT event_id, occurred_at, customer_id, amount, payload
  FROM ... ;

CREATE TABLE my_workspace.curated.events AS
SELECT event_id,
       occurred_at::TIMESTAMP AS occurred_at,
       customer_id,
       amount::DOUBLE        AS amount
  FROM my_workspace.raw.events
 WHERE event_id IS NOT NULL
   AND amount >= 0;
```

The task, wired to the raw table in the same statement:

```sql
CREATE TASK my_workspace.ops.land_events
    ON my_workspace.raw.events
    AS INSERT INTO my_workspace.curated.events
       SELECT c.event_id,
              c.occurred_at::TIMESTAMP,
              c.customer_id,
              c.amount::DOUBLE
         FROM my_workspace.raw.events VERSION AS OF :current_version AS c
         LEFT ANTI JOIN my_workspace.raw.events VERSION AS OF :parent_version AS p
           ON c.event_id = p.event_id
        WHERE c.event_id IS NOT NULL
          AND c.amount >= 0;
```

From here, every commit to `raw.events` appends its new rows to `curated.events`, shaped and filtered, as the trigger's owner. The curated table is never scanned by the task, so the cost of a run is set by the size of the commit, not the size of the table.

Two things to notice. The anti join is on `event_id`, so a row that is re-sent with the same id is not landed twice. And the filter sits inside the task, so the raw table can go on accepting bad rows without them reaching the curated one.

## Example 2: Keeping a Change History

A reference table is overwritten in place by whatever loads it, and you want to know what changed and when. Compare the two versions of the table by key: rows in the current version only were inserted, rows in the parent only were deleted, and rows in both with different contents were updated.

The history table:

```sql
CREATE TABLE my_workspace.audit.customer_changes AS
SELECT 'I'::VARCHAR AS change_type,
       customer_id,
       email,
       tier,
       NOW()        AS recorded_at
  FROM my_workspace.ref.customers;
```

The task:

```sql
CREATE TASK my_workspace.ops.track_customer_changes
    ON my_workspace.ref.customers
    AS INSERT INTO my_workspace.audit.customer_changes
       SELECT 'I' AS change_type, c.customer_id, c.email, c.tier, NOW() AS recorded_at
         FROM my_workspace.ref.customers VERSION AS OF :current_version AS c
         LEFT ANTI JOIN my_workspace.ref.customers VERSION AS OF :parent_version AS p
           ON c.customer_id = p.customer_id
       UNION ALL
       SELECT 'D', p.customer_id, p.email, p.tier, NOW()
         FROM my_workspace.ref.customers VERSION AS OF :parent_version AS p
         LEFT ANTI JOIN my_workspace.ref.customers VERSION AS OF :current_version AS c
           ON p.customer_id = c.customer_id
       UNION ALL
       SELECT 'U', c.customer_id, c.email, c.tier, NOW()
         FROM my_workspace.ref.customers VERSION AS OF :current_version AS c
         JOIN my_workspace.ref.customers VERSION AS OF :parent_version AS p
           ON c.customer_id = p.customer_id
        WHERE c.email <> p.email
           OR c.tier  <> p.tier;
```

Each commit to `ref.customers` appends one row per changed customer to the history, tagged with what happened. The reference table stays a plain overwrite target for whatever loads it; nothing upstream has to know the history exists.

The update arm compares columns with `<>`, which is false when either side is `NULL`. If a tracked column can be null, wrap both sides in `COALESCE` so a change to or from null is caught. See [NULL semantics](/docs/reference/sql/advanced/null-semantics).

## One Task, One Trigger

A trigger names one table, and a task has at most one trigger. A second trigger aimed at a task that already has one is refused:

```sql
CREATE TRIGGER reconcile_on_orders  ON my_workspace.raw.orders  EXECUTE my_workspace.ops.reconcile;
CREATE TRIGGER reconcile_on_returns ON my_workspace.raw.returns EXECUTE my_workspace.ops.reconcile;
-- refused: task my_workspace.ops.reconcile is already fired by reconcile_on_orders ON
-- my_workspace.raw.orders; a task has one trigger - its window is that source's version sequence.
```

The rule exists because of the window. `:parent_version` and `:current_version` are snapshot ids of the table that fired the run, and a snapshot id from `returns` means nothing on `orders`. With two firing tables the same two placeholders would carry ids from two unrelated sequences, and nothing in the statement could tell which. The result is plausible wrong rows and no error. One source also lets the platform keep `last_window_to` as a real floor, skipping a run that a later one has already covered and widening a window back over a failed one, neither of which is meaningful across two sequences.

When two tables should cause the same work, write it as two tasks, each windowed on its own source:

```sql
CREATE TASK my_workspace.ops.reconcile_orders  ON my_workspace.raw.orders  AS ...;
CREATE TASK my_workspace.ops.reconcile_returns ON my_workspace.raw.returns AS ...;
```

If the work is a derivation that reads every source at head and recomputes, it is a [materialized view](/docs/guides/when-a-materialized-view-replaces-a-pipeline), which carries one refresh trigger per source by design. To move a task from one table to another, drop its trigger with [DROP TRIGGER](/docs/reference/sql/statements/drop-trigger) and attach the new one.

## Things That Bite

- **A task that writes to the table that fires it loops.** Its own commit fires the trigger again, and again. Write somewhere else, or keep the trigger on a different table from the one the task writes.
- **Only commits fire triggers.** There are no clock schedules, and a trigger definition that asks for one is refused rather than stored. If you need something to run at three in the morning regardless of commits, have your scheduler call `EXECUTE` through the [Jobs API](/docs/guides/running-a-query-via-the-api). The task is the same either way.
- **A run is gated when it fires, not when the trigger was created.** If the owner loses `reader` on the source or `writer` on the destination, the next run is denied and `last_fired_status` says so. Nothing else changes: the source keeps accepting commits and the destination quietly stops growing. Check the status when a downstream table looks behind.
- **A burst of commits fires once.** A new trigger carries a minimum interval of 120 seconds. The first commit in a burst fires; commits inside the interval after it are recorded as `throttled` and fire nothing. Nothing is lost — the next run after the interval takes a window that reaches back over the skipped commits — but the destination is current as of the *first* commit in the burst until then. Loosen or remove the floor with `ALTER TRIGGER ... SET MINIMUM INTERVAL TO <n> [SECONDS|MINUTES]`; `0` fires on every commit. See [ALTER TRIGGER](/docs/reference/sql/statements/alter-trigger).
- **Suspend, do not drop.** `ALTER TRIGGER ... SUSPEND` keeps the trigger and records that it was switched off deliberately. A dropped trigger looks the same as one that never existed. See [ALTER TRIGGER](/docs/reference/sql/statements/alter-trigger).
- **Dropping a task does not drop its triggers.** They live on the tables that fire them. Remove them with [DROP TRIGGER](/docs/reference/sql/statements/drop-trigger), then the task.
- **Egress protection follows the task.** If the task copies data out of a workspace that restricts egress, the run is refused unless that workspace has marked this task `SECURE` for the destination. See [ALTER WORKSPACE](/docs/reference/sql/statements/alter-workspace#secure-the-sanctioned-exemption).
- **Redefining a task takes effect on its next run.** `CREATE OR REPLACE TASK` swaps the SQL and keeps the triggers, including whose identity they run as. What a trigger runs cannot be edited in place; repoint it with `CREATE OR REPLACE TRIGGER`.

## Related

- [CREATE TASK](/docs/reference/sql/statements/create-task)
- [EXECUTE](/docs/reference/sql/statements/execute)
- [CREATE TRIGGER](/docs/reference/sql/statements/create-trigger)
- [ALTER TRIGGER](/docs/reference/sql/statements/alter-trigger)
- [SHOW TRIGGERS FOR](/docs/reference/sql/statements/show-triggers)
- [Time Travel](/docs/reference/sql/advanced/time-travel)
- [When a Materialized View Replaces a Pipeline](/docs/guides/when-a-materialized-view-replaces-a-pipeline)
- [Federator](/docs/core-concepts/federator)
