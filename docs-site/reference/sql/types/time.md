---
title: TIME — Opteryx Type
description: TIME
---

# TIME

A time of day with no date component. Stored as microseconds since midnight (TIME64).

## Example

```sql
SELECT '09:30:45'::TIME;
```

## Accepted String Formats

When casting a string to this type, the following formats are accepted:

| Format | Example | Notes |
|--------|---------|-------|
| `HH:MM:SS` | `'09:30:45'::TIME` | Hours, minutes, seconds |
| `HH:MM:SS.ffffff` | `'09:30:45.123456'::TIME` | With up to 6 fractional-second digits |

## Casting

| From | Example | Notes |
|------|---------|-------|
| from VARCHAR | `'09:30:45'::TIME` | String must be in HH:MM:SS[.ffffff] format |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `TIME`.

## Limitations

- TIME literal-prefix syntax (`TIME '09:30:00'`) is not accepted — type-prefixed string literals are rejected for every type except INTERVAL; use `'09:30:00'::TIME` or `CAST('09:30:00' AS TIME)` instead.
- TIME cannot be compared to DATE or TIMESTAMP.
- No timezone support — TIME is always local/naive.
- There is no CAST from TIMESTAMP, DATE, or INTEGER to TIME yet — only VARCHAR sources are supported.

## See Also

- [Working with timestamps](../advanced/adv-working-with-timestamps) — worked examples.
