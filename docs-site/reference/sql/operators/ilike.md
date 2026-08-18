---
title: Case-insensitive like — Opteryx Operator
description: Returns true when the left string matches the SQL ILIKE pattern on the right without case sensitivity. Symbol: ILIKE
---

# Case-insensitive like

Returns true when the left string matches the SQL ILIKE pattern on the right without case sensitivity.

**Category:** comparison

**SQL symbol:** `ILIKE`

## Syntax

```sql
<haystack> ILIKE <pattern>
```

## Parameters

- **`<haystack>`** — The value tested against the pattern. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<pattern>`** — A SQL LIKE pattern, matched without regard to case: `%` matches any run of characters, `_` matches exactly one. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE name ILIKE 'ma%';
```

## Signatures

- `nvarchar ILIKE nvarchar` → boolean
- `nvarchar ILIKE varbinary` → boolean
- `nvarchar ILIKE varchar` → boolean
- `varbinary ILIKE nvarchar` → boolean
- `varbinary ILIKE varbinary` → boolean
- `varbinary ILIKE varchar` → boolean
- `varchar ILIKE nvarchar` → boolean
- `varchar ILIKE varbinary` → boolean
- `varchar ILIKE varchar` → boolean

## See Also

- [Like `LIKE`](like.md)
- [Not case-insensitive like `NOT ILIKE`](notilike.md)
