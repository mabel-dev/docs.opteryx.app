---
title: NULL Semantics in Opteryx - Understanding NULL Handling
description: Learn how Opteryx handles NULL values in SQL queries. Understand NULL comparisons, filtering behavior, and best practices for working with NULL.
---

# NULL Semantics

Most comparisons to `null` return `null`. Exceptions are generally in functions or comparisons specifically to handle `null`, such as `IS NULL`.

When the outcome of a comparison is `null`, this will be coerced to `false` when used in a filter (`WHERE` or `HAVING`) but return as `null` in a `SELECT` statement.

To demonstrate, first a `null` comparison in a `SELECT` statement:

~~~sql
SELECT name = null
 FROM $planets;
~~~

This returns `null` for all values.

~~~
 name=null
-----------
 null
 null
 null
 null
 null
 null
 null
 null
 null
~~~

Using a `null` comparison in a `WHERE` statement will always result in `false`.

~~~sql
SELECT name
  FROM $planets
 WHERE name = null;
~~~

Returns an empty set, this is true even for inequality tests:

~~~sql
SELECT name
  FROM $planets
 WHERE name != null;
~~~

Also, returns an empty set.

!!! note
    `null` comparison returning `null` holds true even for `null = null`. Do not test for null using an equals condition, use `IS NULL`.
