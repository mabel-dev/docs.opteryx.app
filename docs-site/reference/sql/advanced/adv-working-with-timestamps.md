---
title: Working with Timestamps in Opteryx - Date and Time Functions
description: Master date, time, and timestamp operations in Opteryx. Learn intervals, date arithmetic, and temporal functions.
---

# Working with Timestamps

Working with DATE and TIMESTAMP often involves working with INTERVALs.

INTERVALs may not always act as expected, especially when working with months and years, primarily due to the complexity of accurately determining whether a number of days equals a given number of months.

> Be Aware: Functions that return the current time or date (including `CURRENT_DATE` and `CURRENT_TIMESTAMP`) return the value as at the start of the query execution, and it is constant for the query duration. Every reference to it within one statement returns the same instant, however long the query runs and however many rows it touches.

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

### Parsing and rendering with an explicit format

A plain cast to `DATE` or `TIMESTAMP` reads ISO-8601 input only. When the string is in another layout, state the pattern with `FORMAT`:

```sql
SELECT CAST('15-01-2024' AS DATE FORMAT 'DD-MM-YYYY');
SELECT CAST('01/15/2024 09:30' AS TIMESTAMP FORMAT 'MM/DD/YYYY HH24:MI');
```

The same clause works in the other direction. With a `VARCHAR` target the pattern describes the string to produce rather than the string to read:

```sql
SELECT CAST(event_time AS VARCHAR FORMAT 'DD/MM/YYYY HH24:MI') FROM events;
```

`FORMAT` is accepted on `DATE`, `TIMESTAMP` and `VARCHAR` targets, and on `INTERVAL` to `VARCHAR` - where the elements are read as duration magnitudes rather than calendar fields, so `DD` is a count of days:

```sql
SELECT CAST(INTERVAL '1' DAY AS VARCHAR FORMAT 'DD HH24:MI:SS');
-- 01 00:00:00
```

Any other target is refused - there is no numeric picture format.

`FORMAT` is part of the `CAST()` syntax only; the `::` shorthand does not take it.

`TRY_CAST` and `SAFE_CAST` combine with `FORMAT`. Input the pattern cannot parse becomes `NULL` instead of raising:

```sql
SELECT TRY_CAST('not a date' AS DATE FORMAT 'DD-MM-YYYY');
-- NULL
```

#### Format elements

Elements are uppercase keywords. Every other character is literal text, so separators need no escaping and lowercase text always passes through unchanged.

| Element | Meaning |
| --- | --- |
| `YYYY` | 4-digit year |
| `YY` | 2-digit year (`24` reads as 2024) |
| `MM` | month, 01-12 |
| `DD` | day, 01-31 |
| `HH24` | hour, 00-23 |
| `HH12` | hour, 01-12 |
| `HH` | alias for `HH12` |
| `MI` | minute, 00-59 |
| `SS` | second, 00-59 |
| `FF` | fractional seconds, 6 digits (microseconds) |

Every element is fixed-width and zero-padded in both directions, so `DD` reads and writes exactly two digits:

```sql
-- Error: '5-1-2024' does not match, the day and month are one digit each
SELECT CAST('5-1-2024' AS DATE FORMAT 'DD-MM-YYYY');
```

When parsing, the pattern must consume the whole input - trailing text is an error rather than a silent prefix match:

```sql
-- Error: the time component is not covered by the pattern
SELECT CAST('2024-01-15 10:20:30' AS TIMESTAMP FORMAT 'YYYY-MM-DD');
```

Fields the pattern does not mention take their value from the epoch:

```sql
SELECT CAST('09:30' AS TIMESTAMP FORMAT 'HH24:MI');
-- 1970-01-01 09:30:00
```

A run of the reserved letters `Y M D H I S F` that is not exactly one of the elements above is an error, not literal text, so a typo is reported rather than emitted verbatim:

```sql
-- Error: unrecognized format token 'Y'
SELECT CAST('2024-01-15' AS DATE FORMAT 'YYY-MM-DD');
```

