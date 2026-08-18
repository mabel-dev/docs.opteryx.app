---
title: Array contains all — Opteryx Operator
description: Returns true when the left array contains all values from the right array. Symbol: @>>
---

# Array contains all

Returns true when the left array contains all values from the right array.

**Category:** comparison

**SQL symbol:** `@>>`

## Syntax

```sql
<array> @>> <values>
```

## Parameters

- **`<array>`** — The array to search. Accepts [`array`](../types/array.md).
- **`<values>`** — The array of values that must all be present. Accepts [`array`](../types/array.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT ['a','b'] @>> ['a','b'];
```

## Signatures

- `array @>> array` → boolean

## See Also

- [Array contains any `@>`](atarrow.md)
- [In list `IN`](inlist.md)
