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

<figure class="doc-figure">
<svg viewBox="0 0 680 282" width="100%" role="img" aria-labelledby="cross-join-title cross-join-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="cross-join-title">CROSS JOIN of left_relation and right_relation</title>
<desc id="cross-join-desc">left_relation has rows (1, red) and (2, blue); right_relation has rows (1, circle), (3, square) and (4, triangle), joined on id. Arrows run from each source row to the result rows it supplies values to; rows that supply nothing are faded. The CROSS JOIN pairs every left row with every right row, giving six rows: red with circle, square and triangle, then blue with each.</desc>
<text x="0" y="21" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">left_relation</text>
<rect x="0" y="30" width="156" height="82" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M0.5 56 V 36.0 Q 0.5 30.5 6.0 30.5 H 43.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="10" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M44.5 56 V 30.5 H 150.0 Q 155.5 30.5 155.5 36.0 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="54" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">colour</text>
<line x1="0" y1="56" x2="156" y2="56" style="stroke: var(--border-2);"/>
<g><text x="10" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="54" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">red</text></g>
<line x1="0" y1="84" x2="156" y2="84" style="stroke: var(--border);"/>
<g><text x="10" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">2</text><text x="54" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">blue</text></g>
<text x="0" y="157" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">right_relation</text>
<rect x="0" y="166" width="156" height="110" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M0.5 192 V 172.0 Q 0.5 166.5 6.0 166.5 H 43.5 V 192 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="10" y="183" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M44.5 192 V 166.5 H 150.0 Q 155.5 166.5 155.5 172.0 V 192 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="54" y="183" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">shape</text>
<line x1="0" y1="192" x2="156" y2="192" style="stroke: var(--border-2);"/>
<g><text x="10" y="210" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="54" y="210" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">circle</text></g>
<line x1="0" y1="220" x2="156" y2="220" style="stroke: var(--border);"/>
<g><text x="10" y="238" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">3</text><text x="54" y="238" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">square</text></g>
<line x1="0" y1="248" x2="156" y2="248" style="stroke: var(--border);"/>
<g><text x="10" y="266" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4</text><text x="54" y="266" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">triangle</text></g>
<text x="404" y="21" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">CROSS JOIN</text>
<rect x="404" y="30" width="240" height="194" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M404.5 56 V 36.0 Q 404.5 30.5 410.0 30.5 H 443.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="414" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M444.5 56 V 30.5 H 517.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="454" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">colour</text>
<path d="M518.5 56 V 30.5 H 557.5 V 56 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="528" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M558.5 56 V 30.5 H 638.0 Q 643.5 30.5 643.5 36.0 V 56 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="568" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">shape</text>
<line x1="404" y1="56" x2="644" y2="56" style="stroke: var(--border-2);"/>
<line x1="518" y1="30" x2="518" y2="224" style="stroke: var(--border-2);"/>
<g><text x="414" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="454" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">red</text><text x="528" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="568" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">circle</text></g>
<line x1="404" y1="84" x2="644" y2="84" style="stroke: var(--border);"/>
<g><text x="414" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="454" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">red</text><text x="528" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">3</text><text x="568" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">square</text></g>
<line x1="404" y1="112" x2="644" y2="112" style="stroke: var(--border);"/>
<g><text x="414" y="130" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="454" y="130" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">red</text><text x="528" y="130" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4</text><text x="568" y="130" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">triangle</text></g>
<line x1="404" y1="140" x2="644" y2="140" style="stroke: var(--border);"/>
<g><text x="414" y="158" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">2</text><text x="454" y="158" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">blue</text><text x="528" y="158" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="568" y="158" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">circle</text></g>
<line x1="404" y1="168" x2="644" y2="168" style="stroke: var(--border);"/>
<g><text x="414" y="186" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">2</text><text x="454" y="186" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">blue</text><text x="528" y="186" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">3</text><text x="568" y="186" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">square</text></g>
<line x1="404" y1="196" x2="644" y2="196" style="stroke: var(--border);"/>
<g><text x="414" y="214" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">2</text><text x="454" y="214" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">blue</text><text x="528" y="214" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4</text><text x="568" y="214" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">triangle</text></g>
<path d="M162 70 C 282.0 70, 274.0 66, 394 66" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,62 402,66 394,70" style="fill: var(--opteryx-orange);"/>
<circle cx="162" cy="70" r="2.5" style="fill: var(--opteryx-orange);"/>
<path d="M162 206 C 282.0 206, 274.0 74, 394 74" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,70 402,74 394,78" style="fill: var(--opteryx-teal);"/>
<circle cx="162" cy="206" r="2.5" style="fill: var(--opteryx-teal);"/>
<path d="M162 70 C 282.0 70, 274.0 94, 394 94" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,90 402,94 394,98" style="fill: var(--opteryx-orange);"/>
<circle cx="162" cy="70" r="2.5" style="fill: var(--opteryx-orange);"/>
<path d="M162 234 C 282.0 234, 274.0 102, 394 102" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,98 402,102 394,106" style="fill: var(--opteryx-teal);"/>
<circle cx="162" cy="234" r="2.5" style="fill: var(--opteryx-teal);"/>
<path d="M162 70 C 282.0 70, 274.0 122, 394 122" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,118 402,122 394,126" style="fill: var(--opteryx-orange);"/>
<circle cx="162" cy="70" r="2.5" style="fill: var(--opteryx-orange);"/>
<path d="M162 262 C 282.0 262, 274.0 130, 394 130" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,126 402,130 394,134" style="fill: var(--opteryx-teal);"/>
<circle cx="162" cy="262" r="2.5" style="fill: var(--opteryx-teal);"/>
<path d="M162 98 C 282.0 98, 274.0 150, 394 150" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,146 402,150 394,154" style="fill: var(--opteryx-orange);"/>
<circle cx="162" cy="98" r="2.5" style="fill: var(--opteryx-orange);"/>
<path d="M162 206 C 282.0 206, 274.0 158, 394 158" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,154 402,158 394,162" style="fill: var(--opteryx-teal);"/>
<circle cx="162" cy="206" r="2.5" style="fill: var(--opteryx-teal);"/>
<path d="M162 98 C 282.0 98, 274.0 178, 394 178" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,174 402,178 394,182" style="fill: var(--opteryx-orange);"/>
<circle cx="162" cy="98" r="2.5" style="fill: var(--opteryx-orange);"/>
<path d="M162 234 C 282.0 234, 274.0 186, 394 186" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,182 402,186 394,190" style="fill: var(--opteryx-teal);"/>
<circle cx="162" cy="234" r="2.5" style="fill: var(--opteryx-teal);"/>
<path d="M162 98 C 282.0 98, 274.0 206, 394 206" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,202 402,206 394,210" style="fill: var(--opteryx-orange);"/>
<circle cx="162" cy="98" r="2.5" style="fill: var(--opteryx-orange);"/>
<path d="M162 262 C 282.0 262, 274.0 214, 394 214" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,210 402,214 394,218" style="fill: var(--opteryx-teal);"/>
<circle cx="162" cy="262" r="2.5" style="fill: var(--opteryx-teal);"/>
</svg>
</figure>

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

