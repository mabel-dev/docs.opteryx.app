---
title: Array contains all — Opteryx Operator
description: Returns true when the left array contains all values from the right array. Symbol: @>>
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Array contains all

Returns true when the left array contains all values from the right array.

**Category:** comparison

**SQL symbol:** `@>>`

## Syntax

```sql
<array> @>> <values>
```

## Parameters

- **`<array>`** — The array to search. Accepts [`array`](../types/array).
- **`<values>`** — The array of values that must ALL be present for the result to be true. Accepts [`array`](../types/array).

## Returns

[`boolean`](../types/boolean)

## Examples

```sql
SELECT ['a','b'] @>> ['a','b'];
```

```
true
```

```sql
SELECT ['a','b'] @>> ['a','z'];
```

```
false
```

## Signatures

- `array @>> array` → boolean

## Notes

`@>>` is ALL, `@>` is ANY.

## See Also

- [Array contains any `@>`](atarrow)
- [In list `IN`](inlist)
- [NULL semantics](../advanced/adv-null-semantics)
