---
title: JSON extract text — Opteryx Operator
description: Returns the selected JSON value encoded as a blob or text-like binary value. Symbol: ->>
---

# JSON extract text

Returns the selected JSON value encoded as a blob or text-like binary value.

**Category:** extraction

**SQL symbol:** `->>`

## Syntax

```sql
<document> ->> <path>
```

## Parameters

- **`<document>`** — The JSON document to read from. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar), [`variant`](../types/variant).
- **`<path>`** — The key or path to select, in the same spellings `->` accepts. A path that is not present gives NULL. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).

## Returns

[`nvarchar`](../types/nvarchar)

## Examples

```sql
SELECT '{"name": "Earth", "moons": 1}' ->> 'name';
```

```
Earth
```

## Signatures

- `nvarchar ->> nvarchar` → nvarchar
- `nvarchar ->> varbinary` → nvarchar
- `nvarchar ->> varchar` → nvarchar
- `varbinary ->> nvarchar` → nvarchar
- `varbinary ->> varbinary` → nvarchar
- `varbinary ->> varchar` → nvarchar
- `varchar ->> nvarchar` → nvarchar
- `varchar ->> varbinary` → nvarchar
- `varchar ->> varchar` → nvarchar
- `variant ->> nvarchar` → nvarchar
- `variant ->> varchar` → nvarchar

## Notes

Use `->>` when the value is going to be compared with a string literal: `->` would leave it JSON-quoted and the comparison would not match.

## See Also

- [JSON extract `->`](arrow)
- [JSON path exists `@?`](atquestion)
