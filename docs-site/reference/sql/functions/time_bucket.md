---
title: TIME_BUCKET — Opteryx Function
description: Bucket date into fixed-width intervals.
---

# TIME_BUCKET

Bucket date into fixed-width intervals.

**Category:** Date & Time Functions

## Syntax

```
TIME_BUCKET(magnitude, units, date)
```

## Arguments

- **magnitude** `number`
    Bucket width for each interval.
- **units** `varchar` [constant]
    Unit for the bucket width, such as `minute`, `hour`, or `day`. Must be a constant expression.
- **date** `temporal`
    Date, time, or timestamp value to evaluate.

## Returns

**timestamp** — Returns the computed result as `timestamp`.
