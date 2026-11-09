# Opteryx SQL Guide for Agents

How to write SQL that Opteryx runs on the first try. Written for language models
and the people prompting them. Every SQL block in this file is executed against
Opteryx Core before it is published.

- Verified against: opteryx-core 0.9.197
- Length: about 5,000 tokens
- Short version (about 1,200 tokens, for small models): https://docs.opteryx.app/opteryx-sql-guide-short.md
- Full reference: https://docs.opteryx.app/docs/reference/sql/introduction

Opteryx is a columnar SQL engine. Its SQL is close to PostgreSQL but is not
PostgreSQL: some functions are missing, some spellings differ, and a few
behaviours are different on purpose. When you are unsure whether something
exists, run `SHOW FUNCTIONS` or check the lists below rather than assuming.

## Rules That Prevent Most Errors

1. Strings use single quotes: `'Earth'`. Double quotes and backticks name a
   column or table. `"Earth"` is a column called Earth.
2. Use `LIMIT n`, never `SELECT TOP n`.
3. Write dates as `CAST('2024-05-17' AS DATE)`. `DATE '2024-05-17'` is refused.
4. Write intervals as `INTERVAL '7' DAY`, never `INTERVAL '7 days'`.
5. `/` keeps the fraction (`7 / 2` is `3.5`). Use `DIV` for integer
   division.
6. Arrays are 0-indexed: `SPLIT('a,b,c', ',')[0]` is `'a'`.
7. There is no `STRING_AGG`, `DATE_ADD` or `FILTER (WHERE ...)`. Use
   `ARRAY_AGG`, `+ INTERVAL`, and `SUM(x WHERE cond)`.
8. Send one statement per call.
9. Look up a dataset's columns before you query it, and use the names exactly.
10. Aggregate in SQL. Ask for the answer, not for raw rows to count yourself.

## Naming Datasets

What goes after `FROM` depends on where Opteryx is running.

| Where | Name in `FROM` | Example |
| --- | --- | --- |
| Built-in sample data, anywhere | `$planets` | `SELECT name FROM $planets` |
| Opteryx Core with a disk workspace | `workspace.folder` | `data.planets` reads `./data/planets/` |
| Opteryx Studio (hosted) | `workspace.collection.dataset` | `acme.sales.orders` |
| A single file, by path | `READ_PARQUET('path')` | `READ_PARQUET('data/planets/planets.parquet')` |

- A dataset is a folder of files, not a file. Parquet, JSON Lines and Skene
  folders work as datasets. CSV does not: read it with `READ_CSV('file.csv')`.
- A quoted file path is not a table name. `FROM 'data/planets/planets.parquet'`
  fails; wrap the path in `READ_PARQUET`, `READ_JSONL` or `READ_CSV`.
- Paths in `READ_*` functions can use globs: `READ_PARQUET('data/planets/*.parquet')`.
- In Opteryx Studio, always use the full three-part name. There is no `USE` or
  `search_path`.

```sql
SELECT name, diameter
  FROM data.planets
 ORDER BY diameter DESC
 LIMIT 3;
```

```sql
SELECT COUNT(*)
  FROM READ_PARQUET('data/planets/*.parquet');
```

## Quoting and Identifiers

| You want | Write | Not |
| --- | --- | --- |
| A string | `'Earth'` | `"Earth"` |
| A quote inside a string | `'it''s'` | `'it\'s'` |
| A column with capitals or spaces | `"planetId"`, `"Planet Name"` | `'planetId'` |
| A built-in dataset | `$planets` | `planets` |

- Opteryx Core matches column names without regard to case, so `planetId`,
  `planetid` and `"planetId"` all find the same column. Still write the name as
  the schema shows it: other Opteryx deployments and other engines are stricter.
- A table alias replaces the table name. After `FROM $planets AS p`, write
  `p.name`, not `planets.name`.
- Quote a column that shares a name with a keyword: `"order"`, `"group"`.

```sql
SELECT s.name AS moon, p.name AS "Planet Name"
  FROM data.satellites AS s
  JOIN data.planets AS p ON p.id = s."planetId"
 WHERE p.name = 'Earth';
```

## Supported Statements

Reading data:

- `SELECT` with `DISTINCT`, `FROM`, `JOIN`, `WHERE`, `GROUP BY`, `HAVING`,
  `QUALIFY`, `WINDOW`, `ORDER BY` (with `NULLS FIRST`/`NULLS LAST`), `LIMIT`,
  `OFFSET`
- `WITH` (common table expressions), `UNION` and `UNION ALL`, subqueries
- `SELECT * EXCEPT (column, ...)` to drop columns
- `EXPLAIN` to see a plan without running the query

Finding out what exists:

- `SHOW COLUMNS FROM dataset` lists the columns and their types
- `SHOW FUNCTIONS` lists every function the engine has

Changing data (Opteryx Studio and catalog-backed workspaces only): `CREATE TABLE`,
`CREATE TABLE ... AS SELECT`, `INSERT`, `UPDATE`, `DELETE`, `MERGE`,
`TRUNCATE TABLE`, `DROP TABLE`, views, materialized views and grants. Never run
one of these unless the user asked for that change.

Joins: `JOIN`/`INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL JOIN`,
`CROSS JOIN`, `CROSS JOIN UNNEST(...)`, `NATURAL JOIN`, `LEFT SEMI JOIN` and
`LEFT ANTI JOIN`. Joins on `<`, `>` and `!=` work. `RIGHT SEMI` and
`RIGHT ANTI` do not exist.

```sql
SHOW COLUMNS FROM data.satellites;
```

```sql
SELECT name
  FROM $planets
 WHERE name ILIKE 'm%';
```

## Functions

Run `SHOW FUNCTIONS` for the complete list with descriptions. The common ones:

- **Aggregate:** `COUNT(*)`, `COUNT(x)`, `COUNT(DISTINCT x)`, `SUM`, `AVG`,
  `MIN`, `MAX`, `MEDIAN`, `STDDEV`, `VAR_POP`, `VAR_SAMP`, `CORR`,
  `APPROX_COUNT_DISTINCT`, `APPROX_PERCENTILE`,
  `PERCENTILE_CONT(f) WITHIN GROUP (ORDER BY x)`, `ARRAY_AGG`, `ANY_VALUE`
- **Window:** `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `NTILE`, `LAG`, `LEAD`,
  `FIRST_VALUE`, `LAST_VALUE`, `NTH_VALUE`, `PERCENT_RANK`, `CUME_DIST`, and
  any aggregate with `OVER (...)`
- **String:** `LOWER`, `UPPER`, `LENGTH`, `TRIM`, `LTRIM`, `RTRIM`, `LEFT`,
  `RIGHT`, `SUBSTRING(s FROM start FOR len)`, `REPLACE`, `SPLIT`, `CONCAT`,
  `CONCAT_WS`, `LPAD`, `RPAD`, `POSITION(x IN s)`, `INITCAP`, `REVERSE`, `LEVENSHTEIN`, `SOUNDEX`
- **Number:** `ROUND(x, places)`, `FLOOR`, `CEIL`, `TRUNC`, `ABS`, `SIGN`,
  `SQRT`, `POWER`, `LOG`, `PI`, `RANDOM`
- **Date and time:** `NOW()`, `CURRENT_DATE`, `CURRENT_TIMESTAMP`,
  `EXTRACT(part FROM ts)`, `DATE_TRUNC('month', ts)`, `DATEDIFF('days', a, b)`,
  `TIME_BUCKET(n, 'unit', ts)`, `FORMAT_TIMESTAMP('%Y-%m', ts)`,
  `FROM_UNIXTIME`, `UNIXTIME`
- **Null handling and logic:** `COALESCE`, `IFNULL`, `NULLIF`, `IIF(cond, a, b)`,
  `CASE WHEN ... THEN ... ELSE ... END`
- **Conversion:** `CAST(x AS type)`, `TRY_CAST(x AS type)` (NULL instead of an
  error), `x::type`
- **Hashing and encoding:** `HASH`, `MD5`, `SHA256`, `BASE64_ENCODE`,
  `HEX_ENCODE` and their decoders

Types for `CAST`: `BOOLEAN`, `INTEGER`, `FLOAT`, `DECIMAL(precision, scale)`,
`VARCHAR`, `DATE`, `TIME`, `TIMESTAMP`, `INTERVAL`, `VARBINARY`, `UUID`, `IPV4`.

Operators: `=`, `!=`, `<>`, `<`, `<=`, `>`, `>=`, `AND`, `OR`, `NOT`, `XOR`,
`+`, `-`, `*`, `/`, `DIV`, `%`, `||` (concatenate), `LIKE`, `ILIKE`
(case-insensitive), `RLIKE` (regular expression), `IN (...)`,
`BETWEEN ... AND ...`, `IS NULL`, `IS DISTINCT FROM`, `->` and `->>` (JSON),
`@>` (array contains).

```sql
SELECT EXTRACT(year FROM NOW()) AS this_year,
       DATE_TRUNC('month', NOW()) AS month_start,
       NOW() - INTERVAL '7' DAY AS a_week_ago;
