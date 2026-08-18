---
title: Window Functions — Opteryx Reference
description: SQL window functions in Opteryx — ranking functions (ROW_NUMBER, RANK, DENSE_RANK), navigation functions (LAG, LEAD) and aggregate windows (SUM, COUNT, MIN, MAX, MEDIAN and the rest of the aggregate catalog) with OVER, PARTITION BY and QUALIFY, and the rules each family follows.
---

# Window Functions

Window functions compute a value for each row based on a set of rows related to that row — its "window". Unlike aggregate functions, window functions do not collapse rows; each input row retains its identity in the result.

Opteryx supports three families of window function, and **they follow different rules**. Read the family you need rather than generalising from the others.

| Family | Functions | `ORDER BY` inside `OVER` |
|:--|:--|:--|
| [Ranking](#ranking-functions) | `ROW_NUMBER`, `RANK`, `DENSE_RANK` | **Required** |
| [Navigation](#navigation-functions) | `LAG`, `LEAD` | **Required** |
| [Aggregate](#aggregate-windows) | every aggregate in the [aggregate catalog](/docs/reference/sql/aggregates) | **Not supported** |

No family supports a frame specification (`ROWS BETWEEN`, `RANGE BETWEEN`).

Both families share a set of rules on **where** a window expression may appear. A window may sit inside a larger expression — `mass / SUM(mass) OVER ()` computes percent-of-total directly — but it may not appear inside an aggregate's argument or inside another window, and `SELECT *` cannot be combined with one. Read [Restrictions on Both Families](#restrictions-on-both-families) for the shapes that are refused and the remedies each refusal names.

## Syntax

~~~sql
SELECT <ranking_function>() OVER ( [ PARTITION BY <column> ] ORDER BY <column> [ ASC | DESC ] )
  FROM <relation_name>;

SELECT <navigation_function>(<column> [, <offset>]) OVER ( [ PARTITION BY <column> ] ORDER BY <column> [ ASC | DESC ] )
  FROM <relation_name>;

SELECT <aggregate_function>(<column>) OVER ( [ PARTITION BY <column> ] )
  FROM <relation_name>;
~~~

## Ranking Functions

~~~sql
SELECT <ranking_function>() OVER ( [ PARTITION BY <column> ] ORDER BY <column> [ ASC | DESC ] )
  FROM <relation_name>;
~~~

### Parameters

- **`<ranking_function>`**:
  - `ROW_NUMBER()` — 1..n within each partition, ties broken arbitrarily.
  - `RANK()` — ties share a rank, and the next rank skips (1, 1, 3).
  - `DENSE_RANK()` — ties share a rank, and the next rank does not skip (1, 1, 2).
- `PARTITION BY <column>` — optional. Without it, the whole relation is one window; with it,
  numbering restarts in each partition.
- `ORDER BY <column>` — **required** for ranking functions; without it the numbering would
  have no defined meaning, so Opteryx rejects the query rather than returning an arbitrary
  answer.

### Examples

#### ORDER BY Is Required
~~~sql
SELECT ROW_NUMBER() OVER (PARTITION BY id) FROM $planets;
-- ROW_NUMBER() requires an ORDER BY in its OVER (...) clause.
-- Add one, for example `OVER (ORDER BY column)`.
~~~

Empty parentheses are rejected for the same reason — `ROW_NUMBER() OVER ()` has no ordering, so there is nothing to number by. (`OVER ()` *is* meaningful for [aggregate windows](#the-whole-relation-as-one-window), where there is nothing to order.)

A ranking function without an `OVER` clause at all is rejected the same way — these functions are window-only.

#### PARTITION BY Is Optional
~~~sql
SELECT name, RANK() OVER (ORDER BY id) AS rk
  FROM $planets;
~~~

#### Numbering Restarts per Partition
~~~sql
SELECT planetId, ROW_NUMBER() OVER (PARTITION BY planetId ORDER BY id) AS rn
  FROM testdata.satellites;
~~~

#### Multiple Ranking Functions from One Sort
Several ranking functions sharing the same `PARTITION BY` and `ORDER BY` are computed from a single sort:

~~~sql
SELECT id,
       ROW_NUMBER() OVER (ORDER BY id) AS rn,
       RANK()       OVER (ORDER BY id) AS rk,
       DENSE_RANK() OVER (ORDER BY id) AS dr
  FROM $planets;
~~~

#### Ranking Over a Join
A ranking window may read from a join, a CTE or a derived table:

~~~sql
SELECT p.name, ROW_NUMBER() OVER (ORDER BY p.id) AS rn
  FROM $planets AS p
 INNER JOIN testdata.satellites AS s
    ON p.id = s.planetId;
~~~

This is **not** true of aggregate windows, which accept only a single relation — see [One Relation per Window](#one-relation-per-window).

## Navigation Functions

~~~sql
SELECT <navigation_function>(<column> [, <offset>]) OVER ( [ PARTITION BY <column> ] ORDER BY <column> [ ASC | DESC ] )
  FROM <relation_name>;
~~~

Navigation functions return a value from **another row** of the partition, in the window's `ORDER BY` order. The result's type is the argument's type — `LAG(name)` over a `VARCHAR` column is `VARCHAR`.

### Parameters

- **`<navigation_function>`**:
  - `LAG(expr)` — `expr`'s value from the previous row; `LAG(expr, offset)` from the row `offset` rows earlier.
  - `LEAD(expr)` — `expr`'s value from the next row; `LEAD(expr, offset)` from the row `offset` rows later.
- The offset must be a non-negative integer **literal**, and defaults to 1. Offset 0 is the current row.
- `PARTITION BY <column>` — optional. Navigation never crosses a partition edge: a row closer to the edge than the offset returns `NULL`.
- `ORDER BY <column>` — **required**, exactly as for the ranking functions.

### Examples

#### Previous and Next Row
~~~sql
SELECT name,
       LAG(name)  OVER (ORDER BY id) AS prev,
       LEAD(name) OVER (ORDER BY id) AS next
  FROM $planets;
-- Mercury's prev is NULL; Pluto's next is NULL
~~~

#### Per-Partition, with an Explicit Offset
~~~sql
SELECT name, LAG(id, 2) OVER (PARTITION BY planetId ORDER BY id) AS l2
  FROM testdata.satellites;
-- the first two rows of each partition carry NULL
~~~

#### The Argument May Be an Expression
~~~sql
SELECT name, LAG(mass * 2) OVER (ORDER BY id) AS prev_double_mass
  FROM $planets;
~~~

### Notes

- The 3-argument default form — `LAG(expr, offset, default)` — is **not supported**. Wrap the result instead: `COALESCE(LAG(expr, offset), default)`.
- `IGNORE NULLS` / `RESPECT NULLS` are not supported.
- Rows that tie on the `ORDER BY` key sit in an unspecified order, so over a non-total `ORDER BY` the neighbouring row — and therefore the answer — is not deterministic between runs. The same caveat as `ROW_NUMBER`, for the same reason.

## Aggregate Windows

~~~sql
SELECT <aggregate_function>(<column>) OVER ( [ PARTITION BY <column> ] )
  FROM <relation_name>;
~~~

### Which Aggregates Work

Rather than a short hand-maintained list, the answer is derivable from the engine's own aggregate
catalog. Every aggregate carries a `support` object — shown as the `Support:` line of its entry on
the [Aggregates](/docs/reference/sql/aggregates) page — and two of its flags are exactly the two
window forms:

| `support` flag | Window form it governs |
|:--|:--|
| `grouped` | `OVER (PARTITION BY <column>)` |
| `global` | `OVER ()` |

So an aggregate whose `Support:` line reads `global, grouped` works in both window forms; one that
reads only `grouped` works with `PARTITION BY` and is refused with `OVER ()`.

At present **every** aggregate Opteryx implements has `grouped: true`, so any of them may be used
with `PARTITION BY`:

`ANY_VALUE`, `APPROX_COUNT_DISTINCT`, `APPROX_PERCENTILE`, `ARRAY_AGG`, `AVG`, `CIDR_AGG`, `CORR`, `COUNT`, `COUNT_DISTINCT`, `MAX`, `MEDIAN`, `MIN`, `STDDEV`, `SUM`

Two of them — `ANY_VALUE` and `ARRAY_AGG` — have `global: false`, and are refused with `OVER ()`. See [ARRAY_AGG and ANY_VALUE Need a Partition](#array_agg-and-any_value-need-a-partition).

If this page and the catalog ever disagree, the catalog is right — it is generated from the engine's registrars. `make check-sql` fails when the two drift apart, so this list cannot silently go stale the way "SUM, COUNT, or AVG" did.

### Parameters

- **`<aggregate_function>`** — any aggregate from the catalog above, applied per-partition
  without collapsing rows. It is the same function, and the same result, you would get from
  `GROUP BY` — attached to every row instead of one row per group.
- `PARTITION BY <column>` — optional. The partition key does not have to be unique. Omitting it
  entirely (`OVER ()`) makes the whole relation one window.

### Examples

#### Basic Aggregate Window
~~~sql
SELECT name, SUM(gravity) OVER (PARTITION BY id)
  FROM $planets;
~~~

#### The Whole Relation as One Window
`OVER ()` — empty parentheses, no partition key — computes the aggregate across every surviving row and attaches it to all of them:

~~~sql
SELECT name, COUNT(*) OVER () AS c, AVG(mass) OVER () AS a
  FROM $planets;
-- every row carries c = 9 and a = 296.29184444444445
~~~

If no rows survive, there are no rows to attach the aggregate to, and the result is **zero rows** — not one row holding a zero or a `NULL`:

~~~sql
SELECT name, COUNT(*) OVER () AS c
  FROM $planets
 WHERE id > 99;
-- 0 rows
~~~

#### Multiple Window Expressions
Multiple window expressions can appear in the same query, can be aliased, and may use **different** partition keys:

~~~sql
SELECT name,
       COUNT(*)  OVER (PARTITION BY number_of_moons) AS a,
       SUM(mass) OVER (PARTITION BY id)              AS b
  FROM $planets;
~~~

#### Non-Unique Partition Key
The partition key does not have to be unique — this counts satellites per planet, on every row:

~~~sql
SELECT name, COUNT(name) OVER (PARTITION BY planetId)
  FROM testdata.satellites;
~~~

#### Over a CTE or Derived Table
The window's input may be a CTE or a derived table rather than a named relation:

~~~sql
WITH x AS (SELECT * FROM $planets)
SELECT name, COUNT(*) OVER (PARTITION BY number_of_moons) AS c
  FROM x;

SELECT name, COUNT(*) OVER (PARTITION BY number_of_moons) AS c
  FROM (SELECT * FROM $planets) AS s;
~~~

A CTE is one relation however many tables its body joins, so this is also the way to run an aggregate window over joined data:

~~~sql
WITH x AS (
  SELECT p.name, s.planetId
    FROM $planets AS p
   INNER JOIN testdata.satellites AS s
      ON p.id = s.planetId
)
SELECT name, COUNT(*) OVER (PARTITION BY planetId) AS c
  FROM x;
~~~

### Notes

- An `ORDER BY` inside the `OVER` clause of an **aggregate** window is rejected —
  `SUM(gravity) OVER (PARTITION BY id ORDER BY id)` raises `Window functions with ORDER BY
  are not supported. Use PARTITION BY only.` This is the opposite of the ranking functions
  above, where `ORDER BY` is required. Running totals and moving averages, which are what
  that syntax would express, are not available.
- An aggregate window cannot be combined with `GROUP BY` in the same query:

  ~~~sql
  SELECT id, SUM(gravity) OVER (PARTITION BY id)
    FROM $planets
   GROUP BY id;
  -- Window functions cannot be combined with GROUP BY.
  ~~~

- **Row order is not preserved.** An aggregate window with `PARTITION BY` returns rows grouped by
  partition, in an order that is not stable between runs of the same query. Add the statement's
  own `ORDER BY` if you need a defined order.

#### ARRAY_AGG and ANY_VALUE Need a Partition

`ARRAY_AGG` and `ANY_VALUE` work with `OVER (PARTITION BY ...)` but are refused with `OVER ()`:

~~~sql
SELECT name, ARRAY_AGG(mass) OVER (PARTITION BY number_of_moons) AS s
  FROM $planets;                                          -- works

SELECT name, ARRAY_AGG(mass) OVER () AS s
  FROM $planets;
-- ARRAY_AGG requires a GROUP BY clause, and cannot GROUP BY a literal value.
~~~

This is consistent with the rest of the engine rather than a window-specific quirk: plain
`SELECT ARRAY_AGG(mass) FROM $planets` is refused with exactly the same message, and `OVER ()`
lowers to that same ungrouped aggregate. It is the `support.global: false` flag in the catalog,
showing through.

#### One Relation per Window

An aggregate window reads from exactly one relation. Two relations directly beneath it — a join, or a `CROSS JOIN` against a `VALUES` list — are refused:

~~~sql
SELECT p.name, COUNT(*) OVER (PARTITION BY p.id) AS c
  FROM $planets AS p
 INNER JOIN testdata.satellites AS s
    ON p.id = s.planetId;
-- Window functions over multiple joined tables are not yet supported.
-- Compute the window in a subquery over a single relation, then join to that result.
~~~

Wrapping the join in a CTE or derived table satisfies the rule, because the window then sees one
relation — see [Over a CTE or Derived Table](#over-a-cte-or-derived-table). The window's input
must also be a real relation: an inline `VALUES` list is rejected with `Window functions require
a base table`.

Ranking functions do not have this restriction.

## Restrictions on Both Families

These apply to ranking functions and aggregate windows alike.

### A Window May Sit Inside a Larger Expression

A window function does not have to be the whole projection column — it may be one operand of a larger expression, an argument to a function, or the target of a cast, and both families may:

~~~sql
SELECT name, mass / SUM(mass) OVER () AS pct FROM $planets;             -- percent-of-total
SELECT name, ROW_NUMBER() OVER (ORDER BY id) + 1 AS rn FROM $planets;
SELECT CAST(COUNT(*) OVER () AS VARCHAR) FROM $planets;
~~~

The window is computed first and the rest of the expression is evaluated over its output, one row at a time, so the nested form answers exactly what the un-nested one does. Base columns may be named in the same expression (`mass / SUM(mass) OVER ()`), and several windows may appear in one expression, over the same spec or different ones. Placement is the `SELECT` list or `QUALIFY`.

Two enclosing contexts remain refused, each with its own remedy:

- **Inside an aggregate's argument** — `SUM(COUNT(*) OVER ())`, `MAX(ROW_NUMBER() OVER (ORDER BY id))`, or with the window only part of the argument (`SUM(mass + COUNT(*) OVER ())`). Standard SQL forbids it outright. Compute the **window** in a subquery, then aggregate its result:

  ~~~sql
  SELECT SUM(x) FROM (SELECT COUNT(*) OVER () AS x FROM $planets) AS t;
  ~~~

- **Inside another window** — whether in its argument (`SUM(COUNT(*) OVER ()) OVER ()`) or in its `OVER` spec (`SUM(mass) OVER (PARTITION BY COUNT(*) OVER ())`). Chain the windows across a subquery boundary instead — every combination of the two families runs this way, and nests further than one level deep:

  ~~~sql
  SELECT SUM(r) OVER () FROM (SELECT ROW_NUMBER() OVER (ORDER BY id) AS r FROM $planets) AS t;
  ~~~

### SELECT * Cannot Be Combined with a Window

~~~sql
SELECT *, COUNT(*) OVER () AS c FROM $planets;
-- `SELECT *` cannot coexist with additional columns. List the columns you want
-- explicitly, or use `SELECT *` on its own.
~~~

This is a blanket Opteryx rule and not window-specific — `SELECT *, id + 1 FROM $planets` fails identically. It does differ from standard SQL, DuckDB and PostgreSQL, all of which allow it.

The **qualified** wildcard is the escape hatch, and is the form to reach for here:

~~~sql
SELECT p.*, COUNT(*) OVER () AS c
  FROM $planets AS p;
-- 21 columns: the 20 from $planets, plus c
~~~

### Unaliased Windows Are Named for Their Expression

A window function with no alias is named for the expression it renders to:

~~~sql
SELECT name, COUNT(*) OVER () FROM $planets;
-- columns: name, "COUNT(*) OVER ()"
~~~

A consequence worth planning around: two unaliased windows that render to the same text are two columns with one name, and the query is rejected as ambiguous — exactly as a repeated unaliased expression would be.

~~~sql
SELECT name, COUNT(*) OVER (), COUNT(*) OVER () FROM $planets;
-- AmbiguousIdentifierError: Query result contains multiple instances of the
-- same column(s) - `COUNT(*) OVER ()`
~~~

Alias them, and the ambiguity goes away.

## Filtering on a Window

`WHERE` runs before the window is computed, so it cannot filter on a window function's output — a window function in a `WHERE` clause fails with an internal error rather than a diagnosable one. [QUALIFY](qualify) is the clause that can; it is to window functions what `HAVING` is to `GROUP BY`:

~~~sql
SELECT name FROM $planets QUALIFY COUNT(*) OVER () > 5;

SELECT name FROM $planets QUALIFY ROW_NUMBER() OVER (ORDER BY id) <= 3;
~~~

Every restriction on this page applies to a window inside a `QUALIFY` as well. See [QUALIFY](qualify) for its own rules — chiefly that the condition must contain a window function, and that a `SELECT` alias for one is not accepted.

## Notes

- Window functions are evaluated after `WHERE`, `GROUP BY`, and `HAVING`, but before the statement's own `ORDER BY`. A filtered-out row does not contribute to the window: `SELECT name, COUNT(*) OVER () AS c FROM $planets WHERE id > 6` returns 3 rows, each with `c = 3`.
- Each row in the result retains its own values — rows are not collapsed as they are with plain aggregation.
- Multiple window expressions with different `PARTITION BY` columns can appear in the same `SELECT`.
- Frame specification (`ROWS BETWEEN`, `RANGE BETWEEN`) is not supported for either family.
- `NTILE`, `FIRST_VALUE`, `LAST_VALUE`, `NTH_VALUE`, and named `WINDOW` clauses are not implemented.

## See Also

- [SQL Conformance](/docs/reference/sql/conformance) — how this compares to the standard
- [Aggregates](/docs/reference/sql/aggregates) — the same functions used with `GROUP BY`, and the `support` flags this page derives its list from
- [QUALIFY](qualify) — filtering on a window function's result
- [GROUP BY](group-by)
- [HAVING](having)
- [SELECT](select)
- [ORDER BY](order-by)
