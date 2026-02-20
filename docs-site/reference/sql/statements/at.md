---
title: AT Clause (Time Travel) — Opteryx Reference
description: SQL AT clause syntax and examples for querying historical data using time travel in Opteryx
---

# AT (Time Travel)

The `AT` clause enables time-scoped queries, allowing you to query data as it existed at a specific point in time. This feature is supported in contexts where time-travel capabilities are available.

## Basic Syntax

### AT Clause with TIMESTAMP

```sql
SELECT ...
  FROM table_name AT (TIMESTAMP => '<timestamp_value>')
 WHERE ...;
```

### TIMESTAMP AS OF Clause

```sql
SELECT ...
  FROM table_name TIMESTAMP AS OF <timestamp_expression>
 WHERE ...;
```

## Examples

### Query Data at a Specific Time (AT Clause)
```sql
SELECT * FROM orders AT (TIMESTAMP => '2024-01-15T10:30:00Z');
```

### Query with Timestamp Literal (TIMESTAMP AS OF)
```sql
SELECT * FROM $planets TIMESTAMP AS OF '2024-12-15 00:00:00';
```

### Query with Interval Offset (TIMESTAMP AS OF)
```sql
SELECT * FROM $planets TIMESTAMP AS OF INTERVAL '1' DAY;
```

### Query with Calculated Date Expression (TIMESTAMP AS OF)
```sql
SELECT * FROM $planets TIMESTAMP AS OF CURRENT_DATE - INTERVAL '7' DAY;
```

### Query with Date Truncation (TIMESTAMP AS OF)
```sql
SELECT * FROM $planets TIMESTAMP AS OF DATE_TRUNC('month', CURRENT_DATE);
```

### AT Clause with Named Parameter
```sql
SELECT * FROM $planets AT(TIMESTAMP => '2024-12-15 00:00:00');
```

### Compare Current vs. Historical Data
```sql
SELECT 
  o_current.order_id,
  o_current.status AS current_status,
  o_historical.status AS status_on_2024_01_01
FROM orders o_current
LEFT JOIN orders AT (TIMESTAMP => '2024-01-01T00:00:00Z') o_historical
  ON o_current.order_id = o_historical.order_id;
```

### Recent Changes Analysis
```sql
SELECT * 
FROM customers 
AT (TIMESTAMP => CURRENT_TIMESTAMP - INTERVAL 7 DAY)
WHERE country = 'USA';
```

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
