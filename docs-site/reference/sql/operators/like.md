---
title: Like — Opteryx Operator
description: Returns true when the left string matches the SQL LIKE pattern on the right. Symbol: LIKE
---

# Like

Returns true when the left string matches the SQL LIKE pattern on the right.

**Category:** comparison

**SQL symbol:** `LIKE`

## Syntax

```sql
<haystack> LIKE <pattern>
```

## Parameters

- **`<haystack>`** — The value tested against the pattern. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<pattern>`** — A SQL LIKE pattern: `%` matches any run of characters, `_` matches exactly one, and every other character matches itself. A column is accepted here, not only a literal - a literal pattern is what lets the planner fuse the match into the scan. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE name LIKE 'Ma%';
```

```sql
SELECT name FROM $planets WHERE name LIKE '%art%';
```

## Signatures

- `nvarchar LIKE nvarchar` → boolean
- `nvarchar LIKE varbinary` → boolean
- `nvarchar LIKE varchar` → boolean
- `varbinary LIKE nvarchar` → boolean
- `varbinary LIKE varbinary` → boolean
- `varbinary LIKE varchar` → boolean
- `varchar LIKE nvarchar` → boolean
- `varchar LIKE varbinary` → boolean
- `varchar LIKE varchar` → boolean

## See Also

- [Not like `NOT LIKE`](notlike.md)
- [Case-insensitive like `ILIKE`](ilike.md)
- [Regex like `RLIKE`](rlike.md)
