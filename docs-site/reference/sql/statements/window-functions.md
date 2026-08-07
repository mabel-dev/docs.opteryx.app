---
title: Window Functions — Opteryx Reference
description: SQL window functions in Opteryx — ranking functions (ROW_NUMBER, RANK, DENSE_RANK) and aggregate windows (SUM, COUNT, AVG) with OVER and PARTITION BY, and the rules each family follows.
---

# Window Functions

Window functions compute a value for each row based on a set of rows related to that row — its "window". Unlike aggregate functions, window functions do not collapse rows; each input row retains its identity in the result.

Opteryx supports two families of window function, and **they follow different rules**. Read the family you need rather than generalising from the other.

| Family | Functions | `ORDER BY` inside `OVER` |
|:--|:--|:--|
| Ranking | `ROW_NUMBER`, `RANK`, `DENSE_RANK` | **Required** |
| Aggregate | `SUM`, `COUNT`, `AVG` | **Not supported** |

Neither family supports a frame specification (`ROWS BETWEEN`, `RANGE BETWEEN`).

## Ranking Functions

~~~
SELECT ranking_function() OVER ([PARTITION BY column] ORDER BY column [ASC|DESC])
  FROM relation_name;
~~~

- **`ROW_NUMBER()`** — 1..n within each partition, ties broken arbitrarily.
- **`RANK()`** — ties share a rank, and the next rank skips (1, 1, 3).
- **`DENSE_RANK()`** — ties share a rank, and the next rank does not skip (1, 1, 2).

`ORDER BY` inside the `OVER` clause is **required** — without it the numbering would have no defined meaning, so Opteryx rejects the query rather than returning an arbitrary answer:

~~~sql
SELECT ROW_NUMBER() OVER (PARTITION BY id) FROM $planets;
-- ROW_NUMBER() requires an ORDER BY in its OVER (...) clause.
~~~

A ranking function without an `OVER` clause at all is rejected the same way — these functions are window-only.

`PARTITION BY` is optional. Without it, the whole relation is one window:

~~~sql
SELECT name, RANK() OVER (ORDER BY id) AS rk
  FROM $planets;
~~~

With it, numbering restarts in each partition:

~~~sql
SELECT planetId, ROW_NUMBER() OVER (PARTITION BY planetId ORDER BY id) AS rn
  FROM testdata.satellites;
~~~

Several ranking functions sharing the same `PARTITION BY` and `ORDER BY` are computed from a single sort:

~~~sql
SELECT id,
       ROW_NUMBER() OVER (ORDER BY id) AS rn,
       RANK()       OVER (ORDER BY id) AS rk,
       DENSE_RANK() OVER (ORDER BY id) AS dr
  FROM $planets;
~~~

## Aggregate Windows

~~~
SELECT aggregate_function(column) OVER (PARTITION BY column)
  FROM relation_name;
~~~

`SUM`, `COUNT`, and `AVG` are the same aggregates used with `GROUP BY`, applied per-partition without collapsing rows:

~~~sql
SELECT name, SUM(gravity) OVER (PARTITION BY id)
  FROM $planets;
~~~

Multiple window expressions can appear in the same query, and can be aliased:

~~~sql
SELECT name,
       SUM(gravity) OVER (PARTITION BY id),
       AVG(mass)    OVER (PARTITION BY id) AS avg_mass
  FROM $planets;
~~~

The partition key does not have to be unique — this counts satellites per planet, on every row:

~~~sql
SELECT name, COUNT(name) OVER (PARTITION BY planetId)
  FROM testdata.satellites;
~~~

> Be Aware: An `ORDER BY` inside the `OVER` clause of an **aggregate** window is rejected — `SUM(gravity) OVER (PARTITION BY id ORDER BY id)` raises `Window functions with ORDER BY are not supported. Use PARTITION BY only.` This is the opposite of the ranking functions above, where `ORDER BY` is required. Running totals and moving averages, which are what that syntax would express, are not available.

An aggregate window cannot be combined with `GROUP BY` in the same query:

~~~sql
SELECT id, SUM(gravity) OVER (PARTITION BY id)
  FROM $planets
 GROUP BY id;
-- rejected
~~~

## Notes

- Window functions are evaluated after `WHERE`, `GROUP BY`, and `HAVING`, but before the statement's own `ORDER BY`.
- Each row in the result retains its own values — rows are not collapsed as they are with plain aggregation.
- Multiple window expressions with different `PARTITION BY` columns can appear in the same `SELECT`.
- Frame specification (`ROWS BETWEEN`, `RANGE BETWEEN`) is not supported for either family.
- `LEAD`, `LAG`, `NTILE`, `FIRST_VALUE`, `LAST_VALUE`, and named `WINDOW` clauses are not implemented.

## Related

- [SQL Conformance](/docs/reference/sql/conformance) — how this compares to the standard
- [Aggregates](/docs/reference/sql/aggregates) — the same functions used with `GROUP BY`
- [GROUP BY](group-by)
