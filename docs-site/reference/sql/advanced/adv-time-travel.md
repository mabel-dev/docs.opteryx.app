---
title: Time Travel Queries in Opteryx - Query Historical Data
description: Use Opteryx time travel to query data as it existed at a specific point in time using TIMESTAMP AS OF.
---

# Time Travel

Opteryx can query data as it existed at a specific point in time. For partitioned datasets this retrieves the snapshot for that date; for append-only datasets it filters to records written on or before that point.

```sql
SELECT *
  FROM my_table
   TIMESTAMP AS OF <expression>;
```

The expression after `AS OF` is evaluated at query time and must resolve to a timestamp. Any expression that produces a temporal value is accepted.

!!! Note
    - Data must be partitioned in a way that supports temporal queries (e.g. Mabel partitioning).
    - If no `TIMESTAMP AS OF` clause is provided, the query reads current data.
    - There is no implicit deduplication when data from multiple partitions is combined.

## Examples

**Query data as at a specific timestamp:**

```sql
SELECT *
  FROM my_table
   TIMESTAMP AS OF '2024-12-15 00:00:00'::TIMESTAMP;
```

**Query data from seven days ago:**

```sql
SELECT *
  FROM my_table
   TIMESTAMP AS OF CURRENT_DATE - INTERVAL '7' DAY;
```

**Query data from the start of the current month:**

```sql
SELECT *
  FROM my_table
   TIMESTAMP AS OF TRUNC(CURRENT_DATE, 'month');
```

**Query data from one day ago using an interval (interpreted as current time minus the interval):**

```sql
SELECT *
  FROM my_table
   TIMESTAMP AS OF INTERVAL '1' DAY;
```

## Using $planets

The built-in `$planets` relation has temporal support — it reflects which planets were known at the queried date. Uranus was discovered in 1781, Neptune in 1846, and Pluto in 1930.

```sql
SELECT name
  FROM $planets
   TIMESTAMP AS OF '1800-01-01'::TIMESTAMP;
```

Returns only the planets known before 1800 (Mercury, Venus, Earth, Mars, Jupiter, Saturn).

## Temporal Self-Joins

Two `TIMESTAMP AS OF` clauses on the same table let you compare snapshots. To find planets discovered between 1800 and today:

```sql
SELECT now.name
  FROM $planets TIMESTAMP AS OF CURRENT_DATE AS now
  LEFT ANTI JOIN $planets TIMESTAMP AS OF '1800-01-01'::TIMESTAMP AS then
    ON then.id = now.id;
```

## Limitations

- Temporal queries require a partition scheme that supports date-based partitioning. The default scheme does not.
- Timestamps are evaluated in UTC. A query run at midnight may return no data for the current day until records for that day are written.
- Backfilled data is visible: querying a past date returns the most recent data for that date, including any corrections applied after the fact.
