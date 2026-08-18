---
title: Equals — Opteryx Operator
description: Returns true when both operands compare equal. Symbol: =
---

# Equals

Returns true when both operands compare equal.

**Category:** comparison

**SQL symbol:** `=`

## Syntax

```sql
<left> = <right>
```

## Parameters

- **`<left>`** — The value to compare. Numeric types compare across the family, so `1 = 1.0` is true. Accepts [`boolean`](../types/boolean.md), [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`nvarchar`](../types/nvarchar.md), [`timestamp`](../types/timestamp.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<right>`** — The value to compare it against. It must be type-compatible with the left - a number and a string are rejected rather than coerced. Accepts [`boolean`](../types/boolean.md), [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`interval`](../types/interval.md), [`nvarchar`](../types/nvarchar.md), [`timestamp`](../types/timestamp.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE name = 'Earth';
```

```
Earth
```

```sql
SELECT 'Mars' = 'mars', 1 = 1.0, 1 = NULL;
```

```
false | true | NULL
```

## Signatures

- `boolean = boolean` → boolean
- `date = date` → boolean
- `date = timestamp` → boolean
- `decimal = decimal` → boolean
- `decimal = float` → boolean
- `decimal = integer` → boolean
- `float = decimal` → boolean
- `float = float` → boolean
- `float = integer` → boolean
- `integer = decimal` → boolean
- `integer = float` → boolean
- `integer = integer` → boolean
- `interval = interval` → boolean
- `nvarchar = nvarchar` → boolean
- `nvarchar = varbinary` → boolean
- `nvarchar = varchar` → boolean
- `timestamp = date` → boolean
- `timestamp = timestamp` → boolean
- `varbinary = nvarchar` → boolean
- `varbinary = varbinary` → boolean
- `varbinary = varchar` → boolean
- `varchar = nvarchar` → boolean
- `varchar = varbinary` → boolean
- `varchar = varchar` → boolean

## Notes

Comparison is three-valued: NULL on either side gives NULL, never true or false, and `NULL = NULL` is NULL too - `IS NULL` is the test for absence. String comparison is case-sensitive (`'Mars' = 'mars'` is false), unlike column NAMES, which are not.

## See Also

- [Not equals `!=`](noteq.md)
- [In list `IN`](inlist.md)
- [NULL semantics](../null-semantics.md)