Month and day names (`MON`, `MONTH`, `DAY`), `AM`/`PM` and timezone elements are not supported.

> Be Aware: `CAST ... FORMAT` and `FORMAT_TIMESTAMP` use different vocabularies. `CAST` takes the SQL format elements above (`YYYY-MM-DD`); `FORMAT_TIMESTAMP` and `FORMAT_DATE` take strftime codes (`%Y-%m-%d`). They are not interchangeable.

There is no function form of the parse direction - no `TO_DATE`, `STRPTIME` or `PARSE_DATE`. `CAST ... FORMAT` is how a string that is not ISO-8601 is read.

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

Supported parts: `YEAR`, `QUARTER`, `MONTH`, `DAY`, `HOUR`, `MINUTE`, `SECOND`, `EPOCH`.

Sub-day parts (`HOUR`, `MINUTE`, `SECOND`) require a `TIMESTAMP` operand - over a `DATE` they are refused, so a `DATE` accepts only `YEAR`, `QUARTER`, `MONTH`, `DAY` and `EPOCH`.

`EPOCH` is the odd one out: rather than a calendar field it returns the whole number of Unix epoch seconds, the same value as [`UNIXTIME(ts)`](../functions/unixtime), and is planned as that call:

```sql
SELECT EXTRACT(EPOCH FROM '2024-02-14 10:30:00'::TIMESTAMP);
-- 1707906600
```