```

```sql
SELECT SUM(radius WHERE radius > 100) AS big_moon_radius,
       COUNT(* WHERE radius > 100) AS big_moons
  FROM data.satellites;
```

## Differences From PostgreSQL and ANSI SQL

| PostgreSQL or ANSI | Opteryx |
| --- | --- |
| `SELECT TOP 5 ...` (SQL Server) | `... LIMIT 5` |
| `DATE '2024-05-17'`, `TIMESTAMP '...'` | `CAST('2024-05-17' AS DATE)` |
| `INTERVAL '7 days'` | `INTERVAL '7' DAY` |
| `7 / 2` is `3` for integers | `7 / 2` is `3.5`; `7 DIV 2` is `3` |
| `current_date + 1` | `CURRENT_DATE + INTERVAL '1' DAY` |
| `DATE_ADD(ts, INTERVAL ...)` | `ts + INTERVAL '1' DAY` |
| `EXTRACT(dow FROM ts)` | Not available. Parts are year, quarter, month, day, hour, minute, second, epoch |
| `STRING_AGG(x, ',')` | `ARRAY_AGG(x)` with a `GROUP BY` |
| `SUM(x) FILTER (WHERE c)` | `SUM(x WHERE c)` |
| `GREATEST(a, b)` | `GREATEST(array)`, for example `GREATEST([a, b])` |
| `arr[1]` is the first element | `arr[0]` is the first element |
| `string_to_array(s, ',')` | `SPLIT(s, ',')` |
| `GROUPING SETS`, `CUBE` | `ROLLUP` only |
| `SIMILAR TO` | `RLIKE` (regular expressions) |
| `FOR SYSTEM_TIME AS OF` | `TIMESTAMP AS OF` |
| `FROM 'file.parquet'` (DuckDB) | `FROM READ_PARQUET('file.parquet')` |

Other behaviour to know:

- `ARRAY_AGG` and `ANY_VALUE` need a `GROUP BY`.
- `ARRAY_AGG(x ORDER BY y)` can only order by `x` itself.
- `NULL || 'text'` is `NULL`, as in PostgreSQL. Use `COALESCE` first.
- `LIKE` is case-sensitive. Use `ILIKE`, or compare `LOWER(column)`.
- Comparing a number column with a string (`mass > '100'`) is an error, not a
  silent conversion. Write the number without quotes.
- `GROUP BY` and `ORDER BY` accept column aliases and positions (`ORDER BY 2`).

```sql
SELECT 7 / 2 AS divided, 7 DIV 2 AS integer_divided, 7 % 2 AS remainder;
```

```sql
SELECT "planetId", ARRAY_AGG(name) AS moons
  FROM data.satellites
 WHERE "planetId" IN (3, 4)
 GROUP BY "planetId";
