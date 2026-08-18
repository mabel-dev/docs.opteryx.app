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

- **`<haystack>`** — The value tested against the pattern. VARBINARY is accepted as well as text, and is matched as bytes. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<pattern>`** — A SQL LIKE pattern: `%` matches any run of characters including none, `_` matches exactly one, and every other character matches itself. The whole value must match, not part of it - `'abcd' LIKE 'a_c'` is false. A column is accepted here, not only a literal; a literal is what lets the planner fuse the match into the scan. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE name LIKE 'Ma%';
```

```
Mars
```

```sql
SELECT 'abc' LIKE 'a_c', 'abcd' LIKE 'a_c';
```

```
true | false
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

## Notes

Matching is case-sensitive; ILIKE is the case-insensitive form. A NULL on either side is not matched.

## See Also

- [Not like `NOT LIKE`](notlike.md)
- [Case-insensitive like `ILIKE`](ilike.md)
- [Regex like `RLIKE`](rlike.md)
- [NULL semantics](../null-semantics.md)
