---
title: Working with Arrays in Opteryx - SQL Array Functions
description: Learn how to query and manipulate arrays in Opteryx SQL. Array functions, operations, and best practices.
---

# Working with Arrays

An array is an ordered, 0-indexed collection of values of the same type.

## Creating Arrays

> Warning: **A literal array cannot be projected in a `SELECT` clause.** `SELECT ['a', 'b']` — and the equivalent `SELECT ('a', 'b')` — is rejected when the query is planned, whether or not it is aliased and whether or not the query has a `FROM`. An array reaches a projection from a column, a function, or a cast; not from a literal written inline.

Split a delimited string into an array:

```sql
SELECT SPLIT(string_column, ',') FROM my_table;
```

Build a relation from literal values with `UNNEST` in the `FROM` clause — see
[Relation Constructors](adv-temp-tables.md):

```sql
SELECT *
  FROM UNNEST(('Mercury', 'Gemini', 'Apollo')) AS program;
```

Array literals *are* accepted as function and operator arguments, where they are not
being projected:

```sql
SELECT name
  FROM missions
 WHERE crew @> ('Armstrong', 'Aldrin');
```

## Accessing Elements

Access an element by its 0-based index:

```sql
array[0]   -- first element
array[1]   -- second element
```

A **negative index counts back from the end**, so `array[-1]` is the last element,
`array[-2]` the second-to-last:

```sql
array[-1]  -- last element
array[-2]  -- second-to-last element
```

The subscript must be an integer literal. An identifier or expression is rejected when the
query is planned — there is no computed-index form. This form only works on array-typed
columns, not on inline literal arrays.

Example:

```sql
SELECT tags[0]  AS first_tag,
       tags[-1] AS last_tag
  FROM articles;
```

## Containment

Three tests, written as operators:

| Test | Write |
|------|-------|
| Array contains a value | `value = ANY (array)` |
| Array contains **any** of several values | `array @> (v1, v2)` |
| Array contains **all** of several values | `array @>> (v1, v2)` |

```sql
SELECT * FROM articles WHERE 'featured' = ANY (tags);
SELECT * FROM articles WHERE tags @>  ('featured', 'pinned');   -- either
SELECT * FROM articles WHERE tags @>> ('featured', 'pinned');   -- both
```

> Be Aware: A parenthesised list with a **single** element is not an array — `('featured')` is just a parenthesised scalar, and `tags @> ('featured')` is rejected as an `ARRAY`/`VARCHAR` type mismatch. For a one-value test use `= ANY`.

The right-hand side of `@>` / `@>>` is a literal list. To test against another array-typed
column, use `= ANY` per value.

## ANY and ALL

`ANY` and `ALL` compare a value against every element of an array column — `ANY` is true when
at least one element satisfies the comparison, `ALL` when every element does.

```sql
value =  ANY (array_column)     value =  ALL (array_column)
value != ANY (array_column)     value != ALL (array_column)
value >  ANY (array_column)
value <  ANY (array_column)
```

`ANY` supports the ordering comparisons as well as equality; **`ALL` supports only `=` and
`!=`**. In both cases the array argument must be a column reference, not an inline literal.

```sql
-- articles where at least one score exceeds 90
SELECT * FROM articles WHERE 90 < ANY (scores);

-- articles where every tag is 'draft'
SELECT * FROM articles WHERE 'draft' = ALL (tags);
```

## Array Functions

| Function | Returns | Note |
|----------|---------|------|
| `LENGTH(array)` | `INTEGER` | Element count |
| `SORT(array)` | `ARRAY` | The array sorted ascending |
| `GREATEST(array)` | element type | The largest element |
| `LEAST(array)` | element type | The smallest element |

```sql
SELECT LENGTH(tags)   AS tag_count,
       SORT(tags)     AS sorted,
       GREATEST(tags) AS last_alphabetically
  FROM articles;
```

> Be Aware: `GREATEST` and `LEAST` take **one array argument** — they return the max and min *within* one array. They are not the variadic SQL forms: `GREATEST(a, b, c)` across three columns is not supported and raises an arity error.

### There is no slicing

Opteryx has no way to take a sub-range of an array. Range subscripts (`array[0:2]`,
`array[1:]`) are a parse error, and there is no `SLICE` or `ARRAY_SLICE` function. Take
individual elements by index, or `UNNEST` the array to rows and filter there.

## IN Operator

Test membership in a static list:

```sql
value IN (value1, value2, ...)
```

Example:

```sql
SELECT *
  FROM planets
 WHERE name IN ('Earth', 'Mars');
```

## Converting Arrays to Rows

`UNNEST` expands an array into a set of rows, or creates a relation from a tuple of literals:

```sql
SELECT *
  FROM UNNEST(('Mercury', 'Gemini', 'Apollo')) AS program;
```

## Casting to Array

Cast a value to a typed array:

```sql
CAST(column AS ARRAY<element_type>)
```

## Limitations

- Array literals in a `SELECT` clause require a column alias and cannot be subscripted inline — access elements via a column reference
- Subscripts must be integer literals; there is no computed-index form
- There is no slicing — no range subscript, no `SLICE` function
- `LIKE ANY` over an array column is not stable and can fail at execution; use `= ANY` or `@>` for membership
- `ALL` supports only `=` and `!=`; ordering comparisons (`>`, `<`, etc.) are not supported
- `GREATEST` / `LEAST` are single-array-argument only, not the variadic SQL forms
- Arrays cannot be used in `ORDER BY`
