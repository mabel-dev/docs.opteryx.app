---
title: DATEDIFF — Opteryx Function
description: Difference between two dates in the specified unit.
---

# DATEDIFF

Difference between two dates in the specified unit.

**Category:** Date & Time Functions

## Syntax

```sql
DATEDIFF(part, date, end)
```

## Arguments

- **part** `varchar` [constant]
    Unit to measure the difference in, such as `day`, `month`, or `year`. Must be a constant expression.
- **date** `temporal`
    Date, time, or timestamp value to evaluate.
- **end** `temporal`
    Ending date, time, or timestamp value.

## Returns

**INTEGER** — Returns the computed result as `INTEGER`.