<figure class="doc-figure">
<svg viewBox="0 0 680 282" width="100%" role="img" aria-labelledby="inner-join-title inner-join-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="inner-join-title">INNER JOIN of left_relation and right_relation</title>
<desc id="inner-join-desc">left_relation has rows (1, red) and (2, blue); right_relation has rows (1, circle), (3, square) and (4, triangle), joined on id. Arrows run from each source row to the result rows it supplies values to; rows that supply nothing are faded. The INNER JOIN returns one row, 1 red 1 circle, because 1 is the only id in both. Blue, square and triangle are faded.</desc>
<text x="0" y="21" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">left_relation</text>
<rect x="0" y="30" width="156" height="82" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M0.5 56 V 36.0 Q 0.5 30.5 6.0 30.5 H 43.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="10" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M44.5 56 V 30.5 H 150.0 Q 155.5 30.5 155.5 36.0 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="54" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">colour</text>
<line x1="0" y1="56" x2="156" y2="56" style="stroke: var(--border-2);"/>
<g><text x="10" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="54" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">red</text></g>
<line x1="0" y1="84" x2="156" y2="84" style="stroke: var(--border);"/>
<g opacity="0.35"><text x="10" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">2</text><text x="54" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">blue</text></g>
<text x="0" y="157" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">right_relation</text>
<rect x="0" y="166" width="156" height="110" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M0.5 192 V 172.0 Q 0.5 166.5 6.0 166.5 H 43.5 V 192 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="10" y="183" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M44.5 192 V 166.5 H 150.0 Q 155.5 166.5 155.5 172.0 V 192 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="54" y="183" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">shape</text>
<line x1="0" y1="192" x2="156" y2="192" style="stroke: var(--border-2);"/>
<g><text x="10" y="210" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="54" y="210" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">circle</text></g>
<line x1="0" y1="220" x2="156" y2="220" style="stroke: var(--border);"/>
<g opacity="0.35"><text x="10" y="238" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">3</text><text x="54" y="238" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">square</text></g>
<line x1="0" y1="248" x2="156" y2="248" style="stroke: var(--border);"/>
<g opacity="0.35"><text x="10" y="266" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4</text><text x="54" y="266" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">triangle</text></g>
<text x="404" y="21" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">INNER JOIN</text>
<rect x="404" y="30" width="240" height="54" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M404.5 56 V 36.0 Q 404.5 30.5 410.0 30.5 H 443.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="414" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M444.5 56 V 30.5 H 517.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="454" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">colour</text>
<path d="M518.5 56 V 30.5 H 557.5 V 56 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="528" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M558.5 56 V 30.5 H 638.0 Q 643.5 30.5 643.5 36.0 V 56 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="568" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">shape</text>
<line x1="404" y1="56" x2="644" y2="56" style="stroke: var(--border-2);"/>
<line x1="518" y1="30" x2="518" y2="84" style="stroke: var(--border-2);"/>
<g><text x="414" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="454" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">red</text><text x="528" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="568" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">circle</text></g>
<path d="M162 70 C 282.0 70, 274.0 66, 394 66" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,62 402,66 394,70" style="fill: var(--opteryx-orange);"/>
<circle cx="162" cy="70" r="2.5" style="fill: var(--opteryx-orange);"/>
<path d="M162 206 C 282.0 206, 274.0 74, 394 74" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,70 402,74 394,78" style="fill: var(--opteryx-teal);"/>
<circle cx="162" cy="206" r="2.5" style="fill: var(--opteryx-teal);"/>
</svg>
</figure>

