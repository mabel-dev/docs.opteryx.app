---
title: Subscript access — Opteryx Operator
description: Returns the element at the requested index from an array, string, or blob-like value. Symbol: []
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

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
- **`<index>`** — The zero-based position to read: 0 is the first element. A negative index counts back from the end, so -1 is the last. An index past either end gives NULL rather than raising. Accepts [`integer`](../types/integer).

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
SELECT ARRAY['a','b','c'][-1];
```

```
c
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

Subscript access is ZERO-based and accepts negative indexes, which count back from the end: `[0]` is the first element and `[-1]` the last. Most SQL dialects index arrays from 1, so a query ported from one of those reads the WRONG element rather than erroring - an out-of-range index gives NULL, so nothing signals the mistake. For arrays the result type depends on the array element type, so the exported result type may be dynamic.

## See Also

- [JSON extract `->`](arrow)
