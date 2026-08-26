---
title: Modulo — Opteryx Operator
description: Returns the remainder after division of the left numeric operand by the right numeric operand. Symbol: %
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Modulo

Returns the remainder after division of the left numeric operand by the right numeric operand.

**Category:** binary

**SQL symbol:** `%`

## Syntax

```sql
<dividend> % <divisor>
```

## Parameters

- **`<dividend>`** — The value to divide. Its sign is the sign of the result. Accepts [`float`](../types/float), [`integer`](../types/integer).
- **`<divisor>`** — The value to divide by. Accepts [`integer`](../types/integer).

## Returns

[`float`](../types/float), [`integer`](../types/integer)

## Examples

```sql
SELECT 7 % 2, -7 % 2, 7 % -2;
```

```
1 | -1 | 1
```

## Signatures

- `float % integer` → float
- `integer % integer` → integer

## Notes

The remainder takes the sign of the DIVIDEND, not the divisor: `-7 % 2` is -1 and `7 % -2` is 1. That is C and Go's rule, not Python's, where `-7 % 2` is 1.

## See Also

- [Division `/`](divide)
- [Integer division `DIV`](myintegerdivide)
