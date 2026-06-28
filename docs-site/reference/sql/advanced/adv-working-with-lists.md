---
title: Working with Arrays in Opteryx - SQL Array Functions
description: Learn how to query and manipulate arrays in Opteryx SQL. Array functions, operations, and best practices.
---

# Working with Arrays

An array is an ordered, 0-indexed collection of values of the same type.

## Creating Arrays

Array literals use square bracket notation:

```sql
SELECT ['Mercury', 'Gemini', 'Apollo'];
```

Split a delimited string into an array:

```sql
SELECT SPLIT(string_column, ',') FROM my_table;
```

## Accessing Elements

Access an element by its 0-based index:

```sql
array[0]   -- first element
array[1]   -- second element
```

This form only works on array-typed columns — not on inline literal arrays.

Example:

```sql
SELECT tags[0] AS first_tag
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

### ARRAY_CONTAINS

Test if an array contains a specific value:

```sql
ARRAY_CONTAINS(array, value)
```

Example:

```sql
SELECT *
  FROM articles
 WHERE ARRAY_CONTAINS(tags, 'featured');
```

### ARRAY_CONTAINS_ANY

Test if an array contains any of the specified values:

```sql
ARRAY_CONTAINS_ANY(array, [value1, value2, ...])
```

Or using the `@>` operator:

```sql
array @> [value1, value2]
```

### ARRAY_CONTAINS_ALL

Test if an array contains all of the specified values:

```sql
ARRAY_CONTAINS_ALL(array, [value1, value2, ...])
```

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
- `LIKE ANY`, `SORT`, `GREATEST`, and `LEAST` on array values are not currently stable
- `ALL` operator only supports `=` and `!=`; comparison operators (`>`, `<`, etc.) are not supported
- Arrays cannot be used in `ORDER BY`

!!! Note  
    Some restrictions may be resolved by the query optimizer. For example, Projection Pushdown may remove array columns that are never read. Do not rely on specific optimizer behavior.
