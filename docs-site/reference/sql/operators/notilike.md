---
title: Not case-insensitive like — Opteryx Operator
description: Returns true when the left string does not match the SQL ILIKE pattern on the right. Symbol: NOT ILIKE
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Not case-insensitive like

Returns true when the left string does not match the SQL ILIKE pattern on the right.

**Category:** comparison

**SQL symbol:** `NOT ILIKE`

## Syntax

```sql
<haystack> NOT ILIKE <pattern>
```

## Parameters

- **`<haystack>`** — The value tested against the pattern. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).
- **`<pattern>`** — A SQL LIKE pattern, matched without regard to ASCII case. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).

## Returns

[`boolean`](../types/boolean)

## Examples

```sql
SELECT name FROM $planets WHERE name NOT ILIKE 'ma%' LIMIT 3;
```

```
Mercury
Venus
Earth
```

## Signatures

- `nvarchar NOT ILIKE nvarchar` → boolean
- `nvarchar NOT ILIKE varbinary` → boolean
- `nvarchar NOT ILIKE varchar` → boolean
- `varbinary NOT ILIKE nvarchar` → boolean
- `varbinary NOT ILIKE varbinary` → boolean
- `varbinary NOT ILIKE varchar` → boolean
- `varchar NOT ILIKE nvarchar` → boolean
- `varchar NOT ILIKE varbinary` → boolean
- `varchar NOT ILIKE varchar` → boolean

## Notes

Case folding is ASCII-only, exactly as for ILIKE.

## See Also

- [Case-insensitive like `ILIKE`](ilike)
- [Not like `NOT LIKE`](notlike)
- [NULL semantics](../advanced/adv-null-semantics)
