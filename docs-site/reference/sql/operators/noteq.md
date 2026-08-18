---
title: Not equals — Opteryx Operator
description: Returns true when the operands do not compare equal. Symbol: !=
---

# Not equals

Returns true when the operands do not compare equal.

**Category:** comparison

**SQL symbol:** `!=`

## Syntax

```sql
<left> != <right>
<left> <> <right>
```

## Parameters

- **`<left>`** — The value to compare. Accepts [`boolean`](../types/boolean.md), [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`nvarchar`](../types/nvarchar.md), [`timestamp`](../types/timestamp.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<right>`** — The value to compare it against. Accepts [`boolean`](../types/boolean.md), [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`nvarchar`](../types/nvarchar.md), [`timestamp`](../types/timestamp.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE name != 'Earth';
```

## Signatures

- `boolean != boolean` → boolean
- `date != date` → boolean
- `date != timestamp` → boolean
- `decimal != decimal` → boolean
- `decimal != float` → boolean
- `decimal != integer` → boolean
- `float != decimal` → boolean
- `float != float` → boolean
- `float != integer` → boolean
- `integer != decimal` → boolean
- `integer != float` → boolean
- `integer != integer` → boolean
- `interval != interval` → boolean
- `nvarchar != nvarchar` → boolean
- `nvarchar != varbinary` → boolean
- `nvarchar != varchar` → boolean
- `timestamp != date` → boolean
- `timestamp != timestamp` → boolean
- `varbinary != nvarchar` → boolean
- `varbinary != varbinary` → boolean
- `varbinary != varchar` → boolean
- `varchar != nvarchar` → boolean
- `varchar != varbinary` → boolean
- `varchar != varchar` → boolean

## See Also

- [Equals `=`](eq.md)
- [Not in list `NOT IN`](notinlist.md)
