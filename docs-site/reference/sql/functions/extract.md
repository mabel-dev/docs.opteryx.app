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

- **part: varchar** — Date or time part to extract, such as `year`, `month`, `day`, or `epoch`. Must be a constant expression.
- **date: temporal** — Date, time, or timestamp value to evaluate.

## Returns

**integer | double | date** — Returns `double` for parts such as `epoch` and `julian`, `date` for `date`, and `integer` for most other parts.

## Usage Notes

Canonical SQL-92 form is `EXTRACT(part FROM date)`. Return type depends on `part`: `epoch` and `julian` produce `double`, `date` produces `date`, and most other parts produce `integer`.
