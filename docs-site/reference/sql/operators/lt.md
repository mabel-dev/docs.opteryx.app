---
title: Less than — Opteryx Operator
description: Returns true when the left operand is less than the right operand. Symbol: <
---

# Less than

Returns true when the left operand is less than the right operand.

**Category:** comparison

**SQL symbol:** `<`

## Syntax

```sql
<left> < <right>
```

## Parameters

- **`<left>`** — The value to compare. Accepts [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`nvarchar`](../types/nvarchar.md), [`timestamp`](../types/timestamp.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<right>`** — The value to compare it against. Accepts [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`nvarchar`](../types/nvarchar.md), [`timestamp`](../types/timestamp.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE gravity < 5;
```

## Signatures

- `date < date` → boolean
- `date < timestamp` → boolean
- `decimal < decimal` → boolean
- `decimal < float` → boolean
- `decimal < integer` → boolean
- `float < decimal` → boolean
- `float < float` → boolean
- `float < integer` → boolean
- `integer < decimal` → boolean
- `integer < float` → boolean
- `integer < integer` → boolean
- `interval < interval` → boolean
- `nvarchar < nvarchar` → boolean
- `nvarchar < varbinary` → boolean
- `nvarchar < varchar` → boolean
- `timestamp < date` → boolean
- `timestamp < timestamp` → boolean
- `varbinary < nvarchar` → boolean
- `varbinary < varbinary` → boolean
- `varbinary < varchar` → boolean
- `varchar < nvarchar` → boolean
- `varchar < varbinary` → boolean
- `varchar < varchar` → boolean

## See Also

- [Less than or equal `<=`](lteq.md)
- [Greater than `>`](gt.md)
- [Greater than or equal `>=`](gteq.md)
