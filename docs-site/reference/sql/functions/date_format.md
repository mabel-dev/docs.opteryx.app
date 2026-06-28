---
title: DATE_FORMAT — Opteryx Function
description: Format date/timestamp as string.
---

# DATE_FORMAT

Format a date or timestamp as a string using a format pattern.

**Category:** Date & Time Functions

## Syntax

```sql
DATE_FORMAT(date, pattern)
```

## Arguments

- **date** `temporal`  
    Date or timestamp value to format.
- **pattern** `varchar` [constant]  
    Format string. Must be a constant expression. See the token table below.

## Returns

**VARCHAR** — The formatted date/time string.

## Format Tokens

The following tokens are supported. Tokens are case-sensitive.

| Token | Output | Example (2024-06-15 14:30:45) |
|-------|--------|-------------------------------|
| `%Y`  | Year, 4 digits | `2024` |
| `%y`  | Year, 2 digits | `24` |
| `%m`  | Month, zero-padded (01–12) | `06` |
| `%d`  | Day of month, zero-padded (01–31) | `15` |
| `%e`  | Day of month, no padding (1–31) | `15` |
| `%j`  | Day of year (001–366) | `167` |
| `%b`  | Abbreviated month name | `Jun` |
| `%a`  | Abbreviated weekday name | `Sat` |
| `%w`  | Day of week (0=Sunday, 6=Saturday) | `6` |
| `%H`  | Hour, 24-hour, zero-padded (00–23) | `14` |
| `%k`  | Hour, 24-hour, no padding (0–23) | `14` |
| `%I`  | Hour, 12-hour, zero-padded (01–12) | `02` |
| `%l`  | Hour, 12-hour, space-padded (1–12) | ` 2` |
| `%S`  | Seconds, zero-padded (00–59) | `45` |
| `%p`  | `AM` or `PM` | `PM` |
| `%T`  | 24-hour time (`HH:MM:SS`) | `14:30:45` |
| `%r`  | 12-hour time (`HH:MM:SS AM/PM`) | `02:30:45 PM` |
| `%U`  | Week of year, week starts Sunday (00–53) | `23` |
| `%Z`  | Timezone name or abbreviation | `GMT` |
| `%z`  | Timezone offset (`+HHMM` or `-HHMM`) | `+0000` |
| `%%`  | Literal `%` character | `%` |

## Example

```sql
SELECT DATE_FORMAT(event_time, '%Y-%m-%d') AS event_date
  FROM events;
-- Returns '2024-06-15'
```

```sql
SELECT DATE_FORMAT(event_time, '%d %b %Y %H:%M') AS label
  FROM events;
-- Returns '15 Jun 2024 14:30'
```

## Notes

The format pattern must be a constant string — computed or column-derived patterns are not supported.

All timestamps are evaluated in UTC.
