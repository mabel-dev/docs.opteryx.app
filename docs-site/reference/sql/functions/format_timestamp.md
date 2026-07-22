---
title: FORMAT_TIMESTAMP — Opteryx Function
description: Format date/timestamp as string (BigQuery FORMAT_TIMESTAMP/FORMAT_DATE convention: pattern first).
---

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
