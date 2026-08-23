---
title: SQL Expressions and Operators - Opteryx Reference
description: Complete guide to SQL expressions in Opteryx. Logical operators, comparison operators, arithmetic, and expression composition.
---

# Expressions

An expression is a combination of values, operators, and functions that evaluates to a single value. Expressions are highly composable and can range from very simple (e.g., a single column reference) to arbitrarily complex (e.g., nested function calls with multiple operators). They can appear in many different parts of SQL statements, including `SELECT`, `WHERE`, `HAVING`, and `ORDER BY` clauses.

## Logical Operators

Logical operators are used within expressions to combine or modify boolean predicates (conditions).

The following logical operators are available: `AND`, `OR`, `XOR`, and `NOT`.

| a      | b     | a `AND` b | a `OR` b | a `XOR` b | `NOT` a |
| :----: | :---: | :-------: | :------: | :-------: | :-----: |
| true   | true  | true      | true     | false     | false   |
| true   | false | false     | true     | true      | false   |
| false  | false | false     | false    | false     | true    |
| _null_ | true  | _null_    | true     | _null_    | _null_  |
| _null_ | false | false     | _null_   | _null_    | _null_  |

The operators `AND`, `OR`, and `XOR` are commutative, meaning you can switch the left and right operands without changing the result.

## Comparison Operators

Comparison operators are used within expressions to compare values. Common use cases include comparing a field from the dataset against a literal value, though comparisons can also be between two fields or two literal values.

