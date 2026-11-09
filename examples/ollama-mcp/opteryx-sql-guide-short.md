# Opteryx SQL: Short Guide

Opteryx SQL is close to PostgreSQL, with the differences below. Every example
here has been run against opteryx-core 0.9.197. Full guide:
https://docs.opteryx.app/opteryx-sql-guide.md

## Names

- Built-in sample data: `$planets`.
- Local folders: `data.planets` reads `./data/planets/`.
- Opteryx Studio: `workspace.collection.dataset`, always all three parts.
- A file by path: `READ_PARQUET('path/file.parquet')`, also `READ_JSONL`,
  `READ_CSV`. Never `FROM 'file.parquet'`.
- Run `SHOW COLUMNS FROM dataset` before querying, and use the column names it
  returns.

## Quoting

- Strings: single quotes, `'Earth'`. Escape a quote by doubling it: `'it''s'`.
- Double quotes name a column: `"planetId"`. `WHERE name = "Earth"` looks for
  a column called Earth.
- After `FROM $planets AS p`, write `p.name`, not `planets.name`.

## Differences From PostgreSQL

| Do not write | Write |
| --- | --- |
| `SELECT TOP 5 ...` | `... LIMIT 5` |
| `DATE '2024-05-17'` | `CAST('2024-05-17' AS DATE)` |
| `INTERVAL '7 days'` | `INTERVAL '7' DAY` |
| `CURRENT_DATE + 1` | `CURRENT_DATE + INTERVAL '1' DAY` |
| `DATE_ADD(...)` | `ts + INTERVAL '1' DAY` |
| `STRING_AGG(x, ',')` | `ARRAY_AGG(x)` with `GROUP BY` |
| `SUM(x) FILTER (WHERE c)` | `SUM(x WHERE c)` |
| `GREATEST(a, b)` | `GREATEST([a, b])` |
| `arr[1]` for the first item | `arr[0]` |
| `SIMILAR TO` | `RLIKE` |
| `GROUPING SETS`, `CUBE` | `ROLLUP` |
| `mass > '100'` | `mass > 100` |

- `7 / 2` is `3.5`. Use `7 DIV 2` for `3`.
- `LIKE` is case-sensitive; `ILIKE` is not.
- `ARRAY_AGG` and `ANY_VALUE` need a `GROUP BY`.
- `EXTRACT` parts: year, quarter, month, day, hour, minute, second, epoch.
- One statement per call.
- Unsure a function exists? Run `SHOW FUNCTIONS`.

## Useful Functions

`COUNT`, `COUNT(DISTINCT x)`, `SUM`, `AVG`, `MIN`, `MAX`, `MEDIAN`, `ROUND(x, 2)`,
`LOWER`, `UPPER`, `LENGTH`, `TRIM`, `SUBSTRING`, `REPLACE`, `SPLIT`, `COALESCE`,
`CASE WHEN`, `CAST`, `TRY_CAST`, `NOW()`, `CURRENT_DATE`, `EXTRACT`,
`DATE_TRUNC('month', ts)`, `DATEDIFF('days', a, b)`, `ROW_NUMBER() OVER (...)`,
`RANK() OVER (...)`.

## Time Travel

Only for catalog-backed tables, not plain files. The clause goes after the
table name:

```sql
SELECT COUNT(*) FROM lake.demo.planets VERSION AS OF PREVIOUS;
```

```sql
SELECT COUNT(*) FROM lake.demo.planets TIMESTAMP AS OF NOW() - INTERVAL '1' SECOND;
```

`SHOW SNAPSHOTS FOR table` lists the versions.

## Examples

```sql
SELECT name, diameter FROM data.planets ORDER BY diameter DESC LIMIT 3;
```

```sql
SELECT p.name, COUNT(s.id) AS moons
  FROM data.planets AS p
  LEFT JOIN data.satellites AS s ON s."planetId" = p.id
 GROUP BY p.name
 ORDER BY moons DESC;
```

```sql
SELECT p.name AS planet, s.name AS largest_moon
  FROM data.planets AS p
  JOIN data.satellites AS s ON s."planetId" = p.id
QUALIFY ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY s.radius DESC) = 1;
```

```sql
SELECT name FROM data.satellites WHERE name ILIKE '%io%';
```

## Errors

- *Column cannot be found*: a string in double quotes, or a misspelled column.
  The message suggests the right one.
- *Dataset cannot be found*: check the name with your dataset list, or wrap a
  file path in `READ_PARQUET`.
- *must appear in the GROUP BY clause*: add the column to `GROUP BY` or wrap
  it in an aggregate.
- *cannot be compared, because their types do not match*: remove quotes from
  numbers, or `CAST` one side.
- After a `LEFT JOIN`, count a right-hand column, `COUNT(s.id)`, not
  `COUNT(*)`, or rows with no match count as 1.
- A text filter that returns no rows may be spelled differently from the data.
  Check with `SELECT DISTINCT column ... LIMIT 20` before answering "none".
