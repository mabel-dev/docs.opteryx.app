---
title: INTERVAL — Opteryx Type
description: INTERVAL
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# INTERVAL

A duration or period of time. Written as `INTERVAL 'value' UNIT` where UNIT is one of `YEAR`, `MONTH`, `WEEK`, `DAY`, `HOUR`, `MINUTE`, `SECOND`, `MILLISECOND` or `MICROSECOND` (plurals such as `DAYS` are accepted). A range such as `INTERVAL '1 3' MONTH TO DAY` takes one value per unit, filled from the leading unit.

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
| `ts_col - other_ts_col` | INTERVAL | Elapsed time between two timestamps |
| `INTERVAL '1' MONTH * n` | INTERVAL | Scale by a number (either side); `ts + INTERVAL '1' MONTH * n` steps n months |
| `INTERVAL '1' MONTH / 2` | INTERVAL | Divide by a number: 15 days - a fractional month spills into days at 30 days per month |
| `-INTERVAL '1' DAY` | INTERVAL | Negate (same as `INTERVAL '-1' DAY`) |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `INTERVAL`.

## Notes

An interval is a (months, microseconds) pair: years and months are stored as months and applied calendar-accurately (months first, clamped to the month's last day, so Jan 31 + 1 month is Feb 29 in a leap year), then everything from weeks down is applied as an exact microsecond count. In a range, WEEK only counts when it is named as an end: `MONTH TO DAY` is months then days. Multiplying or dividing by an integer is exact; by a float it goes through double precision, as in PostgreSQL, and can be off by a microsecond. Dividing by zero, or any result too large to hold, is an error. Comparisons between intervals count a month as 30 days, so `INTERVAL '1' MONTH = INTERVAL '30' DAY` is true.

## Limitations

- The value takes numbers only: `INTERVAL '1 month 3 days'` and `INTERVAL '1-3' YEAR TO MONTH` are rejected. Write `INTERVAL '1 3' MONTH TO DAY` instead.
- The value must be quoted: `INTERVAL 1 DAY` is rejected.
- A number divided by an interval, an interval times an interval, and `%` on an interval are not operations.
- CAST(literal AS INTERVAL) is rejected. INTERVAL can only be cast TO VARCHAR (see cast_to above); it cannot be cast FROM another type.

## See Also

- [Working with timestamps](../advanced/adv-working-with-timestamps) — worked examples.