In this example, `id` is the joining column in both relations. Only the value `1` appears in both relations, so the result set contains the combination of rows with `1` from both _left_relation_ and _right_relation_.

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

<figure class="doc-figure">
<svg viewBox="0 0 680 282" width="100%" role="img" aria-labelledby="left-join-title left-join-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="left-join-title">LEFT JOIN of left_relation and right_relation</title>
<desc id="left-join-desc">left_relation has rows (1, red) and (2, blue); right_relation has rows (1, circle), (3, square) and (4, triangle), joined on id. Arrows run from each source row to the result rows it supplies values to; rows that supply nothing are faded. The LEFT JOIN returns both left rows: 1 red matched with 1 circle, and 2 blue with null right columns. Square and triangle are faded.</desc>
<text x="0" y="21" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">left_relation</text>
<rect x="0" y="30" width="156" height="82" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M0.5 56 V 36.0 Q 0.5 30.5 6.0 30.5 H 43.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="10" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M44.5 56 V 30.5 H 150.0 Q 155.5 30.5 155.5 36.0 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="54" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">colour</text>
<line x1="0" y1="56" x2="156" y2="56" style="stroke: var(--border-2);"/>
<g><text x="10" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="54" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">red</text></g>
<line x1="0" y1="84" x2="156" y2="84" style="stroke: var(--border);"/>
<g><text x="10" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">2</text><text x="54" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">blue</text></g>
<text x="0" y="157" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">right_relation</text>
<rect x="0" y="166" width="156" height="110" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M0.5 192 V 172.0 Q 0.5 166.5 6.0 166.5 H 43.5 V 192 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="10" y="183" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M44.5 192 V 166.5 H 150.0 Q 155.5 166.5 155.5 172.0 V 192 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="54" y="183" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">shape</text>
<line x1="0" y1="192" x2="156" y2="192" style="stroke: var(--border-2);"/>
<g><text x="10" y="210" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="54" y="210" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">circle</text></g>
<line x1="0" y1="220" x2="156" y2="220" style="stroke: var(--border);"/>
<g opacity="0.35"><text x="10" y="238" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">3</text><text x="54" y="238" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">square</text></g>
<line x1="0" y1="248" x2="156" y2="248" style="stroke: var(--border);"/>
<g opacity="0.35"><text x="10" y="266" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4</text><text x="54" y="266" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">triangle</text></g>
<text x="404" y="21" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">LEFT JOIN</text>
<rect x="404" y="30" width="240" height="82" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M404.5 56 V 36.0 Q 404.5 30.5 410.0 30.5 H 443.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="414" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M444.5 56 V 30.5 H 517.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="454" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">colour</text>
<path d="M518.5 56 V 30.5 H 557.5 V 56 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="528" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M558.5 56 V 30.5 H 638.0 Q 643.5 30.5 643.5 36.0 V 56 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="568" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">shape</text>
<line x1="404" y1="56" x2="644" y2="56" style="stroke: var(--border-2);"/>
<line x1="518" y1="30" x2="518" y2="112" style="stroke: var(--border-2);"/>
<g><text x="414" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="454" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">red</text><text x="528" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="568" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">circle</text></g>
<line x1="404" y1="84" x2="644" y2="84" style="stroke: var(--border);"/>
<g><text x="414" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">2</text><text x="454" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">blue</text><text x="528" y="102" style="fill: var(--muted-2); font-size: 12.5px; font-style: italic; font-family: var(--font-body);">null</text><text x="568" y="102" style="fill: var(--muted-2); font-size: 12.5px; font-style: italic; font-family: var(--font-body);">null</text></g>
<path d="M162 70 C 282.0 70, 274.0 66, 394 66" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,62 402,66 394,70" style="fill: var(--opteryx-orange);"/>
<circle cx="162" cy="70" r="2.5" style="fill: var(--opteryx-orange);"/>
<path d="M162 206 C 282.0 206, 274.0 74, 394 74" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,70 402,74 394,78" style="fill: var(--opteryx-teal);"/>
<circle cx="162" cy="206" r="2.5" style="fill: var(--opteryx-teal);"/>
<path d="M162 98 C 282.0 98, 274.0 98, 394 98" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,94 402,98 394,102" style="fill: var(--opteryx-orange);"/>
<circle cx="162" cy="98" r="2.5" style="fill: var(--opteryx-orange);"/>
</svg>
</figure>

