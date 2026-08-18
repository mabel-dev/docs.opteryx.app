---
title: Concatenation — Opteryx Operator
description: Concatenates the left and right string or blob operands. Symbol: ||
---

# Concatenation

Concatenates the left and right string or blob operands.

**Category:** binary

**SQL symbol:** `||`

## Syntax

```sql
<left> || <right>
```

## Parameters

- **`<left>`** — The value to concatenate to. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<right>`** — The value to append. It must be the same type as the left operand. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).

## Returns

[`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md)

## Examples

```sql
SELECT name || ' (planet)' FROM $planets;
```

## Signatures

- `nvarchar || nvarchar` → nvarchar
- `varbinary || varbinary` → varbinary
- `varchar || varchar` → varchar

## Notes

The operands must be the same string type - VARCHAR with VARCHAR, VARBINARY with VARBINARY. Mixing them is rejected rather than silently coerced. `x || NULL` is NULL for every row, but the expression still carries the string operand's type.

## See Also

- [Addition `+`](plus.md)
