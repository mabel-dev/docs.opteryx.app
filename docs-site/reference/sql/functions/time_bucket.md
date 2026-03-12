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

- **magnitude**: Bucket width for each interval.
- **units**: Unit for the bucket width, such as `minute`, `hour`, or `day`. Must be a constant expression.
- **date**: Date, time, or timestamp value to evaluate.

## Returns

Returns the computed result as `timestamp`.
