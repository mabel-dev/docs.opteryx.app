---
title: Integer division — Opteryx Operator
description: Divides two integers and truncates the result toward zero. Symbol: DIV
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Integer division

Divides two integers and truncates the result toward zero.

**Category:** binary

**SQL symbol:** `DIV`

## Syntax

```sql
<dividend> DIV <divisor>
```

## Parameters

- **`<dividend>`** — The integer to divide. Accepts [`integer`](../types/integer).
- **`<divisor>`** — The integer to divide by. Accepts [`integer`](../types/integer).

## Returns

[`integer`](../types/integer)

## Examples

```sql
SELECT 7 DIV 2, -7 DIV 2;
```

```
3 | -3
```

## Signatures

- `integer DIV integer` → integer

## Notes

Truncation is toward zero, not toward minus infinity: `-7 DIV 2` is -3, where a floor division would give -4.

## See Also

- [Division `/`](divide)
- [Modulo `%`](modulo)
