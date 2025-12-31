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
`|`          | Bitwise OR, or IP address containment
`&`          | Bitwise AND
`^`          | Bitwise XOR

## Other Comparisons

### BETWEEN

The `BETWEEN` operator provides a convenient way to test if a value falls within a range.

Predicate                 | Description
------------------------- | ---------------------------------
a `BETWEEN` x `AND` y     | Equivalent to `a >= x AND a <= y`
a `NOT BETWEEN` x `AND` y | Equivalent to `a < x OR a > y`

!!! Warning  
    Using `BETWEEN` with other predicates in complex expressions, especially when combined with additional `AND` conjunctions, can sometimes cause the query parser to fail. Consider using explicit comparison operators for complex conditions.

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
