---
title: Integer division — Opteryx Operator
description: Divides two integers and truncates the result toward zero. Symbol: DIV
---

# Integer division

Divides two integers and truncates the result toward zero.

**Category:** binary

**SQL symbol:** `DIV`

## Syntax

```sql
<dividend> DIV <divisor>
```

## Parameters

- **`<dividend>`** — The integer to divide. Accepts [`integer`](../types/integer.md).
- **`<divisor>`** — The integer to divide by. Accepts [`integer`](../types/integer.md).

## Returns

[`integer`](../types/integer.md)

## Examples

```sql
SELECT 7 DIV 2;
```

## Signatures

- `integer DIV integer` → integer

## See Also

- [Division `/`](divide.md)
- [Modulo `%`](modulo.md)
