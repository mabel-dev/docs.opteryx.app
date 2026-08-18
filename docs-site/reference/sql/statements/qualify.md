---
title: QUALIFY Clause — Opteryx Reference
description: SQL QUALIFY clause syntax and examples for filtering on the result of a window function in Opteryx — top-N, first-row-per-partition, and how it differs from WHERE and HAVING.
---

# QUALIFY

The `QUALIFY` clause filters rows on the result of a **window function**. It is to [window functions](window-functions) what [HAVING](having) is to `GROUP BY`: the window is computed first, and `QUALIFY` then decides which rows survive.

It exists because neither of the other filtering clauses can do this. [WHERE](where) runs *before* the window is computed, so the value is not available to it; `HAVING` filters a grouped result, and window functions cannot be combined with `GROUP BY` at all.

## Syntax

~~~sql
SELECT <column> [, ...]
  FROM <relation_name>
 [ WHERE <condition> ]
 QUALIFY <window_condition>
 [ ORDER BY <column> ]
 [ LIMIT <count> ];
~~~

`QUALIFY` sits after `WHERE` and before `ORDER BY` — matching the order the clauses actually execute in.

## Parameters

- **`<window_condition>`** — a boolean expression that **must contain at least one window
  function**. The window function may be a ranking function or an aggregate window, and need
  not appear in the `SELECT` list. Plain columns may be combined into the condition with
  `AND`, `OR` and `NOT`, but cannot make up the whole of it.

## Examples

### Top N Rows
~~~sql
SELECT name
  FROM $planets
 QUALIFY ROW_NUMBER() OVER (ORDER BY id) <= 3;
-- Mercury, Venus, Earth
~~~

The ordering column does not have to be selected:

~~~sql
SELECT name
  FROM $planets
 QUALIFY RANK() OVER (ORDER BY mass DESC) <= 3;
-- Jupiter, Saturn, Neptune
~~~

### First Row per Partition
The idiom `QUALIFY` is most often reached for — one row per group, chosen by an ordering, without a self-join or a subquery:

~~~sql
SELECT name, planetId
  FROM testdata.satellites
 QUALIFY ROW_NUMBER() OVER (PARTITION BY planetId ORDER BY id) = 1;
-- the first satellite of each planet: Moon, Phobos, Io, Mimas, ...
~~~

### Filtering on an Aggregate Window
Keep only rows whose partition has more than one member:

~~~sql
SELECT name, number_of_moons
  FROM $planets
 QUALIFY COUNT(*) OVER (PARTITION BY number_of_moons) > 1;
-- Mercury and Venus, the two planets with 0 moons
~~~

### Combined with WHERE
`WHERE` filters rows before the window is computed, so the window sees only the surviving rows. The two clauses compose:

~~~sql
SELECT name
  FROM $planets
 WHERE id > 3
 QUALIFY ROW_NUMBER() OVER (ORDER BY id) <= 2;
-- Mars, Jupiter — the numbering restarts over the filtered rows
~~~

### Combining Conditions
A plain column condition can be part of the `QUALIFY` expression, as long as a window function is in there too:

~~~sql
SELECT name
  FROM $planets
 QUALIFY ROW_NUMBER() OVER (ORDER BY id) <= 5
     AND id > 2;

SELECT name
  FROM $planets
 QUALIFY ROW_NUMBER() OVER (ORDER BY id) <= 2
      OR ROW_NUMBER() OVER (ORDER BY id) >= 8;
~~~

Prefer `WHERE` for the plain part where you can — it filters earlier, and it changes what the window sees.

### Over a CTE
~~~sql
WITH x AS (SELECT * FROM $planets)
SELECT name
  FROM x
 QUALIFY ROW_NUMBER() OVER (ORDER BY id) <= 2;
~~~

## Notes

- **The condition must contain a window function.** A `QUALIFY` that does not is rejected:

  ~~~sql
  SELECT name FROM $planets QUALIFY id > 5;
  -- QUALIFY filters on a window function, but this one contains none. Use WHERE to
  -- filter on plain columns, or HAVING to filter a grouped result.
  ~~~

- **A `SELECT` alias is not accepted**, even though [HAVING](having) accepts one. The window
  function has to be written out again in the `QUALIFY` condition:

  ~~~sql
  SELECT name, COUNT(*) OVER (PARTITION BY number_of_moons) AS c
    FROM $planets
   QUALIFY c > 1;                                              -- rejected

  SELECT name, COUNT(*) OVER (PARTITION BY number_of_moons) AS c
    FROM $planets
   QUALIFY COUNT(*) OVER (PARTITION BY number_of_moons) > 1;   -- works
  ~~~

- **Every window function restriction applies here too.** The window inside a `QUALIFY` is an
  ordinary window function and carries all of its rules — `ORDER BY` is required for ranking
  functions and rejected for aggregate windows, `GROUP BY` cannot be present anywhere in the
  query, an aggregate window reads from exactly one relation, and `ARRAY_AGG` and `ANY_VALUE`
  cannot be used with `OVER ()`. See [Window Functions](window-functions).

- **Use a qualified wildcard, not `SELECT *`.** `SELECT * ... QUALIFY <window>` runs, but leaks
  the window's internal working column (a `$win_…` name) into the result. `SELECT <alias>.*`
  returns only the relation's own columns:

  ~~~sql
  SELECT * FROM $planets QUALIFY ROW_NUMBER() OVER (ORDER BY id) <= 2;
  -- 21 columns: the 20 from $planets, plus a stray `$win_…`

  SELECT p.* FROM $planets AS p QUALIFY ROW_NUMBER() OVER (ORDER BY p.id) <= 2;
  -- 20 columns, as expected
  ~~~

- `QUALIFY` runs after the window and before `ORDER BY` and `LIMIT`, so a `LIMIT` applies to the
  rows `QUALIFY` kept.

## See Also

- [Window Functions](window-functions) — the functions `QUALIFY` filters on, and their rules
- [HAVING](having) — the equivalent for `GROUP BY`
- [WHERE](where) — filtering before the window is computed
- [SELECT](select)
- [ORDER BY](order-by)
