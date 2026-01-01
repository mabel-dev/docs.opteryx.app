# Supported SQL

This page summarizes the SQL syntax and features supported by Opteryx. It collects the principal reference sections from the repository: statements, expressions, functions, data types, joins and aggregates. For full, deep reference see the individual pages linked throughout.

## Overview

Opteryx supports a broad, pragmatic subset of SQL inspired by common engines (MySQL, DuckDB, Postgres). Support focuses on useful, file-oriented ad-hoc querying rather than full RDBMS compatibility.

Key supported features:

- `SELECT` with `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY`, `LIMIT`, `OFFSET`
- `JOIN` types: `INNER`, `LEFT` (including `ANTI` and `SEMI`), `RIGHT`, `FULL`, `CROSS`
- Set operations: `UNION` (with `ALL`), `INTERSECT`, `EXCEPT`
- Common Table Expressions (`WITH` / CTEs)
- Window functions and aggregates (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, etc.)
- Expressions: logical (`AND`, `OR`, `XOR`, `NOT`), comparison, `LIKE`/`ILIKE`, regex, `BETWEEN`, `CASE`
- Functions: extensive set of date/time, string, numeric, array and JSON helpers (see full list on the Functions page)
- Data modification statements for ad-hoc workflows: `INSERT`, `UPDATE`, `DELETE` (limited by data source semantics)

## SELECT / Statements

SELECT supports the usual projection and filtering forms:

```sql
[ <statement> UNION [ ALL ] ... ]

SELECT [ DISTINCT ] [ ON ( <columns> ) ] <expression> [, ...]
       | [ * EXCEPT ( <columns> ) ]
  FROM { <relation> | <function> | (<subquery>) } AS <alias>
  [ FOR <period> ]
  [ JOIN ... ]
  WHERE <condition>
  GROUP BY [ ALL | <expression> [, ...] ]
  HAVING <condition>
  ORDER BY <expression> [, ...]
  LIMIT <limit>
  OFFSET <offset>
```

- `DISTINCT` and `DISTINCT ON (cols)` are supported.
- `EXCEPT` in `SELECT * EXCEPT(col, ...)` is supported for column exclusion in projection.
- `FOR` clauses are used for time-travel and date-scoped queries (see Time Travel docs).

See [Statements](/docs/reference/sql/statements) for more examples and syntax details.

## Joins

Supported join syntaxes include both comma-style and explicit `JOIN` forms. Available join kinds:

- `INNER JOIN`
- `LEFT [OUTER | ANTI | SEMI] JOIN`
- `RIGHT [OUTER] JOIN`
- `FULL [OUTER] JOIN`
- `CROSS JOIN`

Join conditions use `ON` (or `USING` where appropriate); `ON` and `USING` are mutually exclusive.

Example (inner join):

```sql
SELECT a.*, b.name
  FROM orders a
  INNER JOIN customers b
    ON a.customer_id = b.id;
```

See [Joins](/docs/reference/sql/joins) for diagrams and additional examples.

## Expressions and Operators

Expressions are composed from column references, literals, operators and functions. Supported operators include:

- Logical: `AND`, `OR`, `XOR`, `NOT`
- Comparison: `=`, `<>`, `<`, `>`, `<=`, `>=`, `IN`, `NOT IN`, `IS` (for `NULL`/`TRUE`/`FALSE`)
- Pattern/regex: `LIKE`, `ILIKE`, `RLIKE` (and aliases `~`, `SIMILAR TO`)
- Bitwise/IP: `|`, `&`, `^` and IP containment operations

`CASE` expressions (simple and searched forms) are supported.

Example:

```sql
SELECT name,
       CASE WHEN numberOfMoons = 0 THEN 'none'
            WHEN numberOfMoons = 1 THEN 'one'
            ELSE 'many' END AS moon_label
  FROM $planets;
```

## Aggregates & Window Functions

Aggregates such as `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` are supported and used with `GROUP BY`. `HAVING` filters grouped results.

Window functions (e.g., `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)`) are supported for ranking and running calculations.

Example (group + window):

```sql
SELECT category,
       COUNT(*) AS cnt,
       SUM(amount) AS total
  FROM transactions
 GROUP BY category;

SELECT name, department, salary,
       ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rank
  FROM employees;
```

## Functions

Opteryx implements a large set of functions for conversion, date/time, string manipulation, arrays, JSON, and numeric math. A few examples:

- Casting: `CAST(x AS TYPE)`, `TRY_CAST`, `SAFE_CAST`
- Date/time: `CURRENT_DATE`, `CURRENT_TIMESTAMP`, `DATE_TRUNC`, `EXTRACT`, `FROM_UNIXTIME`, `UNIXTIME`
- String: `LOWER`, `UPPER`, `CONCAT`, `LENGTH`, `REGEXP_REPLACE`
- Array: `ARRAY[...]`, `ARRAY_CONTAINS`, `LENGTH(array)`, `SORT(array)`

Full function reference: [Functions](/docs/reference/sql/functions)

## Data Types

Supported basic data types include `INTEGER`, `FLOAT`, `VARCHAR`, `BOOLEAN`, `TIMESTAMP`, `DATE`, `TIME`, `VARBINARY`, `ARRAY`, `STRUCT` and `JSON`-like objects. See the Data Types reference for exact type behaviours and conversions.

See: [Data Types](/docs/reference/sql/data-types)

## Subqueries & CTEs

Scalar and correlated subqueries are supported, as are CTEs using `WITH`. Use CTEs to structure complex queries or to reuse computed sub-expressions.

Example CTE:

```sql
WITH monthly_sales AS (
  SELECT DATE_TRUNC('month', order_date) AS month,
         SUM(amount) AS total
    FROM orders
   GROUP BY 1
)
SELECT * FROM monthly_sales WHERE total > 10000;
```

## Set Operations

`UNION` (with `ALL`), `INTERSECT`, and `EXCEPT` are supported. `UNION` by default removes duplicates; use `UNION ALL` to keep them.

## DML (INSERT / UPDATE / DELETE)

Basic `INSERT`, `UPDATE`, and `DELETE` statements are supported where the underlying data store allows mutation. Behaviour may vary based on the storage backend.

## Additional Notes and Links

- For full statements syntax and examples see: [Statements](/docs/reference/sql/statements)
- For comprehensive function/operator lists see: [Functions](/docs/reference/sql/functions)
- For join diagrams and advanced examples see: [Joins](/docs/reference/sql/joins)
- For advanced topics like time travel, temp tables, arrays, and structs see the `adv-*` documents in `/sql-reference/`.

---

If you want, I can also expand this page by inlining the full content of each reference file (`statements.md`, `functions.md`, `expressions.md`, etc.) instead of summarizing — tell me which files to include in full.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