When one of the values in a comparison is `null`, the result is typically `null` (following SQL's three-valued logic).

Operator     | Description                   
:----------- | :-----------------------------
`=`          | Equal to               
`<>`         | Not equal to  
`<`          | Less than                     
`>`          | Greater than                
`<=`         | Less than or equal to        
`>=`         | Greater than or equal to                  
`IN`         | Value is in a list              
`NOT IN`     | Value is not in a list            
`LIKE`       | String pattern matching           
`NOT LIKE`   | Negation of `LIKE`         
`ILIKE`      | Case-insensitive pattern matching 
`NOT ILIKE`  | Negation of `ILIKE`     
`RLIKE`      | Regular expression matching (aliases: `~`, `SIMILAR TO`)     
`NOT RLIKE`  | Negation of `RLIKE` (aliases: `!~`, `NOT SIMILAR TO`)
`~*`         | Case-insensitive regular expression matching
`IS`         | Special comparison for `true`, `false`, and `null`
`IS DISTINCT FROM`     | Null-safe inequality; never returns `null`
`IS NOT DISTINCT FROM` | Null-safe equality; never returns `null`
`|`          | Bitwise OR
`&`          | Bitwise AND
`^`          | Bitwise XOR
`<<=`        | IPv4 address is contained by a CIDR network
`>>=`        | IPv4 network contains an address

## Other Comparisons

### BETWEEN

The `BETWEEN` operator provides a convenient way to test if a value falls within a range.

Predicate                 | Description
------------------------- | ---------------------------------
a `BETWEEN` x `AND` y     | Equivalent to `a >= x AND a <= y`
a `NOT BETWEEN` x `AND` y | Equivalent to `a < x OR a > y`

> Warning: Using `BETWEEN` with other predicates in complex expressions, especially when combined with additional `AND` conjunctions, can sometimes cause the query parser to fail. Consider using explicit comparison operators for complex conditions.

### CASE

The `CASE` expression provides conditional logic within SQL queries and comes in two forms.

The **simple** form searches each value expression from top to bottom until it finds one that equals the input expression:

~~~sql
CASE expression
    WHEN value THEN result
    [ WHEN ... ]
    [ ELSE result ]
END
~~~

The result for the matching value is returned. If no match is found, the result from the `ELSE` clause is returned if present; otherwise `null` is returned.

Example:

~~~sql
SELECT name, 
       CASE numberOfMoons 
            WHEN 0 THEN 'none' 
            WHEN 1 THEN 'one' 
            ELSE 'lots' 
       END as how_many_moons
  FROM $planets;
~~~

The **searched** form evaluates each boolean condition from top to bottom until one evaluates to true, then returns the corresponding result:

~~~sql
CASE
    WHEN condition THEN result
    [ WHEN ... ]
    [ ELSE result ]
END
~~~

If no conditions are true, the result from the `ELSE` clause is returned if present; otherwise `null` is returned.

Example:

~~~sql
SELECT name, 
       CASE
           WHEN numberOfMoons = 0 THEN 'none' 
           WHEN numberOfMoons = 1 THEN 'one' 
           ELSE 'lots' 
       END as how_many_moons
  FROM $planets;
~~~

### IS DISTINCT FROM

`IS DISTINCT FROM` compares two values without SQL's three-valued logic. It is **total** — it always returns `true` or `false`, never `null`, which is the reason to reach for it over `<>`.

Predicate                    | `a` = 1, `b` = 2 | `a` = 1, `b` = 1 | `a` = `null`, `b` = 1 | both `null`
---------------------------- | :--------------: | :--------------: | :-------------------: | :---------:
a `<>` b                     | true             | false            | _null_                | _null_
a `IS DISTINCT FROM` b       | true             | false            | true                  | false
a `IS NOT DISTINCT FROM` b   | false            | true             | false                 | true

~~~sql
SELECT * FROM $planets WHERE name IS DISTINCT FROM 'Earth';
~~~

### IN

`IN` tests membership. The right-hand side may be a constant list, a subquery, or an array expression.

~~~sql
-- a constant list
SELECT * FROM $planets WHERE id IN (1, 2, 3);

-- a subquery
SELECT * FROM $planets WHERE id IN (SELECT id FROM $planets WHERE numberOfMoons > 0);

-- the elements of an array
SELECT * FROM $planets WHERE name IN UNNEST(['Earth', 'Mars']);
~~~

Each form negates with `NOT IN`.

Every element of a constant list must be a constant and they must all share one type. Arithmetic is allowed and folded before the query runs — `d_year IN (1999, 1999 + 1)` is accepted — but an element that does not reduce to a constant is rejected.

> Be Aware: `NOT IN UNNEST(...)` is not currently executable. It lowers to a universally-quantified comparison, which has no kernel; see Quantified Comparisons below.

### EXISTS

`EXISTS` tests whether a subquery returns any row at all, and negates with `NOT EXISTS`. It may be used as a predicate or projected as a value.

~~~sql
SELECT name
  FROM $planets AS p
 WHERE EXISTS (SELECT 1 FROM $planets AS q WHERE q.id = p.id AND q.numberOfMoons > 0);
~~~

The subquery is usually correlated, as above. Opteryx decorrelates it during planning rather than evaluating it once per row.

### Quantified Comparisons

A comparison may be quantified over an array with `ANY`, which holds when the comparison is true for at least one element.

~~~sql
SELECT * FROM $planets WHERE id = ANY(ARRAY[1, 2]);
SELECT * FROM $planets WHERE name LIKE ANY ('E%', 'M%');
~~~

The pattern operators (`LIKE`, `ILIKE`, `RLIKE`) take the quantifier too. The patterns must be bracketed.

> Warning: `ALL` — `= ALL(...)`, `<> ALL(...)`, `> ALL(...)` — parses but does not execute. No universally-quantified comparison has an implementation, so a query using one fails at execution rather than at planning. `NOT IN UNNEST(...)` lowers to this form and is affected too.

### MATCH ... AGAINST

`MATCH` scores a column against a query string by embedding cosine similarity — it is not MySQL-style full-text search.

~~~sql
SELECT * FROM $planets WHERE MATCH (name) AGAINST ('Earth');
~~~

Exactly one column may be matched at a time. The threshold is set with `SET match_threshold`. MySQL's search modifiers (`IN NATURAL LANGUAGE MODE` and friends) are rejected rather than accepted and ignored.

## Literals

Literal            | Example                  | Notes
:----------------- | :----------------------- | :----
String             | `'text'`                 | Double quotes also delimit a string, not an identifier
Number             | `1`, `1.5`, `-1`         | An exact integer takes the narrowest type that holds it
Boolean            | `TRUE`, `FALSE`          |
Null               | `NULL`                   |
Hexadecimal        | `0x1F`                   | An integer, not a binary string
Array              | `['a', 'b']`, `(1, 2)`   | All elements must share one type
Interval           | `INTERVAL '1' DAY`       | See below

### Array literals

Both the bracket form `['a', 'b']` and the parenthesised form `(1, 2)` build an array, and every element must share one type.

An array literal is an **operand**, not a projectable value: it can appear on the right of `IN UNNEST`, `= ANY` or the array containment operators, but `SELECT ['a', 'b']` is rejected.

### INTERVAL

`INTERVAL` is the one type-prefixed string literal the dialect accepts. The value must be quoted, and a unit is required.

~~~sql
SELECT NOW() - INTERVAL '1' DAY;
SELECT INTERVAL '1 3' YEAR TO MONTH;
~~~

Units are `YEAR`, `MONTH`, `DAY`, `HOUR`, `MINUTE` and `SECOND`. The compound form spans a contiguous run of them starting at the leading unit.

Intervals are carried as a months-and-microseconds pair — the two components that cannot be converted into one another without a calendar.

## Subscripts

An array element is read positionally with a subscript. The subscript must be an integer literal.

~~~sql
SELECT name[0] FROM $planets;
~~~

Struct fields are read with the arrow operators (`->`, `->>`) instead, not with a subscript.

## Type Casting

Opteryx supports two equivalent syntaxes for casting values between types.

### CAST function

~~~sql
CAST(value AS type)
~~~

### Double-colon shorthand

~~~sql
value::type
~~~

Both forms are interchangeable. The `::` shorthand is more concise and common in practice.

### TRY_CAST

`TRY_CAST` (and its alias `SAFE_CAST`) is the non-raising form: where `CAST` raises on a value it cannot convert, `TRY_CAST` yields `null` for that value.

~~~sql
SELECT TRY_CAST('not a number' AS INTEGER);  -- null
SELECT CAST('not a number' AS INTEGER);      -- error
~~~

There is no `::` shorthand for the try form.

### Temporal types

When casting to temporal types, a precision unit is required for `TIMESTAMP`:

| Cast target | Example |
| :---------- | :------ |
| `DATE` | `'2024-01-01'::DATE` |
| `TIMESTAMP[s]` | `'2024-01-01'::TIMESTAMP[s]` |
| `TIMESTAMP[ms]` | `'2024-01-01'::TIMESTAMP[ms]` |
| `TIMESTAMP[us]` | `'2024-01-01'::TIMESTAMP[us]` |
| `TIMESTAMP[ns]` | `'2024-01-01'::TIMESTAMP[ns]` |
| `TIMESTAMP[d]` | `'2024-01-01'::TIMESTAMP[d]` |

`TIMESTAMP` without a unit is not supported.

### String literals are not implicitly cast to temporal types

Comparing a temporal column against an uncast string literal will raise an `IncompatibleTypesError`. An explicit cast is always required:

~~~sql
-- Correct
SELECT * FROM missions WHERE launched_at >= '1957-10-04'::DATE;
SELECT * FROM missions WHERE launched_at >= '1957-10-04'::TIMESTAMP[ms];

-- Error: IncompatibleTypesError
SELECT * FROM missions WHERE launched_at >= '1957-10-04';
~~~
