---
title: GENERATE_SERIES — Opteryx Function
description: Builds the series as an ARRAY in a single row. `GENERATE_SERIES(10)` starts at 1; `GENERATE_SERIES(1, 10)` and `GENERATE_SERIES(1, 10, 2)` start where they say. `stop` is included when it falls on a step boundary. A step pointing away from `stop` yields an EMPTY array; a step of zero is refused. Arguments must be integer CONSTANTS. To get one ROW per value instead - which is what gap-filling and joining against a dense axis need - use the table spelling, `FROM GENERATE_SERIES(1, 10) AS g`, which also accepts floats and, with an INTERVAL step, timestamps.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# GENERATE_SERIES

Builds the series as an ARRAY in a single row. `GENERATE_SERIES(10)` starts at 1; `GENERATE_SERIES(1, 10)` and `GENERATE_SERIES(1, 10, 2)` start where they say. `stop` is included when it falls on a step boundary. A step pointing away from `stop` yields an EMPTY array; a step of zero is refused. Arguments must be integer CONSTANTS. To get one ROW per value instead - which is what gap-filling and joining against a dense axis need - use the table spelling, `FROM GENERATE_SERIES(1, 10) AS g`, which also accepts floats and, with an INTERVAL step, timestamps.

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
