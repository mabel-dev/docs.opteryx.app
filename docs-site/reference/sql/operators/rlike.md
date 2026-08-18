---
title: Regex like — Opteryx Operator
description: Returns true when the left string matches the regular expression on the right. Symbol: RLIKE
---

# Regex like

Returns true when the left string matches the regular expression on the right.

**Category:** comparison

**SQL symbol:** `RLIKE`

## Syntax

```sql
<haystack> RLIKE <regex>
```

## Parameters

- **`<haystack>`** — The value tested against the expression. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<regex>`** — The regular expression to match. Unlike LIKE, it matches anywhere in the value unless anchored with `^` and `$`. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE name RLIKE '^M.*s$';
```

```
Mars
```

## Signatures

- `nvarchar RLIKE nvarchar` → boolean
- `nvarchar RLIKE varbinary` → boolean
- `nvarchar RLIKE varchar` → boolean
- `varbinary RLIKE nvarchar` → boolean
- `varbinary RLIKE varbinary` → boolean
- `varbinary RLIKE varchar` → boolean
- `varchar RLIKE nvarchar` → boolean
- `varchar RLIKE varbinary` → boolean
- `varchar RLIKE varchar` → boolean

## Notes

A regular expression is more expressive than a LIKE pattern and more expensive to run; prefer LIKE when a prefix or suffix match is all that is needed.

## See Also

- [Not regex like `NOT RLIKE`](notrlike.md)
- [Like `LIKE`](like.md)
- [NULL semantics](../null-semantics.md)
