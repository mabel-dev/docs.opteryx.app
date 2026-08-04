---
title: Limits — Opteryx Reference
description: The limits Opteryx enforces, what happens when you hit them, and which declared settings are not currently enforced.
---

# Limits

## Result size

A query whose result exceeds `sql_select_limit` (default **1,073,741,824** rows)
is **rejected, not truncated**:

~~~
Query returned 2,000,000,000 rows, which exceeds the 1,073,741,824 row limit
(`sql_select_limit`). Add a LIMIT clause to your query to bound the result,
e.g. `... LIMIT 1000`.
~~~

Returning the first N rows of a larger result would be a wrong answer that the
caller has no way to detect, so the engine refuses instead. If you want the first
N rows, say so with `LIMIT`.

The limit is checked twice, because neither check alone is sufficient:

- **At plan time**, from the estimated row count — but only when every input
  relation has real statistics. An estimate resting on a fabricated default could
  reject a query that returns a handful of rows.
- **At run time**, from the rows actually delivered — which catches the cases the
  estimate was too low to predict.

`sql_select_limit` is server-owned and cannot be changed with `SET`.

## Types

| Limit | Value |
|-------|-------|
| `DECIMAL` precision | 1–38 |
| `DECIMAL` scale | 0 – precision |
| `DECIMAL` storage | precision 1–18 uses 64-bit, 19–38 uses 128-bit |

Precision outside 1–38 is rejected when the cast is planned:

~~~sql
SELECT CAST(1 AS DECIMAL(39,2));   -- DECIMAL precision must be 1..38; got 39
~~~

## Aggregation

`ARRAY_AGG` collects at most `array_agg_max_values_per_group` values per group
(default **1000**, set by the `ARRAY_AGG_MAX_VALUES_PER_GROUP` environment
variable). `ARRAY_AGG` also requires a `GROUP BY`.

## Identifiers and syntax

See [Reserved Words](reserved-words) for the words that cannot be used as bare
identifiers, and the quoting that escapes them.

## Not currently enforced

Several settings exist and are visible in [SHOW VARIABLES](statements/show-variables)
but are **not** applied by the engine today. They are listed here so their
presence is not mistaken for a guarantee:

| Setting | Declared default | Status |
|---------|------------------|--------|
| `max_sql_length` | 256,000 | Not enforced — longer statements are accepted |
| `max_execution_time` | 1200 | Not enforced — queries are not timed out by the engine |

Do not rely on either as a safety limit. Bound long-running or oversized work in
the caller, or with `LIMIT`.

## Notes

- Retention settings (`result_retention_days`, `job_retention_days`) are platform
  concerns handled outside the query engine, not query-time limits.
- Concurrency and worker counts are tuning parameters rather than limits — see
  [System Variables](variables).
