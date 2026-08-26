---
title: FORMAT_TIMESTAMP — Opteryx Function
description: Format date/timestamp as string (BigQuery FORMAT_TIMESTAMP/FORMAT_DATE convention: pattern first).
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# FORMAT_TIMESTAMP

Format date/timestamp as string (BigQuery FORMAT_TIMESTAMP/FORMAT_DATE convention: pattern first).

**Category:** Date & Time Functions

## Syntax

```sql
FORMAT_TIMESTAMP(pattern, date)
```

## Arguments

- **pattern** `varchar` [constant]
    Format string used to render the temporal value as text. Must be a constant expression.
- **date** `temporal`
    Date, time, or timestamp value to evaluate.

## Returns

**VARCHAR** — Returns the computed result as `VARCHAR`.
