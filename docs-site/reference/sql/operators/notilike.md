---
title: Not case-insensitive like — Opteryx Operator
description: Returns true when the left string does not match the SQL ILIKE pattern on the right. Symbol: NOT ILIKE
---

# Not case-insensitive like

Returns true when the left string does not match the SQL ILIKE pattern on the right.

**Category:** comparison

**SQL symbol:** `NOT ILIKE`

## Syntax

```sql
<haystack> NOT ILIKE <pattern>
```

## Parameters

- **`<haystack>`** — The value tested against the pattern. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<pattern>`** — A SQL LIKE pattern, matched without regard to ASCII case. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).

## Returns

[`boolean`](../types/boolean.md)

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

- [Case-insensitive like `ILIKE`](ilike.md)
- [Not like `NOT LIKE`](notlike.md)
- [NULL semantics](../advanced/adv-null-semantics.md)
