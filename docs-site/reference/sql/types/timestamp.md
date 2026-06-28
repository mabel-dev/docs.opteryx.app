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
| from DATE | `date_col::TIMESTAMP` | Fills time as midnight (00:00:00) |
| from INTEGER (seconds) | `epoch_col::TIMESTAMP[s]` | Seconds since Unix epoch |
| from INTEGER (milliseconds) | `epoch_col::TIMESTAMP[ms]` | Milliseconds since Unix epoch |
| from INTEGER (microseconds) | `epoch_col::TIMESTAMP[us]` | Microseconds since Unix epoch (default scale) |
| from INTEGER (nanoseconds) | `epoch_col::TIMESTAMP[ns]` | Nanoseconds since Unix epoch |

## Arithmetic

| Expression | Result Type | Description |
|------------|-------------|-------------|
| `ts_col + INTERVAL '1' HOUR` | TIMESTAMP | Add a duration |
| `ts_col - INTERVAL '30' MINUTE` | TIMESTAMP | Subtract a duration |
| `ts_col - other_ts` | INTERVAL | Difference between two timestamps |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `TIMESTAMP`, `DATE`.

## Notes

All scales are stored as INT64. At the default microsecond scale, the representable range is approximately 1677-09-21 to 2262-04-11. Timezone information is not stored — all timestamps are naive (no offset). String parsing accepts a space or T as the date/time separator. Timezone suffixes (Z, +01:00) in strings are ignored — only the local time portion is parsed.

## Limitations

- Timezone offsets in string literals are silently ignored. Convert to UTC before storing if timezone matters.
- `1::TIMESTAMP` is not valid — you must specify the scale: `1::TIMESTAMP[s]`.
- Timestamps outside 1677–2262 are not representable at microsecond scale.
