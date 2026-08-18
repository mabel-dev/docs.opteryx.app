---
title: In list — Opteryx Operator
description: Returns true when the left operand matches any element in the right-hand list or array. Symbol: IN
---

# In list

Returns true when the left operand matches any element in the right-hand list or array.

**Category:** comparison

**SQL symbol:** `IN`

## Syntax

```sql
<value> IN (<item> [, ...])
<value> IN <array>
```

## Parameters

- **`<value>`** — The value to look for. Accepts [`boolean`](../types/boolean.md), [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`nvarchar`](../types/nvarchar.md), [`timestamp`](../types/timestamp.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<list>`** — The values to look in - a parenthesised list, or an array-valued expression. Accepts [`array`](../types/array.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE name IN ('Earth', 'Mars');
```

## Signatures

- `boolean IN array` → boolean
- `date IN array` → boolean
- `decimal IN array` → boolean
- `float IN array` → boolean
- `integer IN array` → boolean
- `nvarchar IN array` → boolean
- `timestamp IN array` → boolean
- `varbinary IN array` → boolean
- `varchar IN array` → boolean

## See Also

- [Not in list `NOT IN`](notinlist.md)
- [Equals `=`](eq.md)
