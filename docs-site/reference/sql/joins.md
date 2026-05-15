---
title: SQL Joins - Inner, Outer, and Cross Joins in Opteryx
description: Master SQL joins in Opteryx. Learn INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, and CROSS JOIN with practical examples.
---

# Joins

Joins allow you to combine data from multiple relations (tables or datasets) into a single result set. Different join types provide different ways to combine data, each suited to specific use cases.

## CROSS JOIN

A `CROSS JOIN` returns the Cartesian product (all possible combinations) of two relations. Each row from the left relation is paired with every row from the right relation.

~~~
FROM left_relation CROSS JOIN right_relation
~~~

A alternate form omits the keyword and uses comma-separated relations in the `FROM` clause - however, it is recommended to use the explicit `CROSS JOIN` syntax for clarity and to avoid confusion:

~~~
FROM left_relation, right_relation
~~~

~~~sql
SELECT *
  FROM left_relation
 CROSS JOIN right_relation;
~~~

![CROSS JOIN](/images/cross-join.svg)

:::warning Use sparingly
The output cardinality is the product of the inputs.
`CROSS JOIN` is rarely the right approach on large datasets.
:::

> USE SPARINGLY:   
> The size of the result set from a `CROSS JOIN` is the product of the row counts of the two input datasets (2 × 3 = 6 in the pictorial example). This can easily result in extremely large datasets. When an alternative join approach is available, it will almost always perform better than a `CROSS JOIN`.

> SPECIAL CASE:  
> `CROSS JOIN UNNEST` is a specific variation where values in an ARRAY column are treated as if they were rows in a single-column relation.

## INNER JOIN

~~~
FROM left_relation [ INNER ] JOIN right_relation < ON condition | USING (column) >
~~~

An `INNER JOIN` returns only the rows from both relations where the values in the joining columns match. It's the most commonly used join type due to its straightforward and predictable behavior.

**Syntax**

You can specify an `INNER JOIN` using the full `INNER JOIN` keyword or the shorter `JOIN` keyword. You can define the joining condition using either the `ON` clause or the `USING (column)` syntax.

~~~sql
SELECT *
  FROM left_relation
 INNER JOIN right_relation
    ON left_relation.column_name = right_relation.column_name;
~~~

![INNER JOIN](/images/inner-join.svg)

In this example, the blue column is used as the joining column in both relations. Only the value `1` appears in both relations, so the result set contains the combination of rows with `1` from both _left_relation_ and _right_relation_.

**Note on column handling:**

- `INNER JOIN ... ON` retains all columns from both relations in the result.
- `INNER JOIN ... USING` keeps only a single instance of the columns specified in the `USING` clause. These shared columns are not considered members of either the left or right relation.

## NATURAL JOIN

~~~
FROM left_relation NATURAL JOIN right_relation
~~~

A `NATURAL JOIN` performs a join similar to an `INNER JOIN` where the join conditions are automatically determined. It creates equality conditions between all columns with matching names in both relations.

**Gotchas**

- **Schema changes silently break queries.** If a new column is added to either relation with the same name as a column in the other, it will be picked up as a join condition without any warning. Queries that previously returned correct results may return wrong results or no results at all.
- **Join columns are implicit.** There is no way to tell from the query itself which columns are being used to join — you must inspect the schemas of both relations. This makes queries harder to read, review, and debug.
- **Accidental matches are easy.** Common column names like `id`, `name`, or `created_at` will be joined on automatically, even if they refer to unrelated concepts in each relation.

For these reasons, `NATURAL JOIN` is not recommended in production systems. An explicit `INNER JOIN ... ON` or `INNER JOIN ... USING` makes the join conditions visible and safe.

**Special behavior:** Performing a self `NATURAL JOIN` (using the same relation for both left and right sides) effectively filters out rows containing `null` values in any column. This can be used as a concise way to remove incomplete rows from a dataset, though an explicit `WHERE` clause is usually clearer.

## LEFT JOIN

~~~
FROM left_relation LEFT [ OUTER ] JOIN right_relation ON condition
~~~