In this example, `id` is the joining column in both relations. _left_relation_ has ids `1` and `2`; _right_relation_ has ids `1`, `3` and `4`. Only value `1` appears in both, so that row is returned with columns from both relations. The row with value `2` has no match in _right_relation_, so it is still included but the right relation columns are filled with `null`.

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

<figure class="doc-figure">
<svg viewBox="0 0 680 282" width="100%" role="img" aria-labelledby="full-join-title full-join-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="full-join-title">FULL JOIN of left_relation and right_relation</title>
<desc id="full-join-desc">left_relation has rows (1, red) and (2, blue); right_relation has rows (1, circle), (3, square) and (4, triangle), joined on id. Arrows run from each source row to the result rows it supplies values to; rows that supply nothing are faded. The FULL JOIN returns four rows: 1 red with 1 circle; 2 blue with null right columns; and 3 square and 4 triangle with null left columns.</desc>
<text x="0" y="21" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">left_relation</text>
<rect x="0" y="30" width="156" height="82" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M0.5 56 V 36.0 Q 0.5 30.5 6.0 30.5 H 43.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="10" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M44.5 56 V 30.5 H 150.0 Q 155.5 30.5 155.5 36.0 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="54" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">colour</text>
<line x1="0" y1="56" x2="156" y2="56" style="stroke: var(--border-2);"/>
<g><text x="10" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="54" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">red</text></g>
<line x1="0" y1="84" x2="156" y2="84" style="stroke: var(--border);"/>
<g><text x="10" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">2</text><text x="54" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">blue</text></g>
<text x="0" y="157" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">right_relation</text>
<rect x="0" y="166" width="156" height="110" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M0.5 192 V 172.0 Q 0.5 166.5 6.0 166.5 H 43.5 V 192 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="10" y="183" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M44.5 192 V 166.5 H 150.0 Q 155.5 166.5 155.5 172.0 V 192 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="54" y="183" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">shape</text>
<line x1="0" y1="192" x2="156" y2="192" style="stroke: var(--border-2);"/>
<g><text x="10" y="210" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="54" y="210" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">circle</text></g>
<line x1="0" y1="220" x2="156" y2="220" style="stroke: var(--border);"/>
<g><text x="10" y="238" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">3</text><text x="54" y="238" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">square</text></g>
<line x1="0" y1="248" x2="156" y2="248" style="stroke: var(--border);"/>
<g><text x="10" y="266" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4</text><text x="54" y="266" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">triangle</text></g>
<text x="404" y="21" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">FULL JOIN</text>
<rect x="404" y="30" width="240" height="138" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M404.5 56 V 36.0 Q 404.5 30.5 410.0 30.5 H 443.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="414" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M444.5 56 V 30.5 H 517.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="454" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">colour</text>
<path d="M518.5 56 V 30.5 H 557.5 V 56 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="528" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M558.5 56 V 30.5 H 638.0 Q 643.5 30.5 643.5 36.0 V 56 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="568" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">shape</text>
<line x1="404" y1="56" x2="644" y2="56" style="stroke: var(--border-2);"/>
<line x1="518" y1="30" x2="518" y2="168" style="stroke: var(--border-2);"/>
<g><text x="414" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="454" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">red</text><text x="528" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="568" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">circle</text></g>
<line x1="404" y1="84" x2="644" y2="84" style="stroke: var(--border);"/>
<g><text x="414" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">2</text><text x="454" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">blue</text><text x="528" y="102" style="fill: var(--muted-2); font-size: 12.5px; font-style: italic; font-family: var(--font-body);">null</text><text x="568" y="102" style="fill: var(--muted-2); font-size: 12.5px; font-style: italic; font-family: var(--font-body);">null</text></g>
<line x1="404" y1="112" x2="644" y2="112" style="stroke: var(--border);"/>
<g><text x="414" y="130" style="fill: var(--muted-2); font-size: 12.5px; font-style: italic; font-family: var(--font-body);">null</text><text x="454" y="130" style="fill: var(--muted-2); font-size: 12.5px; font-style: italic; font-family: var(--font-body);">null</text><text x="528" y="130" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">3</text><text x="568" y="130" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">square</text></g>
<line x1="404" y1="140" x2="644" y2="140" style="stroke: var(--border);"/>
<g><text x="414" y="158" style="fill: var(--muted-2); font-size: 12.5px; font-style: italic; font-family: var(--font-body);">null</text><text x="454" y="158" style="fill: var(--muted-2); font-size: 12.5px; font-style: italic; font-family: var(--font-body);">null</text><text x="528" y="158" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4</text><text x="568" y="158" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">triangle</text></g>
<path d="M162 70 C 282.0 70, 274.0 66, 394 66" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,62 402,66 394,70" style="fill: var(--opteryx-orange);"/>
<circle cx="162" cy="70" r="2.5" style="fill: var(--opteryx-orange);"/>
<path d="M162 206 C 282.0 206, 274.0 74, 394 74" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,70 402,74 394,78" style="fill: var(--opteryx-teal);"/>
<circle cx="162" cy="206" r="2.5" style="fill: var(--opteryx-teal);"/>
<path d="M162 98 C 282.0 98, 274.0 98, 394 98" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,94 402,98 394,102" style="fill: var(--opteryx-orange);"/>
<circle cx="162" cy="98" r="2.5" style="fill: var(--opteryx-orange);"/>
<path d="M162 234 C 282.0 234, 274.0 126, 394 126" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,122 402,126 394,130" style="fill: var(--opteryx-teal);"/>
<circle cx="162" cy="234" r="2.5" style="fill: var(--opteryx-teal);"/>
<path d="M162 262 C 282.0 262, 274.0 154, 394 154" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,150 402,154 394,158" style="fill: var(--opteryx-teal);"/>
<circle cx="162" cy="262" r="2.5" style="fill: var(--opteryx-teal);"/>
</svg>
</figure>

