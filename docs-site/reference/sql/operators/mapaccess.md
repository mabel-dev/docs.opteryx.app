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

- **`<value>`** — The array, string or blob to read from. Accepts [`array`](../types/array), [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar), [`vector`](../types/vector).
- **`<index>`** — The zero-based position to read. An index past the end gives NULL rather than raising. Accepts [`integer`](../types/integer).

## Returns

[`float`](../types/float), [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar)

Some operand combinations have no fixed result type — the result follows the value being read. See Signatures below.

## Examples

```sql
SELECT ARRAY['a','b','c'][0];
```

```
a
```

```sql
SELECT ARRAY['a','b'][9];
```

```
NULL
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

- [JSON extract `->`](arrow)