```

## Time Travel

Catalog-backed tables keep a snapshot for every commit, and you can read a
table as it was. This works in Opteryx Studio and other catalog-backed
workspaces. Plain files and disk folders have no history: on those, `VERSION AS
OF` and `SHOW SNAPSHOTS FOR` fail.

The time-travel clause goes straight after the table name, before any alias.

Syntax:

```text
SELECT ... FROM table TIMESTAMP AS OF <timestamp expression> [AS alias]
SELECT ... FROM table VERSION AS OF <snapshot_id | 'tag' | PREVIOUS | CURRENT> [AS alias]
SHOW SNAPSHOTS FOR table
```

- `TIMESTAMP AS OF` reads the most recent snapshot committed at or before that
  time. The expression can use `NOW()`, `CURRENT_DATE` and intervals but not
  columns. Times are UTC.
- `VERSION AS OF PREVIOUS` reads the previous version of the data, skipping
  maintenance commits that changed no rows.
- `VERSION AS OF` with a number reads that snapshot id, as listed by
  `SHOW SNAPSHOTS FOR`. A quoted name reads a tagged snapshot.
- Untagged snapshots are cleaned up over time, so an old timestamp may stop
  resolving.

In these examples `lake.demo.planets` is a catalog-backed table.

```sql
SHOW SNAPSHOTS FOR lake.demo.planets;
```

```sql
SELECT COUNT(*)
  FROM lake.demo.planets VERSION AS OF PREVIOUS;
```

```sql
SELECT COUNT(*)
  FROM lake.demo.planets TIMESTAMP AS OF NOW() - INTERVAL '1' SECOND;
```

Compare two versions of a table by joining it to itself:

```sql
SELECT now_.name
  FROM lake.demo.planets AS now_
  LEFT ANTI JOIN lake.demo.planets VERSION AS OF PREVIOUS AS before_
    ON before_.id = now_.id;
```

## Common Errors and Fixes

Each block shows a query that fails, the error it gets, and the query that works.

**Column cannot be found.** Usually a string written in double quotes, or a
misspelled column. The error suggests the closest real column.

```sql
-- Wrong: SELECT name FROM $planets WHERE name = "Earth"
-- Error: ColumnNotFoundError
SELECT name FROM $planets WHERE name = 'Earth';
```

**Dataset cannot be found.** The name is not qualified, is misspelled, or is a
file path used as a table.

```sql
-- Wrong: SELECT name FROM 'data/planets/planets.parquet'
-- Error: DatasetNotFoundError
SELECT name FROM READ_PARQUET('data/planets/planets.parquet');
```

**TOP is not supported.**

```sql
-- Wrong: SELECT TOP 3 name FROM $planets
-- Error: UnsupportedSyntaxError
SELECT name FROM $planets LIMIT 3;
```

**Type-prefixed literals are not supported.**

```sql
-- Wrong: SELECT DATE '2024-05-17'
-- Error: UnsupportedSyntaxError
SELECT CAST('2024-05-17' AS DATE);
```

**INTERVAL needs a unit.**

```sql
-- Wrong: SELECT NOW() - INTERVAL '7 days'
-- Error: QueryParseError
SELECT NOW() - INTERVAL '7' DAY;
```

**DATE and INTEGER do not work together.**

```sql
-- Wrong: SELECT CURRENT_DATE + 1
-- Error: IncorrectTypeError
SELECT CURRENT_DATE + INTERVAL '1' DAY;
```

**Types do not match.** A number column compared with a quoted value.

```sql
-- Wrong: SELECT name FROM $planets WHERE mass > '100'
-- Error: IncompatibleTypesError
SELECT name FROM $planets WHERE mass > 100;
```

**Column must appear in the GROUP BY clause.**

```sql
-- Wrong: SELECT name, MAX(mass) FROM $planets
-- Error: SqlError
SELECT name, mass FROM $planets ORDER BY mass DESC LIMIT 1;
```

**Function cannot be found.** The function belongs to another engine.

```sql
-- Wrong: SELECT STRING_AGG(name, ', ') FROM $planets
-- Error: FunctionNotFoundError
SELECT number_of_moons > 0 AS has_moons, ARRAY_AGG(name) AS planets
  FROM $planets
 GROUP BY has_moons;
