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
 WHERE ARRAY_CONTAINS_ANY(crew, ('Armstrong', 'Aldrin'));
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

## Array Length

```sql
LENGTH(array)
```

Example:

```sql
SELECT name, LENGTH(tags) AS tag_count
  FROM articles;
```

## Containment

Three containment tests, each with a function form and — for the two multi-value tests — an
operator form. The function and operator forms are equivalent; use whichever reads better.

| Test | Function | Operator |
|------|----------|----------|
| Array contains a single value | `ARRAY_CONTAINS(array, value)` | `value = ANY (array)` |
| Array contains **any** of several values | `ARRAY_CONTAINS_ANY(array, (v1, v2))` | `array @> (v1, v2)` |
| Array contains **all** of several values | `ARRAY_CONTAINS_ALL(array, (v1, v2))` | `array @>> (v1, v2)` |

### ARRAY_CONTAINS

Test if an array contains a specific value:

```sql
SELECT *
  FROM articles
 WHERE ARRAY_CONTAINS(tags, 'featured');
```

`ARRAY_CONTAINS` is lowered to `value = ANY (array)` when the query is planned, so the two
spellings execute identically.

### ARRAY_CONTAINS_ANY / `@>`

Test if an array contains any of the specified values:

```sql
SELECT * FROM articles WHERE ARRAY_CONTAINS_ANY(tags, ('featured', 'pinned'));
SELECT * FROM articles WHERE tags @> ('featured', 'pinned');
```

### ARRAY_CONTAINS_ALL / `@>>`

Test if an array contains all of the specified values:

```sql
SELECT * FROM articles WHERE ARRAY_CONTAINS_ALL(tags, ('featured', 'pinned'));
SELECT * FROM articles WHERE tags @>> ('featured', 'pinned');
```

> Be Aware: A parenthesised list with a **single** element is not an array — `('featured')` is just a parenthesised scalar, and `tags @> ('featured')` is rejected as an `ARRAY`/`VARCHAR` type mismatch. For a one-value test use `ARRAY_CONTAINS(tags, 'featured')` or `'featured' = ANY (tags)`.

## ANY

Test if any element in an array column satisfies a condition:

```sql
value = ANY (array_column)
value != ANY (array_column)
value > ANY (array_column)
value < ANY (array_column)
```

The array argument must be a column reference, not an inline literal.

Example:

```sql
SELECT *
  FROM articles
 WHERE 'featured' = ANY (tags);
```

## ALL

Test if all elements in an array column satisfy a condition. Currently only `=` and `!=` are supported:

```sql
value = ALL (array_column)
value != ALL (array_column)
```

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
- `LIKE ANY`, `SORT`, `GREATEST`, and `LEAST` on array values are not currently stable
- `ALL` operator only supports `=` and `!=`; comparison operators (`>`, `<`, etc.) are not supported
- Arrays cannot be used in `ORDER BY`
