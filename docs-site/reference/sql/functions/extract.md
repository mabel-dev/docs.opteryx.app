---
title: EXTRACT — Opteryx Function
description: Extracts a named part (year, month, day, epoch, etc.) from a date or timestamp.
---

# EXTRACT

Extracts a named part (year, month, day, epoch, etc.) from a date or timestamp.

**Category:** Date & Time Functions

## Syntax

```
EXTRACT(part FROM date)
```

## Arguments

- **part**: Date or time part to extract, such as `year`, `month`, `day`, or `epoch`. Must be a constant expression.
- **date**: Date, time, or timestamp value to evaluate.

## Returns

Returns `double` for parts such as `epoch` and `julian`, `date` for `date`, and `integer` for most other parts.