```

**FILTER is not supported.**

```sql
-- Wrong: SELECT COUNT(*) FILTER (WHERE radius > 100) FROM data.satellites
-- Error: UnsupportedSyntaxError
SELECT COUNT(* WHERE radius > 100) FROM data.satellites;
```

**Dataset is referenced but does not appear in FROM.** An alias replaced the
table name.

```sql
-- Wrong: SELECT name FROM $planets AS p WHERE planets.id = 3
-- Error: UnexpectedDatasetReferenceError
SELECT name FROM $planets AS p WHERE p.id = 3;
```

**Statement could not be parsed.** Check for a missing comma, an unclosed
quote or bracket, or a statement cut short.

```sql
-- Wrong: SELECT name FROM $planets WHERE id = 3 AND
-- Error: QueryParseError
SELECT name FROM $planets WHERE id = 3;
```

A filter on a value that is spelled differently from the data returns zero
rows without an error. If a filter on text finds nothing, look at the values
that exist (`SELECT DISTINCT column ... LIMIT 20`) before you answer "none".

## Copy-Paste Examples

These use `$planets`, which every Opteryx has, and `data.planets` and
`data.satellites`, the sample datasets from the
[local AI guide](https://docs.opteryx.app/docs/guides/local-ai-with-ollama).

Top N:

```sql
SELECT name, radius
  FROM data.satellites
 ORDER BY radius DESC
 LIMIT 5;
```

Count per group, largest first. After a `LEFT JOIN`, count a column from the
right-hand table: `COUNT(*)` counts a row with no match as 1.

```sql
SELECT p.name, COUNT(s.id) AS moons
  FROM data.planets AS p
  LEFT JOIN data.satellites AS s ON s."planetId" = p.id
 GROUP BY p.name
 ORDER BY moons DESC;
```

Filter groups with HAVING:

```sql
SELECT "planetId", COUNT(*) AS moons
  FROM data.satellites
 GROUP BY "planetId"
HAVING COUNT(*) >= 10;
```

Largest item in each group with QUALIFY:

```sql
SELECT p.name AS planet, s.name AS largest_moon, s.radius
  FROM data.planets AS p
  JOIN data.satellites AS s ON s."planetId" = p.id
QUALIFY ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY s.radius DESC) = 1
 ORDER BY s.radius DESC;
```

Share of a total with a window:

```sql
SELECT name, ROUND(mass / SUM(mass) OVER (), 3) AS share_of_mass
  FROM $planets
 ORDER BY share_of_mass DESC;
```

Compare with one row using a subquery:

```sql
SELECT name, ROUND(mass / (SELECT mass FROM $planets WHERE name = 'Earth'), 2) AS earth_masses
  FROM $planets
 ORDER BY earth_masses DESC;
```

Rows with no match, using an anti-join:

```sql
SELECT p.name
  FROM data.planets AS p
  LEFT ANTI JOIN data.satellites AS s ON s."planetId" = p.id;
```

Bucket values with CASE:

```sql
SELECT CASE WHEN radius >= 1000 THEN 'large'
            WHEN radius >= 100 THEN 'medium'
            ELSE 'small' END AS size,
       COUNT(*) AS moons
  FROM data.satellites
 GROUP BY size;
```

Build a step with a CTE:

```sql
WITH giants AS (
    SELECT id, name FROM data.planets WHERE mass > 100
)
SELECT g.name, COUNT(*) AS moons
  FROM giants AS g
  JOIN data.satellites AS s ON s."planetId" = g.id
 GROUP BY g.name;
```

Subtotals with ROLLUP:

```sql
SELECT number_of_moons > 0 AS has_moons, COUNT(*) AS planets
  FROM $planets
 GROUP BY ROLLUP (has_moons);
```

Case-insensitive text search:

```sql
SELECT name
  FROM data.satellites
 WHERE name ILIKE '%io%';
```

Generate a range of dates:

```sql
SELECT *
  FROM GENERATE_SERIES(CAST('2024-01-01' AS DATE), CAST('2024-01-07' AS DATE), INTERVAL '1' DAY);
```

Expand a literal array into rows:

```sql
SELECT colour
  FROM UNNEST(['red', 'green', 'blue']) AS colour;
```

Expand an array a query produces with `CROSS JOIN UNNEST`. `FROM UNNEST(...)`
only takes a literal array, not a function call or a column:

```sql
SELECT m."planetId", moon
  FROM (SELECT "planetId", ARRAY_AGG(name) AS moons
          FROM data.satellites
         WHERE "planetId" = 4
         GROUP BY "planetId") AS m
 CROSS JOIN UNNEST(m.moons) AS moon;
```

Read a value out of JSON text:

```sql
SELECT '{"planet": "Mars", "moons": 2}'->>'planet' AS planet;
```

See the plan without running the query:

```sql
EXPLAIN SELECT name FROM $planets WHERE id = 3;
```
