---
title: CAST — Opteryx Function
description: Type conversion.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# CAST

Type conversion. `TRY_CAST` and `SAFE_CAST` are the non-raising forms - they yield NULL where `CAST` raises.

**Category:** Conversion Functions

`CAST` is SQL syntax rather than a function, so it is documented with the expressions; this page is a pointer.

## Syntax

```sql
CAST(expr AS type)
TRY_CAST(expr AS type)
SAFE_CAST(expr AS type)
CAST(expr AS type FORMAT 'pattern')
expr::type
```

## Notes

A literal operand is converted at plan time. Parameterised targets take their parameters through the cast's parameter channel: `CAST(x AS ARRAY<VARCHAR>)`, `CAST(x AS DECIMAL(p, s))`. `FORMAT` takes a SQL-style pattern (`YYYY-MM-DD`, `HH24:MI`) for parsing a string to DATE or TIMESTAMP and for rendering DATE, TIMESTAMP or INTERVAL to VARCHAR; it is only accepted inside `CAST()`, not with `::`.

## Details

- [Type Casting](../expressions#type-casting) — `CAST`, `::`, `TRY_CAST` and `SAFE_CAST`
- [Data Types](../data-types) — each type page has a Casting table of what converts to and from it
- [Parsing and rendering with an explicit format](../advanced/adv-working-with-timestamps#parsing-and-rendering-with-an-explicit-format) — `CAST(... FORMAT ...)` and the format elements
