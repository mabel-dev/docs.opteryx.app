---
title: TIME — Opteryx Type
description: TIME
---

# TIME

A time of day with no date component. Stores hours, minutes, seconds, and microseconds.

## Example

```sql
SELECT '12:30:00'::TIME;
```

## Accepted String Formats

When casting a string to this type, the following formats are accepted:

| Format | Example | Notes |
|--------|---------|-------|
| `HH:MM` | `'09:30'::TIME` | Hour and minute only; seconds default to 0 |
| `HH:MM:SS` | `'09:30:45'::TIME` | Hour, minute, and second |

## Casting

| From | Example | Notes |
|------|---------|-------|
| from VARCHAR | `'09:30:45'::TIME` | String must be HH:MM or HH:MM:SS |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `TIME`.

## Limitations

- TIME cannot be compared to DATE or TIMESTAMP.
- No timezone support — TIME is always local/naive.
- You cannot cast an integer to TIME.
