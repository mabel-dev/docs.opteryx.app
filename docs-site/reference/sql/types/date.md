---
title: DATE — Opteryx Type
description: DATE
---

# DATE

A calendar date with no time component. Stored as the number of days since 1970-01-01.

## Example

```sql
SELECT '2024-01-01'::DATE;
```

## Accepted String Formats

When casting a string to this type, the following formats are accepted:

| Format | Example | Notes |
|--------|---------|-------|
| `YYYY-MM-DD` | `'2024-01-15'::DATE` | Only this format is accepted — ISO 8601 date |

## Casting

| From | Example | Notes |
|------|---------|-------|
| from VARCHAR | `'2024-01-15'::DATE` | String must be in YYYY-MM-DD format |
| from TIMESTAMP | `ts_col::DATE` | Truncates the time component; returns the date portion only |

## Arithmetic

| Expression | Result Type | Description |
|------------|-------------|-------------|
| `date_col + INTERVAL '7' DAY` | TIMESTAMP | Add a duration to a date |
| `date_col - INTERVAL '1' MONTH` | TIMESTAMP | Subtract a duration |
| `date_col - other_date` | INTERVAL | Difference between two dates |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `DATE`, `TIMESTAMP`.

## Limitations

- You cannot cast an integer to DATE directly. Use a function like `DATE_FROM_UNIX_EPOCH(n)` instead.
- Only YYYY-MM-DD string format is accepted. Formats like MM/DD/YYYY or DD-MM-YYYY will fail.
