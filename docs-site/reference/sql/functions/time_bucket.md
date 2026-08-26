---
title: TIME_BUCKET — Opteryx Function
description: Bucket date into fixed-width intervals.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# TIME_BUCKET

Bucket date into fixed-width intervals.

**Category:** Date & Time Functions

## Syntax

```sql
TIME_BUCKET(magnitude, units, date)
```

## Arguments

- **magnitude** `number`
    Bucket width for each interval.
- **units** `varchar` [constant]
    Unit for the bucket width, such as `minute`, `hour`, or `day`. Must be a constant expression.
- **date** `temporal`
    Date, time, or timestamp value to evaluate.

## Returns

**TIMESTAMP[US]** — Returns the computed result as `TIMESTAMP[US]`.