Sub-second detail is discarded rather than rounded - the result is whole seconds, and it is negative for instants before 1970. See [Unix Epoch Time](#unix-epoch-time) for converting in the other direction.

`WEEK`, `ISOWEEK`, `DAYOFWEEK`/`DOW`, `DAYOFYEAR`/`DOY`, `ISOYEAR`, `DECADE`, `NANOSECOND`, `MILLISECOND` and `MICROSECOND` are **not** accepted by `EXTRACT` - see [Supported Date Parts](#supported-date-parts) for what to use instead.

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

See the [FORMAT_TIMESTAMP reference](../functions/format_timestamp) for the full list of supported format tokens.

`FORMAT_TIMESTAMP` takes strftime codes. To render with the SQL format elements instead (`YYYY-MM-DD`), or to read a string with an explicit pattern, see [Parsing and rendering with an explicit format](#parsing-and-rendering-with-an-explicit-format).

## Unix Epoch Time

Epoch seconds are how timestamps usually arrive from logs, APIs and event streams. Three
spellings cover the round trip:

```sql
UNIXTIME(timestamp)            -- timestamp → whole epoch seconds
EXTRACT(EPOCH FROM timestamp)  -- the same value, SQL-standard spelling
FROM_UNIXTIME(seconds)         -- epoch seconds → TIMESTAMP[us]
```

Example:

```sql
SELECT UNIXTIME(event_time)  AS epoch_seconds,
       FROM_UNIXTIME(1707906600) AS as_timestamp
  FROM events;
```

An epoch column read straight from storage is a number, not a temporal value, so it has to be
converted before any temporal function or comparison will accept it:

```sql
-- Correct
SELECT * FROM events WHERE FROM_UNIXTIME(epoch_col) >= '2024-01-01'::TIMESTAMP;

-- Error: IncorrectTypeError - epoch_col is an INTEGER
SELECT * FROM events WHERE epoch_col >= '2024-01-01'::TIMESTAMP;
```

`FROM_UNIXTIME` reads **seconds**, and a fractional value keeps its sub-second part. Milliseconds
are a common source of dates far in the future - divide first, and note that a value beyond year
9999 fails with `ValueError: year must be in 1..9999` rather than saturating:

```sql
SELECT FROM_UNIXTIME(epoch_millis / 1000) FROM events;
```

Both directions are lossy in the same way: `UNIXTIME` and `EXTRACT(EPOCH ...)` truncate to whole
seconds, so a microsecond-precision timestamp does not survive a round trip unchanged.

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

> Be Aware: An INTERVAL produced by subtracting one timestamp from another carries its whole magnitude in the sub-day component — its month and day fields are zero, and the elapsed time is a nanosecond count. Adding `INTERVAL '1' MONTH` to it sets the month field alongside that count rather than folding into it, so the two never combine into a single elapsed figure.

### Intervals cannot be compared to each other

`interval > interval` is **not supported in any unit** — not just for `YEAR`. Both of these
fail, and they fail with an internal error rather than a clean planning message:

```sql
-- unsupported
SELECT * FROM people WHERE death - birth > INTERVAL '100' YEAR;
SELECT * FROM people WHERE death - birth > INTERVAL '30' DAY;
```

Rearrange so the comparison is between two **timestamps**, which is supported:

```sql
-- supported
SELECT * FROM people WHERE birth + INTERVAL '100' YEAR < death;
SELECT * FROM people WHERE birth + INTERVAL '30' DAY  < death;
```

Or compare a `DATEDIFF` result, which is a number:

```sql
SELECT * FROM people WHERE DATEDIFF('day', birth, death) > 30;
```

The `month`, `quarter` and `year` units are day-count approximations - days divided by 30, 91 and 365 respectively - not calendar-aware differences. `month` and `quarter` are the ones that bite in practice:

```sql
-- 0, not 1: February is 29 days, short of the 30-day divisor
SELECT DATEDIFF('month', '2024-02-01'::TIMESTAMP, '2024-03-01'::TIMESTAMP);

-- 0, not 1: Q1 of a non-leap year is 90 days, short of the 91-day divisor
SELECT DATEDIFF('quarter', '2023-01-01'::TIMESTAMP, '2023-04-01'::TIMESTAMP);
```

`year` is accurate over any realistic range. Use day-level units where precision matters.

## Truncating

Truncate to a given precision:

```sql
TRUNC(timestamp, unit)
```

Example:

```sql
SELECT TRUNC(event_time, 'month') FROM events;
```

## Bucketing

`TRUNC` snaps a timestamp to the start of a calendar unit. `TIME_BUCKET` does the same for
*multiples* of a unit - 15 minutes, 6 hours, 2 weeks - which is what most time-series grouping
actually needs:

```sql
TIME_BUCKET(magnitude, units, timestamp)
```

The magnitude comes first and the value last - a common mistake is to write the timestamp first,
which fails with an `IncompatibleTypesError` naming each mismatched argument.

```sql
SELECT TIME_BUCKET(15, 'minute', event_time) AS bucket,
       COUNT(*) AS events
  FROM events
 GROUP BY bucket
 ORDER BY bucket;
```

Supported units are `second`, `minute`, `hour`, `day`, `week`, `month`, `quarter` and `year`. The
unit is case-insensitive and must be a literal. The magnitude must be a positive integer literal
too - `0`, a negative number, a fraction and a column reference are all refused.

> Be Aware: `GROUP BY` the **alias**, as above. Repeating the `TIME_BUCKET(...)` expression in the
> `GROUP BY` clause fails with an internal binding error rather than grouping.

### Bucket alignment

Buckets are aligned to a fixed origin, not to the earliest row in the data, so the same instant
always lands in the same bucket regardless of what else the query selects:

| Unit | Anchored at |
| --- | --- |
| `second`, `minute`, `hour`, `day` | the Unix epoch, `1970-01-01 00:00:00` |
| `week` | Monday, `1969-12-29` - so every bucket boundary is a Monday |
| `month`, `quarter`, `year` | January 1970 |

The consequence worth remembering is that a multi-unit bucket is not aligned to the calendar
period you might expect it to be:

```sql
-- 2024-02-08, not 2024-02-12: 7-day buckets count days from the epoch, they are not weeks
SELECT TIME_BUCKET(7, 'day', '2024-02-14 10:37:00'::TIMESTAMP);

-- 2024-02-12 - use the week unit when Monday alignment is what is wanted
SELECT TIME_BUCKET(1, 'week', '2024-02-14 10:37:00'::TIMESTAMP);

-- 2023-10-01: 5-month buckets are counted from January 1970, not from January 2024
SELECT TIME_BUCKET(5, 'month', '2024-02-14 10:37:00'::TIMESTAMP);
```

`TIME_BUCKET` returns `TIMESTAMP[us]` - the start of the bucket - for both `DATE` and `TIMESTAMP`
input, and returns `NULL` for `NULL` input, so empty timestamps collect in their own group rather
than being dropped.

Where the bucket is exactly one unit wide, `TRUNC(value, unit)` and `TIME_BUCKET(1, unit, value)`
agree.

## Aligning Two Time Series

Timestamps from two sources rarely line up exactly, so an equality join between them matches
almost nothing. `ASOF JOIN` matches each left row to the nearest right row by an inequality
instead - the price that was current when the trade happened, the config that was live when the
error was logged:

```sql
SELECT e.event_time, p.price
  FROM events AS e
  ASOF JOIN prices AS p
    MATCH_CONDITION(e.event_time >= p.priced_at);
```

`MATCH_CONDITION` takes exactly one inequality between a plain column from each relation. Every
left row is kept; where nothing satisfies the condition the right columns come back `NULL`.

There is no partitioning key, so the nearest match is taken across the whole right relation. When
the series are per-symbol, per-device or per-tenant, filter both sides to one key first - joining
first and filtering in `WHERE` afterwards discards rows rather than matching within each key.

See [ASOF JOIN](/docs/reference/sql/statements/joins#asof-join) for the full semantics, including tie handling and
the operators accepted.

## Supported Date Parts

Recognized date parts and support across functions - <img src="/images/square-check.svg" alt="" class="table-check" /> supported, <img src="/images/square-x.svg" alt="" class="table-check" /> not supported, <img src="/images/alert-triangle.svg" alt="" class="table-check" /> supported but see the note:

| Part | TRUNC | TIME_BUCKET | EXTRACT | DATEDIFF | Notes |
| --- | :---: | :---: | :---: | :---: | --- |
| microsecond | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> |  |
| millisecond | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> |  |
| second | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> |  |
| minute | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> |  |
| hour | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> |  |
| day | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> |  |
| dow | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | day of week - no function accepts it; use `FORMAT_TIMESTAMP('%u', ts)` |
| week | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | ISO week (starts Monday); for EXTRACT use `FORMAT_TIMESTAMP('%V', ts)` |
| month | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/alert-triangle.svg" alt="Supported with caveats" class="table-check" /> | DATEDIFF approximates as days / 30 |
| quarter | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/alert-triangle.svg" alt="Supported with caveats" class="table-check" /> | DATEDIFF approximates as days / 91 |
| doy | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | day of year - use `FORMAT_TIMESTAMP('%j', ts)` |
| year | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> |  |
| epoch | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | <img src="/images/square-check.svg" alt="Supported" class="table-check" /> | <img src="/images/square-x.svg" alt="Not supported" class="table-check" /> | whole Unix epoch seconds; equivalent to `UNIXTIME(ts)`, see [Unix Epoch Time](#unix-epoch-time) |

## Limitations

- INTERVALs created from timestamp subtraction have no month or year component
- Intervals cannot be compared to one another in any unit — compare timestamps or a `DATEDIFF` result instead
- DATEDIFF `month`, `quarter` and `year` are day-count approximations, not calendar differences
- EXTRACT does not accept `WEEK`, `DOW` or `DOY`
- TIME_BUCKET takes a literal positive integer magnitude - a column or an expression is refused
- TIME_BUCKET buckets are anchored to a fixed origin, so multi-unit buckets do not align to the calendar period of the same size
- ASOF JOIN matches on a single inequality and has no partitioning key
- `CAST ... FORMAT` has numeric elements only - no month or day names, no `AM`/`PM`, no timezone
- All timestamps are stored and compared in UTC

## Timezones

The engine runs in UTC. All requests for current time return UTC.

## Precision

- TIMESTAMP: microsecond precision by default (`[us]`); `[s]`, `[ms]`, `[ns]` also supported
- DATE: day precision
- INTERVAL: microsecond precision
