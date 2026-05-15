---
title: TIMESTAMP AS OF (Time Travel) — Opteryx Reference
description: SQL TIMESTAMP AS OF syntax and examples for querying historical data using time travel in Opteryx
---

# TIMESTAMP AS OF (Time Travel)

The `TIMESTAMP AS OF` clause enables time-scoped queries, allowing you to query data as it existed at a specific point in time. This feature is supported in contexts where time-travel capabilities are available.

## Basic Syntax

~~~sql
SELECT ...
  FROM table_name TIMESTAMP AS OF <timestamp_expression>
 WHERE ...;
~~~

The timestamp expression can be a literal value or a function result.

## Examples

### Query with Timestamp Literal
~~~sql
SELECT * FROM $planets TIMESTAMP AS OF '2024-12-15 00:00:00';
~~~

### Query with Interval Offset
~~~sql
SELECT * FROM $planets TIMESTAMP AS OF INTERVAL '1' DAY;
~~~

### Query with Calculated Date Expression
~~~sql
SELECT * FROM $planets TIMESTAMP AS OF CURRENT_DATE - INTERVAL '7' DAY;
~~~

### Query with Current Timestamp Offset
~~~sql
SELECT * FROM customers TIMESTAMP AS OF CURRENT_TIMESTAMP - INTERVAL '30' DAY
 WHERE country = 'USA';
~~~

## Timestamp Formats

Common timestamp formats accepted:
- ISO 8601: `2024-01-15T10:30:00Z`
- Date only: `2024-01-15` (defaults to start of day)
- With timezone: `2024-01-15 10:30:00 UTC`

## Notes

- Time travel functionality depends on the underlying data store's capabilities.
- Not all data sources support historical querying.
- Querying at very old timestamps may not be possible depending on data retention policies.
- See [Advanced Topics: Time Travel Queries](../advanced/adv-time-travel.md) for more details.
