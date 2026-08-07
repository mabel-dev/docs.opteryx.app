---
title: Working with Timestamps in Opteryx - Date and Time Functions
description: Master date, time, and timestamp operations in Opteryx. Learn intervals, date arithmetic, and temporal functions.
---

# Working with Timestamps

Working with DATE and TIMESTAMP often involves working with INTERVALs.

INTERVALs may not always act as expected, especially when working with months and years, primarily due to the complexity of accurately determining whether a number of days equals a given number of months.

> Be Aware: Functions that return the current time or date (including `CURRENT_DATE` and `CURRENT_TIMESTAMP`) return the value as at the start of the query execution.

## Casting

Cast values to temporal types using `CAST()` or the `::` shorthand:

```sql
CAST(value AS DATE)
CAST(value AS TIMESTAMP)
CAST(value AS TIMESTAMP[s])
CAST(value AS TIMESTAMP[ms])
CAST(value AS TIMESTAMP[us])
CAST(value AS TIMESTAMP[ns])
```

`::` shorthand is equivalent:

```sql
'2024-02-14'::DATE
'2024-02-14 10:30:00'::TIMESTAMP
'2024-02-14'::TIMESTAMP[ms]
```

Plain `::TIMESTAMP` (without a precision suffix) defaults to microsecond (`[us]`) precision and is fully supported.

String literals are not implicitly cast to temporal types. An explicit cast is required when comparing a string against a temporal column:

```sql
-- Correct
SELECT * FROM events WHERE event_time >= '2024-01-01'::TIMESTAMP;

-- Error: IncompatibleTypesError
SELECT * FROM events WHERE event_time >= '2024-01-01';
```

## Creating Temporal Values

### Date and Timestamp Literals

```sql
'2024-02-14'::DATE
'2024-02-14 10:30:00'::TIMESTAMP
```

### Interval Literals

```sql
INTERVAL 'value' unit
```

Examples:

```sql
INTERVAL '1' YEAR
INTERVAL '1' DAY
INTERVAL '1 1' DAY TO HOUR
INTERVAL '30' MINUTE
INTERVAL '45' SECOND
```

Supported units: `YEAR`, `MONTH`, `DAY`, `HOUR`, `MINUTE`, `SECOND`

### Current Date and Time

```sql
CURRENT_DATE
CURRENT_TIMESTAMP
```

These can be used without parentheses.

## Extracting Parts

Extract specific parts from a date or timestamp:

```sql
EXTRACT(part FROM timestamp)
```

Example:

```sql
SELECT EXTRACT(YEAR FROM event_time),
       EXTRACT(MONTH FROM event_time),
       EXTRACT(DAY FROM event_time)
  FROM events;
```

Supported parts: `NANOSECOND`, `MICROSECOND`, `MILLISECOND`, `SECOND`, `MINUTE`, `HOUR`, `DATE`, `DAY`, `DAYOFWEEK`/`DOW`, `WEEK`, `ISOWEEK`, `MONTH`, `QUARTER`, `DAYOFYEAR`/`DOY`, `YEAR`, `ISOYEAR`, `DECADE`

## Formatting

Format a timestamp as a string:

```sql
FORMAT_TIMESTAMP(format, timestamp)
```

Example:

```sql
SELECT FORMAT_TIMESTAMP('%Y-%m-%d', event_time)
  FROM events;
```

See the [FORMAT_TIMESTAMP reference](../functions/format_timestamp.md) for the full list of supported format tokens.

## Arithmetic

Add or subtract intervals from timestamps:

```sql
timestamp + interval → timestamp
timestamp - interval → timestamp
timestamp - timestamp → interval
interval + interval → interval
interval - interval → interval
```

Examples:

```sql
SELECT event_time + INTERVAL '1' YEAR FROM events;
SELECT end_time - start_time AS duration FROM events;
```

Timestamps cannot be added together (`timestamp + timestamp` is an error).

## Comparing Timestamps

Timestamps support all standard comparison operators:

```sql
SELECT *
  FROM events
 WHERE event_time > '2020-01-01'::TIMESTAMP
   AND event_time < '2021-01-01'::TIMESTAMP;
```

## Date Difference

Calculate the difference between two timestamps:

```sql
DATEDIFF(unit, start, end)
```

Both `start` and `end` must be `TIMESTAMP` (cast DATE values explicitly):

```sql
SELECT DATEDIFF('day', '2024-01-01'::TIMESTAMP, '2024-12-31'::TIMESTAMP);
```

> Be Aware: INTERVALs created as the result of timestamp subtraction have no month or year component and are handled internally as microseconds. This may produce unexpected results when mixed with month calculations.

The comparison form `WHERE death - birth > INTERVAL '100' YEAR` is not supported. Use `WHERE birth + INTERVAL '100' YEAR > death` instead.

DATEDIFF with `month` units can be unreliable — use day-level units where precision matters.

## Truncating

Truncate to a given precision:

```sql
TRUNC(timestamp, unit)
```

Example:

```sql
SELECT TRUNC(event_time, 'month') FROM events;
```

## Supported Date Parts

Recognized date parts and support across functions:

Part     | TRUNC | EXTRACT | DATEDIFF | Notes
-------- | :---: | :-----: | :------: | ----
second   | ✓     | ✓       | ✓        |
minute   | ✓     | ✓       | ✓        |
hour     | ✓     | ✓       | ✓        |
day      | ✓     | ✓       | ✓        |
dow      | ✘     | ✓       | ✘        | day of week
week     | ✓     | ✓       | ✓        | ISO week (starts Monday)
month    | ✓     | ✓       | ▲        | DATEDIFF unreliable for months
quarter  | ✓     | ✓       | ✓        |
doy      | ✘     | ✓       | ✘        | day of year
year     | ✓     | ✓       | ✓        |

## Limitations

- INTERVALs created from timestamp subtraction have no month or year component
- DATEDIFF with month units can be unreliable
- All timestamps are stored and compared in UTC
- `death - birth > INTERVAL '100' YEAR` comparison form is not supported

## Timezones

The engine runs in UTC. All requests for current time return UTC.

## Precision

- TIMESTAMP: microsecond precision by default (`[us]`); `[s]`, `[ms]`, `[ns]` also supported
- DATE: day precision
- INTERVAL: microsecond precision
