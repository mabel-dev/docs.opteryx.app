---
title: EXTRACT — Opteryx Function
description: Extracts a named part from a date or timestamp. The supported parts are year, quarter, month, day, hour, minute, second and epoch - the list is closed, and a part outside it is refused.
---

# EXTRACT

Extracts a named part from a date or timestamp. The supported parts are year, quarter, month, day, hour, minute, second and epoch - the list is closed, and a part outside it is refused.

**Category:** Date & Time Functions

## Syntax

```sql
EXTRACT(part FROM date)
```

## Arguments

- **part** `varchar` [constant]
    Date or time part to extract: `year`, `quarter`, `month`, `day`, `hour`, `minute`, `second` or `epoch`. Must be a constant expression.
- **date** `temporal`
    Date, time, or timestamp value to evaluate.

## Returns

**integer** — Returns the requested part as an `integer`; `epoch` returns whole Unix epoch seconds.

## Usage Notes

Canonical SQL-92 form is `EXTRACT(part FROM date)`. The supported parts are `year`, `quarter`, `month`, `day`, `hour`, `minute`, `second` and `epoch`; each returns an `integer`. `epoch` is whole Unix epoch seconds - `EXTRACT(EPOCH FROM ts)` is the same value as `TO_UNIXTIME(ts)`, and is planned as that call. Sub-day parts require a TIMESTAMP operand.
