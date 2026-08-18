---
title: Not in list — Opteryx Operator
description: Returns true when the left operand does not match any element in the right-hand list or array. Symbol: NOT IN
---

# Not in list

Returns true when the left operand does not match any element in the right-hand list or array.

**Category:** comparison

**SQL symbol:** `NOT IN`

## Syntax

```sql
<value> NOT IN (<item> [, ...])
<value> NOT IN <array>
```

## Parameters

- **`<value>`** — The value to look for. Accepts [`boolean`](../types/boolean.md), [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`nvarchar`](../types/nvarchar.md), [`timestamp`](../types/timestamp.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<list>`** — The values to look in - a parenthesised list, or an array-valued expression. Accepts [`array`](../types/array.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE name NOT IN ('Earth', 'Mars');
```

## Signatures

- `boolean NOT IN array` → boolean
- `date NOT IN array` → boolean
- `decimal NOT IN array` → boolean
- `float NOT IN array` → boolean
- `integer NOT IN array` → boolean
- `nvarchar NOT IN array` → boolean
- `timestamp NOT IN array` → boolean
- `varbinary NOT IN array` → boolean
- `varchar NOT IN array` → boolean

## See Also

- [In list `IN`](inlist.md)
- [Not equals `!=`](noteq.md)
