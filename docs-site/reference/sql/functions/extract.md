---
title: EXTRACT — Opteryx Function
description: Extracts a named part from a date or timestamp. The supported parts are year, quarter, month, day, hour, minute, second and epoch - the list is closed, and a part outside it is refused.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

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
