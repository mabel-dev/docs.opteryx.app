---
title: Working with Arrays in Opteryx - SQL Array Functions
description: Learn how to query and manipulate arrays in Opteryx SQL. Array functions, operations, and best practices.
---

# Working with Arrays

An Array is an ordered collection of zero or more `VARCHAR` values.

## Actions

### Casting

Cast values to array type:

~~~sql
CAST(column AS ARRAY<element_type>)
~~~

Example:

~~~sql
SELECT CAST('[1, 2, 3]' AS ARRAY<INTEGER>);
~~~

### Create

#### Array Literal

Create an array using literal notation:

~~~sql
[<value>, <value>, ...]
~~~

Example:

~~~sql
SELECT ['Mercury', 'Gemini', 'Apollo'] AS missions;
~~~

#### Split String

Create an array by splitting a string:

~~~sql
SPLIT(string)
~~~

Example:

~~~sql
SELECT SPLIT('apple,banana,cherry');
~~~

### Reading

#### Subscript Access

Access individual elements by index:

~~~sql
array[index]
~~~

Example:

~~~sql
SELECT missions[0]
  FROM $astronauts;
~~~

#### Get Length

Get the number of elements in an array:

~~~sql
LENGTH(array)
~~~

Example:

~~~sql
SELECT LENGTH(missions)
  FROM $astronauts;
~~~

#### Get Minimum/Maximum

Get the smallest or largest value in an array:

~~~sql
LEAST(array)
GREATEST(array)
~~~

Example:

~~~sql
SELECT LEAST([5, 2, 8, 1]) AS min_value,
       GREATEST([5, 2, 8, 1]) AS max_value;
~~~

### Comparing

#### Equality

Compare arrays for equality:

~~~sql
SELECT *
  FROM table1
 WHERE array_column = ['value1', 'value2'];
~~~

#### ANY (Comparison)

~~~sql
value <operator> ANY (array)
~~~

The `ANY` function is used to apply a filter to each item in an array, and returns `True` if any item in the array matches the condition.

Example:

~~~sql
SELECT * 
  FROM $astronauts
 WHERE 'Apollo 11' = ANY (missions);
~~~

Supported operators: `=`, `!=`, `>`, `<`, `>=`, `<=`

#### ANY (Similarity)

~~~sql
column <operator> ANY (patterns)
~~~

The `ANY` modifier is used to perform a similarity search against all of the items in an array, and returns `True` if any item in the array matches the pattern.

Example:

~~~sql
SELECT *
  FROM $astronauts
 WHERE missions LIKE ANY ('Mercury%', 'Gemini%', 'Apollo%');
~~~

Supported operators: `LIKE`, `NOT LIKE`, `ILIKE`, `NOT ILIKE`

#### ALL

~~~sql
value <operator> ALL(array)
~~~

The `ALL` function is used to apply a filter to each item in an array, and returns `True` if all items in the array match the condition.

Example:

~~~sql
SELECT *
  FROM $astronauts
 WHERE 100 > ALL (mission_durations);
~~~

!!! Note
    `ALL` currently supports a subset of operators: `=`, `!=`

#### Containment Testing

##### ARRAY_CONTAINS

Test if an array contains a specific value:

~~~sql
ARRAY_CONTAINS(array, value)
~~~

Example:

~~~sql
SELECT *
  FROM $astronauts
 WHERE ARRAY_CONTAINS(missions, 'Apollo 11');
~~~

##### ARRAY_CONTAINS_ANY

Test if an array contains any of the specified values:

~~~sql
ARRAY_CONTAINS_ANY(array, values)
~~~

Or using the `@>` operator:

~~~sql
array @> values
~~~

The `@>` operator also supports JSON Path expressions for more complex queries on nested structures.

Example:

~~~sql
SELECT *
  FROM $astronauts
 WHERE ARRAY_CONTAINS_ANY(missions, ['Apollo 11', 'Apollo 13']);
~~~

##### ARRAY_CONTAINS_ALL

Test if an array contains all of the specified values:

~~~sql
ARRAY_CONTAINS_ALL(array, values)
~~~

Or using the `@>>` operator:

~~~sql
values @>> array
~~~

The `@>>` operator also supports JSON Path expressions for more complex queries on nested structures.

Example:

~~~sql
SELECT *
  FROM $astronauts
 WHERE ARRAY_CONTAINS_ALL(missions, ['Apollo 11', 'Apollo 13']);
~~~

##### IN Operator

Test if a value is in a list of values:

~~~sql
value IN (value1, value2, ...)
~~~

Example:

~~~sql
SELECT *
  FROM $planets
 WHERE name IN ('Earth', 'Mars');
~~~

##### IN UNNEST

Test if a value exists in an array column:

~~~sql
value IN UNNEST(array)
~~~

Example:

~~~sql
SELECT *
  FROM $astronauts
 WHERE 'Apollo 11' IN UNNEST(missions);
~~~

### Transforms

#### Sort Array

Sort an array in ascending order:

~~~sql
SORT(array)
~~~

Example:

~~~sql
SELECT SORT([3, 1, 4, 1, 5]) AS sorted_array;
~~~

## Converting Lists to Relations

### Using `UNNEST`

`UNNEST` allows you to create a single column relation either as a list of literals, or from a column of LIST type in a dataset.

~~~sql
SELECT * 
  FROM UNNEST((True, False)) AS Booleans;
~~~

## Limitations

Lists have the following limitations

- Statements cannot `ORDER BY` a list column
- Lists cannot be used in comparisons

!!! Note
    Some restrictions may be resolved by the query optimizer, for example, Projection Pushdown may remove list columns as part of optimization. However, you should not rely on the optimizer to take any particular action.