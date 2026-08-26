---
title: Not in list — Opteryx Operator
description: Returns true when the left operand does not match any element in the right-hand list or array. Symbol: NOT IN
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

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

- **`<value>`** — The value to look for. Accepts [`boolean`](../types/boolean), [`date`](../types/date), [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer), [`nvarchar`](../types/nvarchar), [`timestamp`](../types/timestamp), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).
- **`<list>`** — The values to look in. Every element must share one type; a mixed list is rejected at plan time. Accepts [`array`](../types/array).

## Returns

[`boolean`](../types/boolean)

## Examples

```sql
SELECT name FROM $planets WHERE name NOT IN ('Earth', 'Mars') LIMIT 3;
```

```
Mercury
Venus
Jupiter
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

## Notes

Like `!=`, a row whose value is NULL answers NULL rather than true, so it does not survive a WHERE clause.

## See Also

- [In list `IN`](inlist)
- [Not equals `!=`](noteq)
- [NULL semantics](../advanced/adv-null-semantics)
