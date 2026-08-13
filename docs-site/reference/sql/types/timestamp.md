---
title: TIMESTAMP — Opteryx Type
description: TIMESTAMP
---

# TIMESTAMP

A date and time value. The default scale is microseconds. Use `TIMESTAMP[s]`, `TIMESTAMP[ms]`, `TIMESTAMP[us]`, `TIMESTAMP[ns]`, or `TIMESTAMP[d]` to declare a specific scale — this matters when casting integer epoch columns.

## Example

```sql
SELECT '2024-01-01 12:00:00'::TIMESTAMP;
```

## Accepted String Formats

When casting a string to this type, the following formats are accepted:

| Format | Example | Notes |
|--------|---------|-------|
| `YYYY-MM-DD` | `'2024-01-15'::TIMESTAMP` | Date only — time defaults to 00:00:00 |
| `YYYY-MM-DD HH:MM:SS` | `'2024-01-15 09:30:00'::TIMESTAMP` | Date and time separated by a space |
| `YYYY-MM-DDTHH:MM:SS` | `'2024-01-15T09:30:00'::TIMESTAMP` | ISO 8601 with T separator |
| `YYYY-MM-DDTHH:MM:SS.ffffff` | `'2024-01-15T09:30:00.123456'::TIMESTAMP` | With microseconds |

## Casting

| From | Example | Notes |
|------|---------|-------|
| from VARCHAR | `'2024-01-15 09:30:00'::TIMESTAMP` | Accepts the string formats listed above |
| from VARCHAR (FORMAT) | `CAST('15-01-2024 09:30' AS TIMESTAMP FORMAT 'DD-MM-YYYY HH24:MI')` | Parses against an explicit SQL-style pattern (tokens: YYYY, YY, MM, DD, HH24, HH12/HH, MI, SS, FF) instead of the ISO-8601 default |
| from DATE | `date_col::TIMESTAMP` | Fills time as midnight (00:00:00) |
| from INTEGER (seconds) | `epoch_col::TIMESTAMP[s]` | Seconds since Unix epoch |
| from INTEGER (milliseconds) | `epoch_col::TIMESTAMP[ms]` | Milliseconds since Unix epoch |
| from INTEGER (microseconds) | `epoch_col::TIMESTAMP[us]` | Microseconds since Unix epoch (default scale) |
| from INTEGER (nanoseconds) | `epoch_col::TIMESTAMP[ns]` | Nanoseconds since Unix epoch |
| to VARCHAR | `ts_col::VARCHAR` | Renders as 'YYYY-MM-DDTHH:MM:SS.ffffff' (ISO 8601, no offset — timestamps are naive). `CAST(ts_col AS VARCHAR FORMAT '...')` renders against an explicit pattern instead |

## Arithmetic

| Expression | Result Type | Description |
|------------|-------------|-------------|
| `ts_col + INTERVAL '1' HOUR` | TIMESTAMP | Add a duration |
| `ts_col - INTERVAL '30' MINUTE` | TIMESTAMP | Subtract a duration |
| `ts_col - other_ts` | INTERVAL | Difference between two timestamps |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `TIMESTAMP`, `DATE`.

## Notes

All scales are stored as INT64. The 1677-09-21 to 2262-04-11 range applies only to `TIMESTAMP[ns]`; the default microsecond scale covers a far wider range. EVERY scale is bounded by year 1..9999 — a value outside it cannot be materialised, and a computed one (a large `TIME_BUCKET` magnitude, a `FROM_UNIXTIME` past the window) surfaces as `ValueError: year must be in 1..9999`. In epoch seconds the inclusive endpoints are -62135596800 and 253402300799. Timezone information is not stored — all timestamps are naive (no offset). A trailing timezone suffix (`Z`, `+01:00`) in a string literal is accepted and discarded — the wall-clock date/time as written is kept, only the offset is dropped. String parsing accepts a space or T as the date/time separator.

## Limitations

- `1::TIMESTAMP` is not valid — you must specify the scale: `1::TIMESTAMP[s]`.
- Timestamps outside 1677–2262 are not representable at `TIMESTAMP[ns]` scale (nanosecond storage overflows outside that range); the default microsecond scale does not have this restriction.
- No scale represents a year outside 1..9999. This bounds the RESULT of temporal arithmetic too, not just literals and casts: an expression whose value falls outside the window raises rather than saturating.
- CAST ... FORMAT is not yet supported combined with TRY_CAST/SAFE_CAST.
