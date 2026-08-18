---
title: Not regex like — Opteryx Operator
description: Returns true when the left string does not match the regular expression on the right. Symbol: NOT RLIKE
---

# Not regex like

Returns true when the left string does not match the regular expression on the right.

**Category:** comparison

**SQL symbol:** `NOT RLIKE`

## Syntax

```sql
<haystack> NOT RLIKE <regex>
```

## Parameters

- **`<haystack>`** — The value tested against the expression. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<regex>`** — The regular expression that must not match. It matches anywhere in the value unless anchored. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE name NOT RLIKE '^M' LIMIT 3;
```

```
Venus
Earth
Jupiter
```

## Signatures

- `nvarchar NOT RLIKE nvarchar` → boolean
- `nvarchar NOT RLIKE varbinary` → boolean
- `nvarchar NOT RLIKE varchar` → boolean
- `varbinary NOT RLIKE nvarchar` → boolean
- `varbinary NOT RLIKE varbinary` → boolean
- `varbinary NOT RLIKE varchar` → boolean
- `varchar NOT RLIKE nvarchar` → boolean
- `varchar NOT RLIKE varbinary` → boolean
- `varchar NOT RLIKE varchar` → boolean

## See Also

- [Regex like `RLIKE`](rlike.md)
- [Not like `NOT LIKE`](notlike.md)
- [NULL semantics](../advanced/adv-null-semantics.md)
