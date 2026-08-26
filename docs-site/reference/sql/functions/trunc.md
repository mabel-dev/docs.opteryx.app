---
title: TRUNC — Opteryx Function
description: Truncates a numeric value toward zero at the requested scale.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

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
Truncates to the start of the specified unit. The `unit` argument must be a constant expression. This overload is reachable only for a DATE LITERAL, which is constant-folded at plan time: over a DATE COLUMN there is no native kernel and the call is refused with "outside the c-native kernel set". Cast the column to TIMESTAMP to truncate it. Also spelled `DATE_TRUNC(unit, value)` - unit FIRST.
Truncates to the start of the specified unit. The `unit` argument must be a constant expression. Also spelled `DATE_TRUNC(unit, value)` - unit FIRST, the Postgres/Snowflake/DuckDB order - which is planned as this call.
