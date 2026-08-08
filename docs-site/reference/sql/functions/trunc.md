---
title: TRUNC — Opteryx Function
description: Truncates a numeric value toward zero at the requested scale.
---

# TRUNC

Truncates a numeric value toward zero at the requested scale.

**Category:** Numeric Functions

## Syntax

```sql
TRUNC(num, [scale...])
```

```sql
TRUNC(value, unit)
```

## Arguments

- **num** `number`
    Numeric value to truncate.
- **scale** `integer` [optional | variadic]
    Decimal scale to keep before truncating toward zero. Optional. Can be repeated.
- **value** `temporal`
    Date, time, or timestamp value to truncate.
- **unit** `varchar` [constant]
    Granularity to truncate to, such as `day`, `month`, or `year`. Must be a constant expression.

## Returns

**FLOAT** — Returns the computed result as `FLOAT`.
**TIMESTAMP[US]** — Returns the computed result as `TIMESTAMP[US]`.

## Usage Notes

Truncation is performed toward zero rather than toward negative infinity.
Truncates to the start of the specified unit. The `unit` argument must be a constant expression.
