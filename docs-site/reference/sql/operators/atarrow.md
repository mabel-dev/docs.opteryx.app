---
title: Array contains any — Opteryx Operator
description: Returns true when the left array contains any of the values provided by the right array. Symbol: @>
---

# Array contains any

Returns true when the left array contains any of the values provided by the right array.

**Category:** comparison

**SQL symbol:** `@>`

## Syntax

```sql
<array> @> <values>
```

## Parameters

- **`<array>`** — The array to search. Accepts [`array`](../types/array.md).
- **`<values>`** — The array of values to look for. Accepts [`array`](../types/array.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT ['a','b'] @> ['a'];
```

## Signatures

- `array @> array` → boolean

## See Also

- [Array contains all `@>>`](arraycontainsall.md)
- [In list `IN`](inlist.md)
