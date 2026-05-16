---
title: Window Functions — Opteryx Reference
description: SQL window functions with OVER and PARTITION BY syntax and examples in Opteryx
---

# Window Functions

Window functions compute a value for each row based on a set of rows related to that row — its "window". Unlike aggregate functions, window functions do not collapse rows; each input row retains its identity in the result.

## Syntax

~~~
SELECT expression, aggregate_function(column) OVER (PARTITION BY column [ORDER BY column])
  FROM relation_name;
~~~

## Supported Functions

Currently supported window functions are `SUM`, `COUNT`, and `AVG`. These are the same aggregate functions used with `GROUP BY`, but applied per-partition without collapsing rows.

## PARTITION BY

`PARTITION BY` divides rows into groups. The window function is computed independently within each group.

~~~sql
SELECT name, SUM(gravity) OVER (PARTITION BY id)
  FROM $planets;
~~~

Multiple window expressions can appear in the same query:

~~~sql
SELECT name,
       SUM(gravity) OVER (PARTITION BY id),
       AVG(mass)    OVER (PARTITION BY id)
  FROM $planets;
~~~

Window expressions can be aliased:

~~~sql
SELECT name, COUNT(id) OVER (PARTITION BY id) AS cnt
  FROM $planets;
~~~

## ORDER BY inside OVER

An `ORDER BY` clause inside the `OVER` clause controls the order in which rows are processed within each partition:

~~~sql
SELECT id, SUM(gravity) OVER (PARTITION BY id ORDER BY id)
  FROM $planets;
~~~

## With GROUP BY

Window functions can be combined with `GROUP BY`:

~~~sql
SELECT id, SUM(gravity) OVER (PARTITION BY id)
  FROM $planets
 GROUP BY id;
~~~

## Notes

- Window functions are evaluated after `WHERE`, `GROUP BY`, and `HAVING`, but before `ORDER BY`.
- Each row in the result retains its own values — rows are not collapsed as they are with plain aggregation.
- Multiple window expressions with different `PARTITION BY` columns can appear in the same `SELECT`.
- Frame specification (`ROWS BETWEEN`, `RANGE BETWEEN`) is not currently supported.
- `OVER()` without a `PARTITION BY` clause is not currently supported.
