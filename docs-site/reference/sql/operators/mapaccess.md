---
title: Subscript access — Opteryx Operator
description: Returns the element at the requested index from an array, string, or blob-like value. Symbol: []
---

# Subscript access

Returns the element at the requested index from an array, string, or blob-like value.

**Category:** extraction

**SQL symbol:** `[]`

## Syntax

```sql
<value>[<index>]
```

## Parameters

- **`<value>`** — The array, string or blob to read from. Accepts [`array`](../types/array.md), [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md), [`vector`](../types/vector.md).
- **`<index>`** — The zero-based position to read. Accepts [`integer`](../types/integer.md).

## Returns

[`float`](../types/float.md), [`nvarchar`](../types/nvarchar.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md)

Some operand combinations have no fixed result type — the result follows the value being read. See Signatures below.

## Examples

```sql
SELECT ARRAY['a','b','c'][0];
```

```sql
SELECT name[0] FROM $planets;
```

## Signatures

- `array[integer]` → dynamic
- `nvarchar[integer]` → nvarchar
- `varbinary[integer]` → varbinary
- `varchar[integer]` → varchar
- `vector[integer]` → float

## Notes

Subcript access is zero-based, the first element is at index 0. For arrays the result type depends on the array element type, so the exported result type may be dynamic.

## See Also

- [JSON extract `->`](arrow.md)
