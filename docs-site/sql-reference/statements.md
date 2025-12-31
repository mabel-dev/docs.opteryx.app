---
title: SQL Statements Reference - Opteryx Documentation
description: Complete reference guide for SQL statements supported by Opteryx. Learn SELECT, SHOW, SET, and other SQL commands with examples.
---

# Statements

The following SQL statement forms are supported in Opteryx.

The SQL syntax supported by Opteryx is broadly inspired by [MySQL](https://www.mysql.com/); however, full compatibility is not a design goal. Syntax and feature support are selectively implemented based on relevance to Opteryx’s architecture and intended use cases.

## SELECT

Retrieve rows from one or more relations.

~~~sql
[ <statement> UNION [ ALL ] ... ]

SELECT [ DISTINCT ] [ ON ( <columns> ) ] <expression> [, ...]
       | [ * EXCEPT ( <columns> ) ]
  FROM { <relation> | <function> | (<subquery>) } AS <alias>
  [ FOR <period> ]
  [
    JOIN clauses...
  ]
  WHERE <condition> [ { AND | OR | XOR } ... ]
  GROUP BY [ ALL | <expression> [, ...] ]
  HAVING <condition> [ { AND | OR | XOR } ... ]
  ORDER BY <expression> [, ...]
  LIMIT <limit>
  OFFSET <offset>
~~~

### UNION

~~~sql
statement UNION [ ALL ] statement
~~~

The `UNION` clause combines the results of two queries by appending the rows. Column names and types are taken from the first query. Names from the second are ignored, and types are coerced when possible.

By default, `UNION` removes duplicate rows. Use the `ALL` modifier to retain duplicates.

### SELECT

~~~sql
SELECT [ DISTINCT [ ON (columns) ]] expression [, ...]
~~~
~~~sql
SELECT * EXCEPT (column[, ...])
~~~

The `SELECT` clause defines the columns or expressions to return. Although it appears first, it executes after the `FROM`, `WHERE`, and `GROUP BY` clauses.

- `DISTINCT` returns only unique rows.
- `DISTINCT ON (columns)` removes duplicates based on the given columns.
- `EXCEPT` allows exclusion of specific columns.

### FROM / JOIN

~~~sql
FROM relation [AS alias] [FOR period] [WITH (NO_CACHE, NO_PARTITION, NO_PUSH_PROJECTION, NO_PUSH_SELECTION)] [, ...] 
JOIN ...
~~~

`FROM` defines the source(s) of data. It supports single or multiple relations, functions, subqueries, and joins.

Supported `JOIN` types:

- `INNER JOIN`   
- `LEFT [OUTER | ANTI | SEMI] JOIN`   
- `RIGHT [OUTER] JOIN`   
- `FULL [OUTER] JOIN`   
- `CROSS JOIN`  

`ON` and `USING` are mutually exclusive and only applicable to `INNER`, `LEFT`, and `RIGHT` joins.

See [Joins](../joins/) for full syntax and examples.

### FOR

~~~sql
FOR date
~~~
~~~sql
FOR DATES BETWEEN start AND end
~~~
~~~sql
FOR DATES IN range
~~~
~~~sql
FOR DATES SINCE start
~~~
~~~sql
FOR LAST n DAYS
~~~

Filters data by the date it was recorded for. If omitted, `FOR TODAY` is assumed.

See [Time Travel](../adv-time-travel/) for more information.

### WHERE

~~~sql
WHERE condition
~~~

Applies filters to rows before grouping or projection.

### GROUP BY and HAVING

~~~sql
GROUP BY expression [, ...]
~~~
~~~sql
GROUP BY ALL
~~~
~~~sql
HAVING group_condition
~~~

- `GROUP BY` defines grouping keys for aggregation.
- `GROUP BY ALL` includes all non-aggregated columns from the `SELECT`.
- `HAVING` filters grouped results and requires a `GROUP BY`.

### ORDER BY / LIMIT / OFFSET

~~~sql
ORDER BY expression [ ASC | DESC ] [, ...]
~~~
~~~sql
OFFSET n
~~~
~~~sql
LIMIT n
~~~

These clauses apply to the final output:

- `ORDER BY` sorts rows.
- `LIMIT` restricts how many rows are returned.
- `OFFSET` skips rows before returning results.

## EXPLAIN

~~~sql
EXPLAIN [ ANALYZE ] [ FORMAT MERMAID | FORMAT TEXT ] statement
~~~

Displays the logical query plan.

- `ANALYZE` executes the query and appends execution metrics.
- `FORMAT` specifies output style: `TEXT` (default) or [`MERMAID`](https://mermaid.js.org/) for diagramming.

!!! warning
    Output format may change across versions and is not intended for machine parsing.

## EXECUTE :octicons-beaker-24: 

Execute a prepared statement.

~~~sql
EXECUTE statement_name[(<parameter=value[, ...]>)]
~~~

The `EXECUTE` clause executes a prepared statement. The parameters supplied in the invocation clause are used to populate placeholders in the prepared statement. The supplied parameters must be named, for example `EXECUTE PLANETS_BY_ID (id=1)`.

## SET

Specifies the value of a variable. The variable is available within the scope of the executing query batch.

~~~sql
SET variable = value
~~~

User-defined variable names must be prefixed with an 'at' symbol (`@`) and the value must be a literal value. The variable can be used within `SELECT` clauses within the same query batch. A `SET` statement without a `SELECT` statement is invalid.

System parameters can also be set temporarily for a query batch and are prefixed with a dollar sign (`$`).

**Related**: `SHOW VARIABLES` and `SHOW PARAMETER`

## SHOW COLUMNS

List the columns in a relation along with their data types. Without any modifiers, `SHOW COLUMNS` reads only a single morsel of data before returning results.

~~~sql
SHOW [EXTENDED] [FULL] COLUMNS
FROM relation
 FOR period
~~~

### EXTENDED modifier

The `EXTENDED` modifier includes summary statistics about the columns. These statistics take longer to compute and require more memory than the standard summary information. The summary information varies depending on column types and values.

### FULL modifier

The `FULL` modifier uses the entire dataset to return complete column information, rather than just the first morsel from the dataset.

## SHOW CREATE VIEW

Show an approximation of the SQL to create a specified relation.

~~~sql
SHOW CREATE VIEW view
~~~

Returns the SQL (including comments) which is executed when the view is accessed.

<!---

## SHOW CREATE TABLE

Show an approximation of the SQL to create a specified relation.

~~~sql
SHOW CREATE TABLE table
 FOR period
~~~

The SQL generated by this statement is unlikely to work with any SQL engine to create the table without some manual intervention and edits. It is intended to reduce the effort required to obtain this SQL, not eliminate it entirely.

### FOR clause

~~~
FOR date
~~~
~~~
FOR DATES BETWEEN start AND end
~~~
~~~
FOR DATES IN range
~~~

The `FOR` clause is a non-standard clause which filters data by the date it was recorded for. When provided, `FOR` clauses must directly follow the relation name. If not provided, `FOR TODAY` is assumed.

## SHOW FUNCTIONS

List the functions and aggregators supported by the engine.

~~~sql
SHOW FUNCTIONS
LIKE pattern
~~~

### LIKE clause

~~~
LIKE pattern
~~~

A case-insensitive `LIKE` clause to filter the results to the desired subset by the function name. This does not require a left-hand operator, it will always filter by the function name.

## SHOW PARAMETER

Display the value of a given configuration setting.

~~~sql
SHOW PARAMETER parameter
~~~

## SHOW DATABASES

Display the set of configured data stores.

~~~sql
SHOW DATABASES
~~~

## SHOW VARIABLES

List the variables set in the query batch.

~~~sql
SHOW VARIABLES
LIKE pattern
~~~

### LIKE clause

~~~
LIKE pattern
~~~

A case-insensitive `LIKE` clause to filter the results to the desired subset by the variable name. This does not require a left-hand operator, it will always filter by the variable name.

**Related**: `SET`

## USE :octicons-beaker-24:  

This statement currently has no effect.

~~~sql
USE database
~~~


--->