In this example, `id` is the joining column in both relations. _left_relation_ has ids `1` and `2`; _right_relation_ has ids `1`, `3` and `4`. Value `1` appears in both and the rows are aligned. Value `2` exists only in _left_relation_, and values `3` and `4` exist only in _right_relation_ — all are included in the result, with `null` filling the columns from the absent side.

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

<figure class="doc-figure">
<svg viewBox="0 0 680 282" width="100%" role="img" aria-labelledby="left-semi-join-title left-semi-join-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="left-semi-join-title">LEFT SEMI JOIN of left_relation and right_relation</title>
<desc id="left-semi-join-desc">left_relation has rows (1, red) and (2, blue); right_relation has rows (1, circle), (3, square) and (4, triangle), joined on id. Arrows run from each source row to the result rows it supplies values to; rows that supply nothing are faded. The LEFT SEMI JOIN returns only 1 red, with only the left relation&#x27;s columns. A dashed line from 1 circle shows the match that let it through, without contributing columns.</desc>
<text x="0" y="21" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">left_relation</text>
<rect x="0" y="30" width="156" height="82" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M0.5 56 V 36.0 Q 0.5 30.5 6.0 30.5 H 43.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="10" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M44.5 56 V 30.5 H 150.0 Q 155.5 30.5 155.5 36.0 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="54" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">colour</text>
<line x1="0" y1="56" x2="156" y2="56" style="stroke: var(--border-2);"/>
<g><text x="10" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="54" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">red</text></g>
<line x1="0" y1="84" x2="156" y2="84" style="stroke: var(--border);"/>
<g opacity="0.35"><text x="10" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">2</text><text x="54" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">blue</text></g>
<text x="0" y="157" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">right_relation</text>
<rect x="0" y="166" width="156" height="110" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M0.5 192 V 172.0 Q 0.5 166.5 6.0 166.5 H 43.5 V 192 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="10" y="183" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M44.5 192 V 166.5 H 150.0 Q 155.5 166.5 155.5 172.0 V 192 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="54" y="183" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">shape</text>
<line x1="0" y1="192" x2="156" y2="192" style="stroke: var(--border-2);"/>
<g><text x="10" y="210" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="54" y="210" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">circle</text></g>
<line x1="0" y1="220" x2="156" y2="220" style="stroke: var(--border);"/>
<g opacity="0.35"><text x="10" y="238" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">3</text><text x="54" y="238" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">square</text></g>
<line x1="0" y1="248" x2="156" y2="248" style="stroke: var(--border);"/>
<g opacity="0.35"><text x="10" y="266" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4</text><text x="54" y="266" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">triangle</text></g>
<text x="404" y="21" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">LEFT SEMI JOIN</text>
<rect x="404" y="30" width="114" height="54" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M404.5 56 V 36.0 Q 404.5 30.5 410.0 30.5 H 443.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="414" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M444.5 56 V 30.5 H 512.0 Q 517.5 30.5 517.5 36.0 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="454" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">colour</text>
<line x1="404" y1="56" x2="518" y2="56" style="stroke: var(--border-2);"/>
<g><text x="414" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="454" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">red</text></g>
<path d="M162 70 C 282.0 70, 274.0 70, 394 70" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,66 402,70 394,74" style="fill: var(--opteryx-orange);"/>
<circle cx="162" cy="70" r="2.5" style="fill: var(--opteryx-orange);"/>
<path d="M162 206 C 282.0 206, 274.0 76, 394 76" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85; stroke-dasharray: 4 3;"/>
<polygon points="394,72 402,76 394,80" style="fill: var(--opteryx-teal);"/>
<circle cx="162" cy="206" r="2.5" style="fill: var(--opteryx-teal);"/>
</svg>
</figure>

