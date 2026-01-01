---
title: Working with Timestamps in Opteryx - Date and Time Functions
description: Master date, time, and timestamp operations in Opteryx. Learn intervals, date arithmetic, and temporal functions.
---

# Working with Timestamps

Working with DATE and TIMESTAMP often involves working with INTERVALs. 

INTERVALs may not always act as expected, especially when working with months and years, primarily due to complexities in quickly and accurately determining if an number of days is a given number of months.

!!! Note  
    Functions that return the current time or date (including now) will return the time as at the start of the execution of the query.

## Actions

### Casting

Cast values to timestamp types:

~~~sql
CAST(value AS TIMESTAMP)
CAST(value AS DATE)
CAST(value AS TIME)
~~~

Example:

~~~sql
SELECT CAST('2024-02-14' AS TIMESTAMP);
~~~

### Create

#### Timestamp Literal

Create a timestamp using type hint notation:

~~~sql
TIMESTAMP 'value'
~~~

Example:

~~~sql
SELECT TIMESTAMP '2024-02-14';
SELECT TIMESTAMP '2024-02-14 10:30:00';
~~~

#### Interval Literal

Create an interval using type hint notation:

~~~sql
INTERVAL 'values' units
~~~

Examples:

~~~sql
INTERVAL '1' YEAR
INTERVAL '1' DAY
INTERVAL '1 1' DAY TO HOUR
INTERVAL '30' MINUTE
INTERVAL '45' SECOND
~~~

Supported units: `YEAR`, `MONTH`, `DAY`, `HOUR`, `MINUTE`, `SECOND`

#### Generate Timestamps

Generate current date and time values:

~~~sql
current_date
current_time
current_timestamp
~~~

Note: These functions support being called without parenthesis.

Additional generators:

~~~sql
YESTERDAY()
TIME()
generate_series(start, stop, step)
~~~

Example:

~~~sql
SELECT generate_series(
    TIMESTAMP '2024-01-01',
    TIMESTAMP '2024-01-31',
    INTERVAL '1' DAY
);
~~~

### Reading

#### Extract Parts

Extract specific parts from a timestamp:

~~~sql
EXTRACT(part FROM timestamp)
~~~

Example:

~~~sql
SELECT EXTRACT(YEAR FROM birth_date),
       EXTRACT(MONTH FROM birth_date),
       EXTRACT(DAY FROM birth_date)
  FROM $astronauts;
~~~

Supported parts: `NANOSECOND`, `MICROSECOND`, `MILLISECOND`, `SECOND`, `MINUTE`, `HOUR`, `DATE`, `DAY`, `DAYOFWEEK`/`DOW`, `WEEK`, `ISOWEEK`, `MONTH`, `QUARTER`, `DAYOFYEAR`/`DOY`, `YEAR`, `ISOYEAR`, `DECADE`

Shorthand functions for common extractions:

~~~sql
DATE(timestamp)    -- Extract date only
DAY(timestamp)     -- Extract day number
MONTH(timestamp)   -- Extract month number
YEAR(timestamp)    -- Extract year number
~~~

Example:

~~~sql
SELECT DATE(birth_date)
  FROM $astronauts;
~~~

#### Format

Format timestamps as strings:

~~~sql
DATE_FORMAT(timestamp, format)
~~~

Example:

~~~sql
SELECT DATE_FORMAT(birth_date, '%Y-%m-%d')
  FROM $astronauts;
~~~

### Comparing

#### Arithmetic Operations

Add or subtract intervals from timestamps:

~~~sql
timestamp + interval → timestamp
timestamp - interval → timestamp
timestamp - timestamp → interval
interval + interval → interval
interval - interval → interval
~~~

Examples:

~~~sql
SELECT birth_date + INTERVAL '100' YEAR
  FROM $astronauts;

SELECT death_date - birth_date AS lifespan
  FROM $astronauts;
~~~

Note: Timestamps cannot be added together (`timestamp + timestamp` is not possible).

#### Date Difference

Calculate the difference between two timestamps:

~~~sql
DATEDIFF(unit, start, end)
~~~

Example:

~~~sql
SELECT DATEDIFF('day', birth_date, death_date) AS days_lived
  FROM $astronauts;
~~~

!!! Note
    INTERVALs created as the result of timestamp subtraction have no month or year component and are handled internally as seconds. This may result in unexpected outcomes when mixed with month calculations.

Supported form:

~~~sql
WHERE birth + INTERVAL '100' YEAR > death
~~~

Unsupported form:

~~~sql
WHERE death - birth > INTERVAL '100' YEAR
~~~

#### Standard Comparisons

Timestamps support standard comparison operators:

~~~sql
SELECT *
  FROM $astronauts
 WHERE birth_date > TIMESTAMP '1950-01-01'
   AND birth_date < TIMESTAMP '1960-01-01';
~~~

### Transforms

#### Truncate

Truncate timestamps to a specified precision:

~~~sql
DATE_TRUNC(part, timestamp)
~~~

Example:

~~~sql
SELECT DATE_TRUNC('month', birth_date)
  FROM $astronauts;
~~~

#### Time Bucket

Group timestamps into buckets:

~~~sql
TIME_BUCKET(timestamp, multiple, unit)
~~~

Example:

~~~sql
SELECT TIME_BUCKET(event_time, 5, 'minute') AS time_bucket,
       COUNT(*) AS event_count
  FROM events
 GROUP BY time_bucket;
~~~

#### Parse

Parse strings as timestamps:

~~~sql
CAST(string AS TIMESTAMP)
TIMESTAMP(string)
~~~

Example:

~~~sql
SELECT TIMESTAMP('2024-02-14 10:30:00');
~~~

### Supported Date Parts

Recognized date parts and periods and support across various functions:

Part     | DATE_TRUNC | EXTRACT | DATEDIFF | TIME_BUCKET | Notes
-------- | :--------: | :-----: | :------: | :---------: | ----
second   | ✓          | ✓       | ✓        | ✓           |
minute   | ✓          | ✓       | ✓        | ✓           |
hour     | ✓          | ✓       | ✓        | ✓           |
day      | ✓          | ✓       | ✓        | ✓           |
dow      | ✘          | ✓       | ✘        | ✘           | day of week
week     | ✓          | ✓       | ✓        | ✓           | iso week i.e. to monday
month    | ✓          | ✓       | ▲        | ✓           | DATEDIFF unreliable calculating months
quarter  | ✓          | ✓       | ✓        | ✓           |
doy      | ✘          | ✓       | ✘        | ✘           | day of year
year     | ✓          | ✓       | ✓        | ✓           |

## Limitations

Timestamps and intervals have the following limitations:

- INTERVALs created from timestamp subtraction have no month or year component and are handled internally as seconds
- DATEDIFF with month units can be unreliable
- All timestamps are stored in UTC timezone
- `death - birth > INTERVAL '100' YEAR` comparison form is not supported (use `birth + INTERVAL '100' YEAR > death` instead)

## Implicit Casting

In many situation where a timestamp is expected, if an [RFC 3339](https://datatracker.ietf.org/doc/html/rfc3339) formatted string is provided, the engine will default to interpretting as a timestamp. However, for reliability, you should not rely on the engine doing this for you.

## Timezones

The engine is opinionated to run in UTC - all instances where the system time is requested, UTC is used.

## Precision

INTERVALs are maintained internally with a millisecond precision.

TIMESTAMPs are maintained internally with a nanosecond precision.

DATEs are maintained internally with a day precision.