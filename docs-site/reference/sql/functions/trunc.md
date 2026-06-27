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

```
TRUNC(value, unit)
```

## Arguments

- **num** `number`
    Numeric value to truncate.
- **scale** `integer` [optional | variadic]
    Decimal scale to keep before truncating toward zero. Optional. Can be repeated.
- **value** `date`
    Date, time, or timestamp value to truncate.
- **unit** `varchar` [constant]
    Granularity to truncate to, such as `day`, `month`, or `year`. Must be a constant expression.

## Returns

**float64** — Returns the computed result as `float64`.
**timestamp** — Returns the computed result as `timestamp`.

## Usage Notes

Truncation is performed toward zero rather than toward negative infinity.
