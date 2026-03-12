---
title: DATE_TRUNC — Opteryx Function
description: Truncate date/timestamp to specified granularity.
---

# DATE_TRUNC

Truncate date/timestamp to specified granularity.

**Category:** Date & Time Functions

## Syntax

```
DATE_TRUNC(part, date)
```

## Arguments

- **part**: Granularity to truncate to, such as `day`, `month`, or `year`. Must be a constant expression.
- **date**: Date, time, or timestamp value to evaluate.

## Returns

Returns the computed result as `timestamp`.
