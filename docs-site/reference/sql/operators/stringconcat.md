---
title: Concatenation — Opteryx Operator
description: Concatenates the left and right string or blob operands. Symbol: ||
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Concatenation

Concatenates the left and right string or blob operands.

**Category:** binary

**SQL symbol:** `||`

## Syntax

```sql
<left> || <right>
```

## Parameters

- **`<left>`** — The value to concatenate to. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).
- **`<right>`** — The value to append. It must be the SAME string type as the left - VARCHAR with VARCHAR, VARBINARY with VARBINARY - and a number must be cast first. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).

## Returns

[`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar)

## Examples

```sql
SELECT name || ' (planet)' FROM $planets LIMIT 3;
```

```
Mercury (planet)
Venus (planet)
Earth (planet)
```

```sql
SELECT 'a' || NULL;
```

```
NULL
```

## Signatures

- `nvarchar || nvarchar` → nvarchar
- `varbinary || varbinary` → varbinary
- `varchar || varchar` → varchar

## Notes

The operands must be the same string type; mixing VARCHAR and VARBINARY is rejected rather than silently coerced. `x || NULL` is NULL for every row - it is not treated as an empty string - but the expression still carries the string operand's type.

## See Also

- [Addition `+`](plus)
