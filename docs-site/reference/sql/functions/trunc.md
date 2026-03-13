---
title: TRUNC — Opteryx Function
description: Truncates a numeric value toward zero at the requested scale.
---

# TRUNC

Truncates a numeric value toward zero at the requested scale.

**Category:** Numeric Functions

## Syntax

```
TRUNC(num, [scale...])
```

```
TRUNC(value, unit)
```

## Arguments

- **num**: Numeric value to truncate.
- **scale**: Decimal scale to keep before truncating toward zero. Optional. Can be repeated.
- **value**: Date, time, or timestamp value to truncate.
- **unit**: Granularity to truncate to, such as `day`, `month`, or `year`. Must be a constant expression.

## Returns

Returns the computed result as `double`.
Returns the computed result as `timestamp`.
