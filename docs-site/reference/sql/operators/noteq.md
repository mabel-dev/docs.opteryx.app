---
title: Not equals — Opteryx Operator
description: Returns true when the operands do not compare equal. Symbol: !=
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

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

- **`<left>`** — The value to compare. Accepts [`boolean`](../types/boolean), [`date`](../types/date), [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer), [`interval`](../types/interval), [`nvarchar`](../types/nvarchar), [`timestamp`](../types/timestamp), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).
- **`<right>`** — The value to compare it against. It must be type-compatible with the left. Accepts [`boolean`](../types/boolean), [`date`](../types/date), [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer), [`interval`](../types/interval), [`nvarchar`](../types/nvarchar), [`timestamp`](../types/timestamp), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).

## Returns

[`boolean`](../types/boolean)

## Examples

```sql
SELECT name FROM $planets WHERE name != 'Earth' LIMIT 3;
```

```
Mercury
Venus
Mars
```

```sql
SELECT COUNT(*) FROM $planets WHERE surface_pressure != 0;
```

```
4
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

## Notes

`!=` does not mean "everything else": a row whose value is NULL answers NULL, not true, so it is dropped by the WHERE clause. Of the nine planets one has a surface pressure of 0 and four have none recorded, so `surface_pressure != 0` returns four rows, not eight - `OR surface_pressure IS NULL` is how the unknown rows are kept.

## See Also

- [Equals `=`](eq)
- [Not in list `NOT IN`](notinlist)
- [NULL semantics](../advanced/adv-null-semantics)
