---
title: GENERATE_SERIES — Opteryx Function
description: Builds the series as an ARRAY in a single row. `GENERATE_SERIES(10)` starts at 1; `GENERATE_SERIES(1, 10)` and `GENERATE_SERIES(1, 10, 2)` start where they say. `stop` is included when it falls on a step boundary. A step pointing away from `stop` yields an EMPTY array; a step of zero is refused. Arguments must be CONSTANTS. With DATE or TIMESTAMP bounds and an INTERVAL step - `GENERATE_SERIES(CAST('2025-01-01' AS TIMESTAMP), CAST('2025-01-02' AS TIMESTAMP), INTERVAL '5' MINUTE)` - the result is an ARRAY<TIMESTAMP>; a DATE bound is midnight of its day and a month step clamps the day and carries the clamp forward (31 Jan, 28 Feb, 28 Mar), as DuckDB does. A NULL integer bound gives a NULL array. The scalar form holds at most 1,000,000 elements. To get one ROW per value instead - which is what gap-filling and joining against a dense axis need - use the table spelling, `FROM GENERATE_SERIES(1, 10) AS g`, which also accepts floats and string dates. Without an alias the table spelling's column is named `generate_series`.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# GENERATE_SERIES

Builds the series as an ARRAY in a single row. `GENERATE_SERIES(10)` starts at 1; `GENERATE_SERIES(1, 10)` and `GENERATE_SERIES(1, 10, 2)` start where they say. `stop` is included when it falls on a step boundary. A step pointing away from `stop` yields an EMPTY array; a step of zero is refused. Arguments must be CONSTANTS. With DATE or TIMESTAMP bounds and an INTERVAL step - `GENERATE_SERIES(CAST('2025-01-01' AS TIMESTAMP), CAST('2025-01-02' AS TIMESTAMP), INTERVAL '5' MINUTE)` - the result is an ARRAY<TIMESTAMP>; a DATE bound is midnight of its day and a month step clamps the day and carries the clamp forward (31 Jan, 28 Feb, 28 Mar), as DuckDB does. A NULL integer bound gives a NULL array. The scalar form holds at most 1,000,000 elements. To get one ROW per value instead - which is what gap-filling and joining against a dense axis need - use the table spelling, `FROM GENERATE_SERIES(1, 10) AS g`, which also accepts floats and string dates. Without an alias the table spelling's column is named `generate_series`.

**Category:** Utility Functions

## Syntax

```sql
GENERATE_SERIES(stop)
```

```sql
GENERATE_SERIES(start, stop)
```

```sql
GENERATE_SERIES(start, stop, step)
```

## Arguments

- **stop** `integer` [constant]
    Last value of the series, included when it falls on a step boundary. Must be a constant expression.
- **start** `integer` [constant]
    First value of the series. Must be a constant expression.
- **step** `integer` [constant]
    Distance between consecutive values; may be negative, never zero. Must be a constant expression.

## Returns

**ARRAY<INT64>** — Returns the computed result as `ARRAY<INT64>`.
**ARRAY<TIMESTAMP[US]>** — Returns the computed result as `ARRAY<TIMESTAMP[US]>`.
