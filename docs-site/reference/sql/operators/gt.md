---
title: Greater than — Opteryx Operator
description: Returns true when the left operand is greater than the right operand. Symbol: >
---

# Greater than

Returns true when the left operand is greater than the right operand.

**Category:** comparison

**SQL symbol:** `>`

## Syntax

```sql
<left> > <right>
```

## Parameters

- **`<left>`** — The value to compare. Strings order byte-by-byte, so uppercase sorts before lowercase. Accepts [`date`](../types/date), [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer), [`interval`](../types/interval), [`nvarchar`](../types/nvarchar), [`timestamp`](../types/timestamp), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).
- **`<right>`** — The value to compare it against. Accepts [`date`](../types/date), [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer), [`interval`](../types/interval), [`nvarchar`](../types/nvarchar), [`timestamp`](../types/timestamp), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).

## Returns

[`boolean`](../types/boolean)

## Examples

```sql
SELECT name FROM $planets WHERE number_of_moons > 10;
```

```
Jupiter
Saturn
Uranus
Neptune
```

## Signatures

- `date > date` → boolean
- `date > timestamp` → boolean
- `decimal > decimal` → boolean
- `decimal > float` → boolean
- `decimal > integer` → boolean
- `float > decimal` → boolean
- `float > float` → boolean
- `float > integer` → boolean
- `integer > decimal` → boolean
- `integer > float` → boolean
- `integer > integer` → boolean
- `interval > interval` → boolean
- `nvarchar > nvarchar` → boolean
- `nvarchar > varbinary` → boolean
- `nvarchar > varchar` → boolean
- `timestamp > date` → boolean
- `timestamp > timestamp` → boolean
- `varbinary > nvarchar` → boolean
- `varbinary > varbinary` → boolean
- `varbinary > varchar` → boolean
- `varchar > nvarchar` → boolean
- `varchar > varbinary` → boolean
- `varchar > varchar` → boolean

## Notes

NULL on either side gives NULL, so ordering comparisons never match an absent value.

## See Also

- [Greater than or equal `>=`](gteq)
- [Less than `<`](lt)
- [Less than or equal `<=`](lteq)
- [NULL semantics](../advanced/adv-null-semantics)
