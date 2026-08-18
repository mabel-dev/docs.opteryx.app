---
title: INTERVAL — Opteryx Type
description: INTERVAL
---

# INTERVAL

A duration or period of time. Written as `INTERVAL 'value' UNIT` where UNIT is one of `DAY`, `MONTH`, `YEAR`, `HOUR`, `MINUTE`, `SECOND`, or `MICROSECOND`.

## Example

```sql
SELECT INTERVAL '7' DAY;
```

## Casting

| From | Example | Notes |
|------|---------|-------|
| to VARCHAR | `(INTERVAL '1' DAY)::VARCHAR` | Renders as an ISO-8601 duration by default, e.g. 'P1DT2H30M' |
| to VARCHAR (FORMAT) | `CAST(INTERVAL '1' DAY AS VARCHAR FORMAT 'DD HH24:MI:SS')` | Renders against an explicit SQL-style pattern; tokens (YYYY, MM, DD, HH24, MI, SS, FF) are reinterpreted as duration magnitudes (years/months-remainder/days/hours/minutes/seconds), not calendar fields |

## Arithmetic

| Expression | Result Type | Description |
|------------|-------------|-------------|
| `INTERVAL '1' DAY + INTERVAL '2' HOUR` | INTERVAL | Add two intervals |
| `date_col + INTERVAL '1' MONTH` | TIMESTAMP | Shift a date forward |
| `ts_col - INTERVAL '30' MINUTE` | TIMESTAMP | Shift a timestamp back |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `INTERVAL`.

## Notes

Sub-month components (days, hours, minutes, seconds, microseconds) are stored as a microsecond count. Month and year components are stored separately and applied calendar-accurately during arithmetic. You cannot mix month-based and sub-month intervals in a single expression.

## Limitations

- There is no INTERVAL literal that combines months and days in one expression (e.g. '1 month 3 days' is not supported). Use separate additions.
- CAST(literal AS INTERVAL) is rejected. INTERVAL can only be cast TO VARCHAR (see cast_to above); it cannot be cast FROM another type.
- CAST ... FORMAT is not yet supported combined with TRY_CAST/SAFE_CAST.

## See Also

- [Working with timestamps](../advanced/adv-working-with-timestamps) — worked examples.