In this example, `id` is the joining column in both relations. _left_relation_ has ids `1` and `2`; _right_relation_ has ids `1`, `3` and `4`. Only value `1` has a match in _right_relation_, so only that row from _left_relation_ is returned. Value `2` has no match and is excluded. No columns from _right_relation_ appear in the result.

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

<figure class="doc-figure">
<svg viewBox="0 0 680 282" width="100%" role="img" aria-labelledby="left-anti-join-title left-anti-join-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="left-anti-join-title">LEFT ANTI JOIN of left_relation and right_relation</title>
<desc id="left-anti-join-desc">left_relation has rows (1, red) and (2, blue); right_relation has rows (1, circle), (3, square) and (4, triangle), joined on id. Arrows run from each source row to the result rows it supplies values to; rows that supply nothing are faded. The LEFT ANTI JOIN returns only 2 blue, the left row with no match, with only the left relation&#x27;s columns.</desc>
<text x="0" y="21" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">left_relation</text>
<rect x="0" y="30" width="156" height="82" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M0.5 56 V 36.0 Q 0.5 30.5 6.0 30.5 H 43.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="10" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M44.5 56 V 30.5 H 150.0 Q 155.5 30.5 155.5 36.0 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="54" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">colour</text>
<line x1="0" y1="56" x2="156" y2="56" style="stroke: var(--border-2);"/>
<g opacity="0.35"><text x="10" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="54" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">red</text></g>
<line x1="0" y1="84" x2="156" y2="84" style="stroke: var(--border);"/>
<g><text x="10" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">2</text><text x="54" y="102" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">blue</text></g>
<text x="0" y="157" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">right_relation</text>
<rect x="0" y="166" width="156" height="110" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M0.5 192 V 172.0 Q 0.5 166.5 6.0 166.5 H 43.5 V 192 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="10" y="183" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M44.5 192 V 166.5 H 150.0 Q 155.5 166.5 155.5 172.0 V 192 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.14;"/>
<text x="54" y="183" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">shape</text>
<line x1="0" y1="192" x2="156" y2="192" style="stroke: var(--border-2);"/>
<g opacity="0.35"><text x="10" y="210" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">1</text><text x="54" y="210" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">circle</text></g>
<line x1="0" y1="220" x2="156" y2="220" style="stroke: var(--border);"/>
<g opacity="0.35"><text x="10" y="238" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">3</text><text x="54" y="238" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">square</text></g>
<line x1="0" y1="248" x2="156" y2="248" style="stroke: var(--border);"/>
<g opacity="0.35"><text x="10" y="266" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">4</text><text x="54" y="266" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">triangle</text></g>
<text x="404" y="21" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">LEFT ANTI JOIN</text>
<rect x="404" y="30" width="114" height="54" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M404.5 56 V 36.0 Q 404.5 30.5 410.0 30.5 H 443.5 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="414" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M444.5 56 V 30.5 H 512.0 Q 517.5 30.5 517.5 36.0 V 56 Z" style="fill: var(--opteryx-orange); fill-opacity: 0.14;"/>
<text x="454" y="47" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">colour</text>
<line x1="404" y1="56" x2="518" y2="56" style="stroke: var(--border-2);"/>
<g><text x="414" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-weight: 600; font-family: var(--font-body);">2</text><text x="454" y="74" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">blue</text></g>
<path d="M162 98 C 282.0 98, 274.0 70, 394 70" style="fill: none; stroke: var(--opteryx-orange); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="394,66 402,70 394,74" style="fill: var(--opteryx-orange);"/>
<circle cx="162" cy="98" r="2.5" style="fill: var(--opteryx-orange);"/>
</svg>
</figure>

In this example, `id` is the joining column in both relations. _left_relation_ has ids `1` and `2`; _right_relation_ has ids `1`, `3` and `4`. Value `1` has a match in _right_relation_ and is therefore excluded. Value `2` has no match, so it is the only row returned. No columns from _right_relation_ appear in the result.

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
