---
title: DATEDIFF — Opteryx Function
description: Difference between two dates in the specified unit.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

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
