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

- **`<document>`** — The JSON document to read from. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md), [`variant`](../types/variant.md).
- **`<path>`** — The key or path to select, in the same spellings `->` accepts. Accepts [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).

## Returns

[`nvarchar`](../types/nvarchar.md)

## Examples

```sql
SELECT '{"name": "Earth", "moons": 1}' ->> 'name';
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

## See Also

- [JSON extract `->`](arrow.md)
- [JSON path exists `@?`](atquestion.md)
