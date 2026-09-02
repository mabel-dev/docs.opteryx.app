---
title: When a Materialized View Replaces a Pipeline
description: A decision guide for recognizing when a scheduled aggregation job can become a materialized view instead — no scheduler, no orchestrator, no separate monitoring system to maintain.
---

# When a Materialized View Replaces a Pipeline

A common shape of problem: some downstream table needs to stay in sync with an upstream one — a daily rollup, a denormalized summary, a filtered subset kept fresh for a dashboard. The usual answer is a pipeline: something triggers a job, the job re-runs a query, writes the result, and something else watches for it failing.

If the whole transform is one `SELECT` over tables already in your workspace, you may not need any of that. `CREATE MATERIALIZED VIEW` gives you the up-to-date table without the infrastructure around it.

## The Pipeline You'd Otherwise Build

To keep a summary table current by hand, you generally need:

- **A trigger** — cron, an orchestrator DAG, or a webhook off the upstream write
- **The job itself** — re-run the query, write the result somewhere
- **Failure handling** — retries, alerting when a run fails, a way to backfill after an outage
- **Staleness tracking** — something that tells you the table is behind, and by how much

None of that is specific to *your* transform — it's the same scaffolding for every scheduled table, rebuilt or shared across every one you maintain.

## What a Materialized View Does Instead

```sql
CREATE MATERIALIZED VIEW analytics.sales.daily_totals AS
SELECT order_date, SUM(amount) AS total
  FROM analytics.sales.orders
 GROUP BY order_date;
```

That statement is the entire implementation. From here:

- A refresh trigger is registered on every catalog table the query reads — `orders`, in this case.
- Any commit to `orders` fires it, and the platform re-runs the defining query and atomically swaps in the new result. Readers see the old contents or the new ones, never a partial rebuild.
- Rapid successive commits within roughly 60 seconds coalesce into a single refresh, so a burst of writes doesn't mean a burst of rebuilds.
- Staleness is a field on the view, not a separate system: check `last_refresh_status` in `information_schema.triggers` if a refresh is denied (a permissions change on the source, for example) — see [ALTER MATERIALIZED VIEW](/docs/reference/sql/statements/alter-materialized-view) for how ownership determines who a refresh runs as.

You query the result exactly like a table. There's no cron entry, no DAG node, no separate job to lose track of.

## When This Fits

- The source data already lives in catalog tables in the workspace the view will read.
- The transform is one query — a filter, join, or aggregate — not a multi-step procedure.
- Freshness should track writes to the source, not a clock. A nightly batch that could just as well run "whenever the data changes" is a good candidate.
- Refreshing on every commit (or every ~60 seconds of commit activity) is cheap enough to be worth doing, rather than something you'd deliberately want to run only once a day.

## When It Doesn't

- **The source isn't in Opteryx's catalog yet.** An external API, a system Opteryx doesn't connect to, a file drop — that data still needs a real ingestion step before anything can be a materialized view of it.
- **The transform needs logic beyond SQL** — row-by-row branching, calls to another service, anything a single `SELECT` can't express.
- **You need to chain transforms.** Materialized views don't stack: a view can't read from another materialized view, and registration is rejected if it would. Model the whole thing as one query, or keep the later step as a pipeline.
- **You need sub-minute, synchronous freshness.** The coalescing window means "refreshed shortly after the write," not "refreshed in the same transaction."
- **You're on the embedded engine.** This is a Cloud Warehouse feature — it needs a connector with a catalog to hold refresh triggers, which local Parquet or `opteryx-core` in-process usage doesn't have.

## Operating One

A materialized view still needs a small amount of upkeep, just less of it:

- **Ownership** — a view refreshes with the permissions of whoever created it by default. For one that should outlive an individual, hand it to a service identity with [`OWNER TO`](/docs/reference/sql/statements/alter-materialized-view#owner-to) — see [Federator](/docs/core-concepts/federator) for the platform identity built for exactly this.
- **Suspend and resume** — hold a view still during maintenance on its sources with `ALTER MATERIALIZED VIEW ... SUSPEND`, rather than dropping its triggers and losing the distinction between "deliberately off" and "quietly broken."
- **Manual refresh** — force a rebuild after fixing a failed refresh, or after a redefinition, with [`REFRESH MATERIALIZED VIEW`](/docs/reference/sql/statements/refresh-materialized-view).

## Related

- [CREATE MATERIALIZED VIEW](/docs/reference/sql/statements/create-materialized-view)
- [ALTER MATERIALIZED VIEW](/docs/reference/sql/statements/alter-materialized-view)
- [REFRESH MATERIALIZED VIEW](/docs/reference/sql/statements/refresh-materialized-view)
- [DROP MATERIALIZED VIEW](/docs/reference/sql/statements/drop-materialized-view)
- [Federator](/docs/core-concepts/federator)
- [Tasks and Triggers](/docs/guides/tasks-and-triggers) — the general form, for transforms that are not one `SELECT` or tables too large to rebuild
