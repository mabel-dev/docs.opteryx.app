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

- **`<array>`** — The array to search. Accepts [`array`](../types/array).
- **`<values>`** — The array of values to look for. ANY one of them being present is enough; an empty array on this side matches nothing. Accepts [`array`](../types/array).

## Returns

[`boolean`](../types/boolean)

## Examples

```sql
SELECT ['a','b'] @> ['a'];
```

```
true
```

```sql
SELECT ['a','b'] @> ['a','z'], ['a'] @> [];
```

```
true | false
```

## Signatures

- `array @> array` → boolean

## Notes

`@>` is ANY, `@>>` is ALL - the pair is easy to mix up. `['a','b'] @> ['a','z']` is TRUE because one value matched; the same operands under `@>>` are FALSE.

## See Also

- [Array contains all `@>>`](arraycontainsall)
- [In list `IN`](inlist)
- [NULL semantics](../advanced/adv-null-semantics)
