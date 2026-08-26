---
title: CEILING — Opteryx Function
description: Calculates the smallest integer greater than or equal to the input.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# CEILING

Calculates the smallest integer greater than or equal to the input.

**Category:** Numeric Functions

## Syntax

```sql
CEILING(num, [scale...])
```

## Arguments

- **num** `number`
    Numeric value to round upward.
- **scale** `integer` [optional | variadic]
    Decimal scale to apply before taking the ceiling. Negative values round to tens, hundreds, and larger positions. Optional. Can be repeated.

## Returns

**FLOAT** — Returns the computed result as `FLOAT`.

## Usage Notes

When `scale` is provided, positive values affect digits to the right of the decimal point and negative values affect tens, hundreds, and larger positions.
