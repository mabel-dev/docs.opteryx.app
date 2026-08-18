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
| `YYYY-MM-DD` | `'2024-01-15'::DATE` | ISO 8601 date; components are not required to be zero-padded (e.g. '2024-1-5' is also accepted) |

## Casting

| From | Example | Notes |
|------|---------|-------|
| from VARCHAR | `'2024-01-15'::DATE` | String must be in YYYY-MM-DD (or unpadded YYYY-M-D) format by default |
| from VARCHAR (FORMAT) | `CAST('15-01-2024' AS DATE FORMAT 'DD-MM-YYYY')` | Parses against an explicit SQL-style pattern (tokens: YYYY, YY, MM, DD, HH24, HH12/HH, MI, SS, FF) instead of the YYYY-MM-DD default |
| from TIMESTAMP | `ts_col::DATE` | Truncates the time component; returns the date portion only |
| from INTEGER (literal only) | `1::DATE` | An integer *literal* is interpreted as days since the Unix epoch. This does NOT work for an integer column — casting a column raises NotImplementedError; convert via `FROM_UNIXTIME(n)::DATE` instead |
| to VARCHAR | `date_col::VARCHAR` | Renders as 'YYYY-MM-DD' (ISO 8601). `CAST(date_col AS VARCHAR FORMAT '...')` renders against an explicit pattern instead |

## Arithmetic

| Expression | Result Type | Description |
|------------|-------------|-------------|
| `date_col + INTERVAL '7' DAY` | TIMESTAMP | Add a duration to a date |
| `date_col - INTERVAL '1' MONTH` | TIMESTAMP | Subtract a duration |
| `date_col - other_date` | INTERVAL | Difference between two dates |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `DATE`, `TIMESTAMP`.

## Limitations

- You cannot cast an integer COLUMN to DATE directly (only integer literals are accepted). To convert an epoch column, cast to TIMESTAMP first then to DATE: `FROM_UNIXTIME(n)::DATE`.
- MM/DD/YYYY or DD-MM-YYYY string formats fail against the default parser — use `CAST(... AS DATE FORMAT 'MM/DD/YYYY')` (or the matching pattern) instead.
- CAST ... FORMAT is not yet supported combined with TRY_CAST/SAFE_CAST.

## See Also

- [Working with timestamps](../advanced/adv-working-with-timestamps.md) — worked examples.