A `LEFT JOIN` returns all rows from the left relation. For rows with matching values in the right relation, the corresponding right relation columns are included. For rows without a match, the right relation columns are filled with `null` values. The `OUTER` keyword is optional and does not change behaviour.

**Syntax**

~~~sql
SELECT *
  FROM left_relation
  LEFT JOIN right_relation
    ON left_relation.column_name = right_relation.column_name;
~~~

![LEFT JOIN](/images/left-join.svg)

In this example, the blue column is used as the joining column in both relations. _left_relation_ contains values `1` and `2`; _right_relation_ contains values `1` and `3`. Only value `1` appears in both, so that row is returned with columns from both relations. The row with value `2` has no match in _right_relation_, so it is still included but the right relation columns are filled with `null`.

## RIGHT JOIN

~~~
FROM left_relation RIGHT [ OUTER ] JOIN right_relation ON condition
~~~

A `RIGHT JOIN` is functionally equivalent to a `LEFT JOIN` with the left and right relations swapped. It returns all rows from the right relation, with matching left relation data where available, and `null` values for non-matching rows.

## FULL JOIN

~~~
FROM left_relation FULL [ OUTER ] JOIN right_relation ON condition
~~~

The `FULL JOIN` (also called `FULL OUTER JOIN`) returns all rows from both the left and right relations. Where rows have matching values in the joining column, they are aligned in the result. For non-matching rows from either side, the columns from the other relation are filled with `null` values.

**Syntax**

~~~sql
SELECT *
  FROM left_relation
  FULL OUTER JOIN right_relation
    ON left_relation.column_name = right_relation.column_name;
~~~

![FULL JOIN](/images/full-join.svg)

In this example, the blue column is used as the joining column in both relations. _left_relation_ contains values `1` and `2`; _right_relation_ contains values `1` and `3`. Value `1` appears in both and the rows are aligned. Value `2` exists only in _left_relation_ and value `3` exists only in _right_relation_ — both are included in the result, with `null` filling the columns from the absent side.

## LEFT SEMI JOIN

~~~
FROM left_relation LEFT SEMI JOIN right_relation ON condition
~~~

A `LEFT SEMI JOIN` returns rows from the left relation that have at least one matching row in the right relation, but includes only columns from the left relation. This is useful when you want to filter the left relation based on the existence of a match in the right relation, without including any columns from the right relation in the result.

**Syntax**

~~~sql
SELECT *
  FROM left_relation
  LEFT SEMI JOIN right_relation
    ON left_relation.column_name = right_relation.column_name;
~~~

![LEFT SEMI JOIN](/images/left-semi-join.svg)

In this example, the blue column is used as the joining column in both relations. _left_relation_ contains values `1` and `2`; _right_relation_ contains values `1` and `3`. Only value `1` has a match in _right_relation_, so only that row from _left_relation_ is returned. Value `2` has no match and is excluded. No columns from _right_relation_ appear in the result.

## RIGHT SEMI JOIN

Opteryx does not support `RIGHT SEMI JOIN`. Use a `LEFT SEMI JOIN` with the relations swapped to achieve the same result.

## LEFT ANTI JOIN

~~~
FROM left_relation LEFT ANTI JOIN right_relation ON condition
~~~

The `LEFT ANTI JOIN` returns rows from the left relation that do **not** have matching rows in the right relation. Only columns from the left relation are included in the result; the right relation serves only to filter out matching rows.

**Syntax**

~~~sql
SELECT *
  FROM left_relation
  LEFT ANTI JOIN right_relation
    ON left_relation.column_name = right_relation.column_name;
~~~

![LEFT ANTI JOIN](/images/left-anti-join.svg)

In this example, the blue column is used as the joining column in both relations. _left_relation_ contains values `1` and `2`; _right_relation_ contains values `1` and `3`. Value `1` has a match in _right_relation_ and is therefore excluded. Value `2` has no match, so it is the only row returned. No columns from _right_relation_ appear in the result.

## RIGHT ANTI JOIN

Opteryx does not support `RIGHT ANTI JOIN`. Use a `LEFT ANTI JOIN` with the relations swapped to achieve the same result.
