## Hands-on exercise: a summary that keeps itself fresh

You will build a table you own, put a materialized view on top of it, watch the view refresh itself when the table changes, run a task by hand, then clean everything up. It takes about 40 minutes in [Studio](https://opteryx.app). Everything is created under your `personal` workspace, so nothing here is visible to anyone else.

Find your username first. Every statement below writes `personal.<you>`, and you substitute the value this returns:

```sql
SELECT USER();
```

### 1. A table of your own

```sql
CREATE TABLE personal.<you>.planet_log AS
SELECT name,
       mass,
       number_of_moons,
       'initial' AS load_batch
  FROM public.astronomy.planets;
```

One row per planet in the sample, committed as a single version. `load_batch` is a plain string column you will use to tell loads apart.

### 2. A view that maintains itself

```sql
CREATE MATERIALIZED VIEW personal.<you>.batch_totals AS
SELECT load_batch,
       COUNT(*)             AS planets,
       SUM(number_of_moons) AS moons
  FROM personal.<you>.planet_log
 GROUP BY load_batch;
```

```sql
SELECT * FROM personal.<you>.batch_totals;
```

One row, `initial`. Creating the view also registered a refresh trigger on `planet_log`. Look at it:

```sql
SHOW TRIGGERS FOR personal.<you>.planet_log;
```

### 3. Change the source, watch the view follow

```sql
INSERT INTO personal.<you>.planet_log (name, mass, number_of_moons, load_batch)
VALUES ('Ceres', 0.00094, 0, 'dwarf');
```

Commits within about a minute coalesce into one refresh, so wait a minute, then:

```sql
SELECT * FROM personal.<you>.batch_totals ORDER BY load_batch;
```

Two rows now. If there is still one, check how the last refresh went:

```sql
SELECT trigger_name, target, last_fired_at, last_fired_status
  FROM personal.information_schema.triggers;
```

### 4. Read the history

```sql
SHOW SNAPSHOTS FOR personal.<you>.planet_log;
```

Two commits: the `CREATE` and the `INSERT`. The refresh does not appear here because it was a commit to `batch_totals`, not to `planet_log`.

Read the table as it was before the insert:

```sql
SELECT load_batch, COUNT(*) AS planets
  FROM personal.<you>.planet_log VERSION AS OF PREVIOUS
 GROUP BY load_batch;
```

Only `initial`.

### 5. A task you run by hand

A materialized view re-runs one `SELECT`. A task runs any statement, with values supplied at run time:

```sql
CREATE TASK personal.<you>.add_body AS
    INSERT INTO personal.<you>.planet_log (name, mass, number_of_moons, load_batch)
    VALUES (:name, :mass, :moons, 'manual');
```

```sql
EXECUTE personal.<you>.add_body
    USING 'Eris' AS name,
          0.0166 AS mass,
          1 AS moons;
```

The task ran as you, gated by your permissions at that moment. Query `batch_totals` again after a minute: a `manual` row should have appeared, because the task's `INSERT` committed to a table the view's trigger watches.

### 6. Who can see it

```sql
SHOW GRANTS;
```

This lists the roles you hold and what each one permits. Your `personal` workspace cannot be shared with anyone else, so there is nothing to grant here. Read [GRANT](/docs/reference/sql/statements/grant) for the statement you would use on a shared workspace, then work out which role each of steps 1 to 5 needed. Creating the view and its trigger needed `writer` on `planet_log`, not just `reader`.

### 7. Clean up

```sql
DROP TASK personal.<you>.add_body;
```

```sql
DROP MATERIALIZED VIEW personal.<you>.batch_totals;
```

```sql
DROP TABLE personal.<you>.planet_log;
```

Drop the view before the table so nothing is left pointing at a table that has gone. `DROP TABLE` also removes the history you read in step 4.

### Check your understanding

<details>
<summary>Why can a second materialized view not be built on top of <code>batch_totals</code>?</summary>

Materialized views do not stack. The outer view would always be one refresh behind the inner one, and a failed inner refresh would silently freeze everything above it. Model the whole transform as one query over the base table instead. See [CREATE MATERIALIZED VIEW](/docs/reference/sql/statements/create-materialized-view).

</details>

<details>
<summary>What would change if step 5 had defined the task with <code>ON personal.&lt;you&gt;.planet_log</code>?</summary>

A trigger would be created alongside the task, and the task would run unattended as its owner on every commit to `planet_log`, including the commits the task itself makes. Think carefully before wiring a task to the table it writes to. See [CREATE TRIGGER](/docs/reference/sql/statements/create-trigger).

</details>

<details>
<summary>The view in step 2 refreshes with your permissions. Why is that a problem for a view that should outlive your account?</summary>

If your access is removed, refreshes are denied and the view goes stale. Hand a long-lived view to a service identity with `ALTER MATERIALIZED VIEW ... OWNER TO`. See [Federator](/docs/core-concepts/federator).

</details>
