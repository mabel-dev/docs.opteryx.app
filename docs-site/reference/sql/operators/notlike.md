---
title: Not like — Opteryx Operator
description: Returns true when the left string does not match the SQL LIKE pattern on the right. Symbol: NOT LIKE
---

# Not like

Returns true when the left string does not match the SQL LIKE pattern on the right.

**Category:** comparison

**SQL symbol:** `NOT LIKE`

## Syntax

```sql
<haystack> NOT LIKE <pattern>
```

## Parameters

- **`<haystack>`** — The value tested against the pattern. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<pattern>`** — A SQL LIKE pattern: `%` matches any run of characters, `_` matches exactly one, and every other character matches itself. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE name NOT LIKE 'Ma%';
```

## Signatures

- `nvarchar NOT LIKE nvarchar` → boolean
- `nvarchar NOT LIKE varbinary` → boolean
- `nvarchar NOT LIKE varchar` → boolean
- `varbinary NOT LIKE nvarchar` → boolean
- `varbinary NOT LIKE varbinary` → boolean
- `varbinary NOT LIKE varchar` → boolean
- `varchar NOT LIKE nvarchar` → boolean
- `varchar NOT LIKE varbinary` → boolean
- `varchar NOT LIKE varchar` → boolean

## See Also

- [Like `LIKE`](like.md)
- [Not case-insensitive like `NOT ILIKE`](notilike.md)
