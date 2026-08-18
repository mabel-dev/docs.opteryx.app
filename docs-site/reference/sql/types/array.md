---
title: ARRAY — Opteryx Type
description: ARRAY
---

# ARRAY

An ordered sequence of elements, all of the same type. Array columns appear when reading Parquet or JSONL files that contain repeated/array fields. The element type is declared as `ARRAY<type>` (e.g. `ARRAY<INTEGER>`, `ARRAY<VARCHAR>`).

## Comparisons

This type does not support direct comparisons with `=`, `<`, or `>`. Extract or cast values first.

## Operators

| Operator | Syntax | Description |
|----------|--------|-------------|
| [`@>`](../operators/atarrow.md) | `<array> @> <values>` | Array containment operator. |
| [`@>>`](../operators/arraycontainsall.md) | `<array> @>> <values>` | Array contains-all operator. |
| [`IN`](../operators/inlist.md) | `<value> IN (<item> [, ...])` <br> `<value> IN <array>` | Membership comparison. |
| [`NOT IN`](../operators/notinlist.md) | `<value> NOT IN (<item> [, ...])` <br> `<value> NOT IN <array>` | Negated membership comparison. |
| [`[]`](../operators/mapaccess.md) | `<value>[<index>]` | Subscript access operator. |

## Notes

Individual elements are accessed with subscript notation: `arr[0]` returns the first element (zero-indexed, negative indices count from the end). Array literals (`[1, 2, 3]`) are valid as an operand of `IN`, `@>`, `@>>`, or `CAST(... AS VECTOR(n))` — just not as a bare item in the SELECT list.

## Limitations

- There is no standalone array literal syntax in the SELECT list. `SELECT [1, 2, 3]` is not valid, though `[1, 2, 3]` is valid as an operand elsewhere (see notes).
- Array EQUALITY is not supported (no `=` operator registered for ARRAY = ARRAY). Membership/containment checks (`col IN (...)`, `@>`, `@>>`) DO work directly in a WHERE clause — the array itself just can't be compared for equality.
- Only VARIANT and VARCHAR values holding JSON array text can be CAST to ARRAY (e.g. `(v -> 'items')::ARRAY<VARCHAR>`). No other scalar can: `1::ARRAY<INTEGER>` is an error, not the one-element array `[1]`.
- CAST to ARRAY is strict. A row whose JSON is not an array (an object, or a bare scalar), or which holds an element that is not already of the declared element type, fails the whole row — elements are never individually nulled, and a number is never stringified to satisfy `ARRAY<VARCHAR>`. Use TRY_CAST to turn such rows into NULL instead of an error. A JSON `null` element is not a failure; it becomes a NULL element.
- Element access (`arr[i]`) is unsupported for VECTOR_FP16 and DECIMAL128 element types — it fails loud rather than returning a stripped or misread value.

## See Also

- [Working with arrays](../advanced/adv-working-with-lists.md) — worked examples.
