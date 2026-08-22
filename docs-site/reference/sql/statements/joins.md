---
title: SQL Joins - Inner, Outer, and Cross Joins in Opteryx
description: Master SQL joins in Opteryx. Learn INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, and CROSS JOIN with practical examples.
---

# Joins

Joins allow you to combine data from multiple relations (tables or datasets) into a single result set. Different join types provide different ways to combine data, each suited to specific use cases.

| Join Type | Purpose |
|-----------|---------|
| [`CROSS JOIN`](#cross-join) | Cartesian product of two relations |
| [`CROSS JOIN UNNEST`](#cross-join-unnest) | Expand an array or CIDR block into rows |
| [`INNER JOIN`](#inner-join) | Rows matching in both relations |
| [`NATURAL JOIN`](#natural-join) | Inner join with implicit, name-matched conditions |
| [`LEFT JOIN`](#left-join) | All rows from the left relation, matched where possible |
| [`RIGHT JOIN`](#right-join) | All rows from the right relation, matched where possible |
| [`FULL JOIN`](#full-join) | All rows from both relations |
| [`LEFT SEMI JOIN`](#left-semi-join) | Left rows with a match, left columns only |
| [`LEFT ANTI JOIN`](#left-anti-join) | Left rows without a match |
| [`ASOF JOIN`](#asof-join) | Nearest match by inequality, for time-series-style data |

`RIGHT SEMI JOIN` and `RIGHT ANTI JOIN` are not supported — see [LEFT SEMI JOIN](#left-semi-join) and [LEFT ANTI JOIN](#left-anti-join) for the equivalent, relations swapped.

## Syntax

~~~sql
FROM <left_relation> CROSS JOIN <right_relation>

FROM <relation> CROSS JOIN { UNNEST(<array_expr>) | CIDR_UNNEST(<cidr_expr>) } AS <alias>

FROM <left_relation> [ INNER ] JOIN <right_relation> { ON <condition> | USING (<column>) }

FROM <left_relation> NATURAL JOIN <right_relation>

FROM <left_relation> LEFT [ OUTER ] JOIN <right_relation> ON <condition>

FROM <left_relation> RIGHT [ OUTER ] JOIN <right_relation> ON <condition>

FROM <left_relation> FULL [ OUTER ] JOIN <right_relation> ON <condition>

FROM <left_relation> LEFT SEMI JOIN <right_relation> ON <condition>

FROM <left_relation> LEFT ANTI JOIN <right_relation> ON <condition>

FROM <left_relation> ASOF JOIN <right_relation> MATCH_CONDITION( <condition> )
~~~

## CROSS JOIN

~~~sql
FROM <left_relation> CROSS JOIN <right_relation>
~~~

A `CROSS JOIN` returns the Cartesian product (all possible combinations) of two relations. Each row from the left relation is paired with every row from the right relation.

An alternate form omits the keyword and uses comma-separated relations in the `FROM` clause — however, it is recommended to use the explicit `CROSS JOIN` syntax for clarity and to avoid confusion:

~~~sql
FROM <left_relation>, <right_relation>
~~~

### Examples

#### Cartesian Product
~~~sql
SELECT *
  FROM left_relation
 CROSS JOIN right_relation;
~~~

![CROSS JOIN](/images/cross-join.svg)

### Notes

> **USE SPARINGLY**   
> The size of the result set from a `CROSS JOIN` is the product of the row counts of the two input datasets (2 × 3 = 6 in the pictorial example). This can easily result in extremely large datasets. When an alternative join approach is available, it will almost always perform better than a `CROSS JOIN`.

> **SPECIAL CASE**  
> `CROSS JOIN UNNEST` and `CROSS JOIN CIDR_UNNEST` join against an expansion of each row's own value rather than against another relation — see [CROSS JOIN UNNEST](#cross-join-unnest) below.

## CROSS JOIN UNNEST

~~~sql
FROM <relation> CROSS JOIN { UNNEST(<array_expr>) | CIDR_UNNEST(<cidr_expr>) } AS <alias>
~~~

A `CROSS JOIN` against an **expansion function** instead of a relation. Each input row is paired with the rows produced from that row's own value, so one input row becomes many. A row whose value expands to nothing — a `NULL` or an empty array — contributes no output rows at all, so the result can be smaller than the input.

Unlike a plain `CROSS JOIN`, the result size is not the product of two relations; it is the sum, over input rows, of what each row expands to.

Only `CROSS JOIN` is supported for these forms — there is nothing to write an `ON` condition against.

### Parameters

- **`UNNEST(<array_expr>)`** — expand an array column or literal into one row per element.
- **`CIDR_UNNEST(<cidr_expr>)`** — expand a CIDR block into one row per address it covers.
- **`AS <alias>`** — required, because the produced column has no name of its own.

### Examples

#### UNNEST — Expand an Array
Each element of the array becomes a row, and the produced column takes the array's element type:

~~~sql
SELECT name, mission
  FROM testdata.astronauts
 CROSS JOIN UNNEST(missions) AS mission;
~~~

A literal array works the same way:

~~~sql
SELECT a
  FROM (SELECT 1) AS t
 CROSS JOIN UNNEST(('x', 'y', 'z')) AS a;
-- three rows: x, y, z
~~~

#### CIDR_UNNEST — Expand a CIDR Block
Each address covered by the block becomes a row, and the produced column is [`IPV4`](/docs/reference/sql/types/ipv4):

~~~sql
SELECT ip
  FROM (SELECT 1) AS t
 CROSS JOIN CIDR_UNNEST('10.0.0.0/30') AS ip;
-- four rows: 10.0.0.0, 10.0.0.1, 10.0.0.2, 10.0.0.3
~~~

Because the produced column is a real `IPV4` it composes with the IP operators, ordering, joins, and `CIDR_AGG`. Expanding an allowlist so it can be joined against traffic:

~~~sql
SELECT l.*
  FROM network_logs AS l
 INNER JOIN (
         SELECT ip
           FROM allowlist AS a
          CROSS JOIN CIDR_UNNEST(a.block) AS ip
       ) AS allowed
    ON l.ip_address::IPV4 = allowed.ip;
~~~

### Notes

- Expansion is **streamed**, so memory does not grow with the prefix length — but the row count does. A `/16` is 65,536 rows, a `/8` is 16,777,216, and a `/0` is 4,294,967,296. There is no minimum prefix length; bound the result with a `WHERE` clause or `LIMIT` when exploring.
- Block parsing is strict: shorthand forms and leading zeros raise rather than being reinterpreted, because an access list and a parser disagreeing about what `010.1` means is a known source of security bugs. A `NULL` block contributes no rows.
- See [Working with IPs](/docs/reference/sql/advanced/adv-working-with-ips) for the full IPv4 surface, including `CIDR_AGG`, which is the inverse of this.

## INNER JOIN

~~~sql
FROM <left_relation> [ INNER ] JOIN <right_relation> { ON <condition> | USING (<column>) }
~~~

An `INNER JOIN` returns only the rows from both relations where the values in the joining columns match. It's the most commonly used join type due to its straightforward and predictable behavior.

You can specify an `INNER JOIN` using the full `INNER JOIN` keyword or the shorter `JOIN` keyword. You can define the joining condition using either the `ON` clause or the `USING (column)` syntax.

### Parameters

- `ON <condition>` — an arbitrary join condition, typically an equality between columns from
  each relation. Retains all columns from both relations in the result.
- `USING (<column>)` — shorthand for joining on identically-named columns. Keeps only a single
  instance of the columns specified, which are not considered members of either the left or
  right relation.

### Examples

#### Match Rows on a Condition
~~~sql
SELECT *
  FROM left_relation
 INNER JOIN right_relation
    ON left_relation.column_name = right_relation.column_name;
~~~

![INNER JOIN](/images/inner-join.svg)

In this example, the blue column is used as the joining column in both relations. Only the value `1` appears in both relations, so the result set contains the combination of rows with `1` from both _left_relation_ and _right_relation_.

### Notes

- `INNER JOIN ... ON` retains all columns from both relations in the result.
- `INNER JOIN ... USING` keeps only a single instance of the columns specified in the `USING` clause. These shared columns are not considered members of either the left or right relation.

## NATURAL JOIN

~~~sql
FROM <left_relation> NATURAL JOIN <right_relation>
~~~

A `NATURAL JOIN` performs a join similar to an `INNER JOIN` where the join conditions are automatically determined. It creates equality conditions between all columns with matching names in both relations.

For these reasons below, `NATURAL JOIN` is not recommended in production systems. An explicit `INNER JOIN ... ON` or `INNER JOIN ... USING` makes the join conditions visible and safe.

### Notes

- **Schema changes silently break queries.** If a new column is added to either relation with the same name as a column in the other, it will be picked up as a join condition without any warning. Queries that previously returned correct results may return wrong results or no results at all.
- **Join columns are implicit.** There is no way to tell from the query itself which columns are being used to join — you must inspect the schemas of both relations. This makes queries harder to read, review, and debug.
- **Accidental matches are easy.** Common column names like `id`, `name`, or `created_at` will be joined on automatically, even if they refer to unrelated concepts in each relation.
- **Special behavior:** Performing a self `NATURAL JOIN` (using the same relation for both left and right sides) effectively filters out rows containing `null` values in any column. This can be used as a concise way to remove incomplete rows from a dataset, though an explicit `WHERE` clause is usually clearer.

## LEFT JOIN

~~~sql
FROM <left_relation> LEFT [ OUTER ] JOIN <right_relation> ON <condition>
~~~

A `LEFT JOIN` returns all rows from the left relation. For rows with matching values in the right relation, the corresponding right relation columns are included. For rows without a match, the right relation columns are filled with `null` values. The `OUTER` keyword is optional and does not change behaviour.

### Examples

#### Keep All Left Rows
~~~sql
SELECT *
  FROM left_relation
  LEFT JOIN right_relation
    ON left_relation.column_name = right_relation.column_name;
~~~

![LEFT JOIN](/images/left-join.svg)

In this example, the blue column is used as the joining column in both relations. _left_relation_ contains values `1` and `2`; _right_relation_ contains values `1` and `3`. Only value `1` appears in both, so that row is returned with columns from both relations. The row with value `2` has no match in _right_relation_, so it is still included but the right relation columns are filled with `null`.

## RIGHT JOIN

~~~sql
FROM <left_relation> RIGHT [ OUTER ] JOIN <right_relation> ON <condition>
~~~

A `RIGHT JOIN` is functionally equivalent to a `LEFT JOIN` with the left and right relations swapped. It returns all rows from the right relation, with matching left relation data where available, and `null` values for non-matching rows.

## FULL JOIN

~~~sql
FROM <left_relation> FULL [ OUTER ] JOIN <right_relation> ON <condition>
~~~

The `FULL JOIN` (also called `FULL OUTER JOIN`) returns all rows from both the left and right relations. Where rows have matching values in the joining column, they are aligned in the result. For non-matching rows from either side, the columns from the other relation are filled with `null` values.

### Examples

#### Keep All Rows from Both Sides
~~~sql
SELECT *
  FROM left_relation
  FULL OUTER JOIN right_relation
    ON left_relation.column_name = right_relation.column_name;
~~~

![FULL JOIN](/images/full-join.svg)

In this example, the blue column is used as the joining column in both relations. _left_relation_ contains values `1` and `2`; _right_relation_ contains values `1` and `3`. Value `1` appears in both and the rows are aligned. Value `2` exists only in _left_relation_ and value `3` exists only in _right_relation_ — both are included in the result, with `null` filling the columns from the absent side.

## LEFT SEMI JOIN

~~~sql
FROM <left_relation> LEFT SEMI JOIN <right_relation> ON <condition>
~~~

A `LEFT SEMI JOIN` returns rows from the left relation that have at least one matching row in the right relation, but includes only columns from the left relation. This is useful when you want to filter the left relation based on the existence of a match in the right relation, without including any columns from the right relation in the result.

### Examples

#### Filter Left Rows by Existence of a Match
~~~sql
SELECT *
  FROM left_relation
  LEFT SEMI JOIN right_relation
    ON left_relation.column_name = right_relation.column_name;
~~~

![LEFT SEMI JOIN](/images/left-semi-join.svg)

In this example, the blue column is used as the joining column in both relations. _left_relation_ contains values `1` and `2`; _right_relation_ contains values `1` and `3`. Only value `1` has a match in _right_relation_, so only that row from _left_relation_ is returned. Value `2` has no match and is excluded. No columns from _right_relation_ appear in the result.

### RIGHT SEMI JOIN

Opteryx does not support `RIGHT SEMI JOIN`. Use a `LEFT SEMI JOIN` with the relations swapped to achieve the same result.

## LEFT ANTI JOIN

~~~sql
FROM <left_relation> LEFT ANTI JOIN <right_relation> ON <condition>
~~~

The `LEFT ANTI JOIN` returns rows from the left relation that do **not** have matching rows in the right relation. Only columns from the left relation are included in the result; the right relation serves only to filter out matching rows.

### Examples

#### Filter Out Left Rows with a Match
~~~sql
SELECT *
  FROM left_relation
  LEFT ANTI JOIN right_relation
    ON left_relation.column_name = right_relation.column_name;
~~~

![LEFT ANTI JOIN](/images/left-anti-join.svg)

In this example, the blue column is used as the joining column in both relations. _left_relation_ contains values `1` and `2`; _right_relation_ contains values `1` and `3`. Value `1` has a match in _right_relation_ and is therefore excluded. Value `2` has no match, so it is the only row returned. No columns from _right_relation_ appear in the result.

### RIGHT ANTI JOIN

Opteryx does not support `RIGHT ANTI JOIN`. Use a `LEFT ANTI JOIN` with the relations swapped to achieve the same result.

## ASOF JOIN

~~~sql
FROM <left_relation> ASOF JOIN <right_relation> MATCH_CONDITION( <condition> )
~~~

An `ASOF JOIN` matches each row from the left relation to the closest row in the right relation based on an inequality condition. It is useful for aligning time-series or ordered data where exact matches are rarely available — for example, joining events to the most recent price or state that was valid at the time of the event.

### Parameters

- **`MATCH_CONDITION( <condition> )`** — used instead of `ON`. The condition must be a single
  inequality comparing one column from each relation. `>`, `>=`, `<` and `<=` are supported;
  equality (`=`) and not-equal (`!=`) are not.

Both sides of the condition must be plain columns carried by their relation — an expression
(`e.ts >= p.ts + INTERVAL '1' MINUTE`) or a constant is not supported. Compute the value in a
subquery first if the match needs an offset.

`ASOF JOIN` keeps every row from the left relation. Where no right row satisfies the condition —
including where the left value is `NULL` — the right columns are null-extended, as they would be
in a `LEFT JOIN`. `LEFT ASOF JOIN` is not accepted as syntax; the join is already outer in this
sense.

Where several right rows tie on the match column, one of them is chosen arbitrarily. If ties
matter, deduplicate the right relation in a subquery before joining.

### No partitioning key

`ASOF JOIN` has no `PARTITION BY`, and `ON` or `USING` cannot be combined with
`MATCH_CONDITION`. The nearest match is taken across the whole right relation, so a per-key
series — per symbol, per device, per tenant — needs both sides filtered to one key first:

~~~sql
SELECT e.event_time, p.price
  FROM (SELECT * FROM events WHERE symbol = 'AAA') AS e
  ASOF JOIN (SELECT * FROM prices WHERE symbol = 'AAA') AS p
    MATCH_CONDITION(e.event_time >= p.priced_at);
~~~

Joining first and filtering with `WHERE e.symbol = p.symbol` afterwards does **not** give the same
answer. The nearest match is chosen ignoring the key, so a left row whose nearest match belongs to
another key is discarded by the filter rather than matched against its own series.

### Examples

#### Match the Closest Prior Row
~~~sql
SELECT p.name, p2.name AS match_name
  FROM $planets AS p
  ASOF JOIN $planets AS p2
    MATCH_CONDITION(p.gravity >= p2.gravity);
~~~

#### Value in Effect at the Time of an Event
The typical time-series shape — each event carries the most recent price at or before it, and an
event earlier than every price row returns `NULL`:

~~~sql
SELECT e.event_time, e.symbol, p.price
  FROM events AS e
  ASOF JOIN prices AS p
    MATCH_CONDITION(e.event_time >= p.priced_at);
~~~

Use `>` instead of `>=` to exclude an exactly-equal timestamp, or `<=` / `<` to match forward in
time — the next price rather than the last one.

#### Right Relation as a Subquery
The right relation can be a subquery:

~~~sql
SELECT p.name, p2.name AS match_name
  FROM $planets AS p
  ASOF JOIN (
    SELECT id, name FROM $planets WHERE id >= 5
  ) AS p2
    MATCH_CONDITION(p.id >= p2.id);
~~~

## Notes

- Opteryx does not support `RIGHT SEMI JOIN` or `RIGHT ANTI JOIN`; swap the relations and use `LEFT SEMI JOIN` / `LEFT ANTI JOIN` instead.
- `ON` and `USING` are supported for equality-style joins; `ASOF JOIN` uses `MATCH_CONDITION(...)` instead of `ON`.
- `CROSS JOIN UNNEST` and `CROSS JOIN CIDR_UNNEST` join against an expansion of each row's own value, not against a second relation — see [CROSS JOIN UNNEST](#cross-join-unnest).

## See Also

- [Working with Timestamps](/docs/reference/sql/advanced/adv-working-with-timestamps)
- [SELECT](select)
- [WHERE](where)
- [WITH (CTE)](with)
- [UNION, INTERSECT, and EXCEPT](union)
- [Working with IPs](/docs/reference/sql/advanced/adv-working-with-ips)
