---
title: In list — Opteryx Operator
description: Returns true when the left operand matches any element in the right-hand list or array. Symbol: IN
---

# In list

Returns true when the left operand matches any element in the right-hand list or array.

**Category:** comparison

**SQL symbol:** `IN`

## Syntax

```sql
<value> IN (<item> [, ...])
<value> IN <array>
```

## Parameters

- **`<value>`** — The value to look for. Accepts [`boolean`](../types/boolean.md), [`date`](../types/date.md), [`decimal`](../types/decimal.md), [`float`](../types/float.md), [`integer`](../types/integer.md), [`nvarchar`](../types/nvarchar.md), [`timestamp`](../types/timestamp.md), [`varbinary`](../types/varbinary.md), [`varchar`](../types/varchar.md).
- **`<list>`** — The values to look in - a parenthesised list, or an array-valued expression. Every element must share one type; a mixed list, NULL included, is rejected at plan time rather than being silently skipped. Accepts [`array`](../types/array.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE name IN ('Earth', 'Mars');
```

```
Earth
Mars
```

```sql
SELECT 2 IN (1, 2, 3), 9 IN (1, 2, 3);
```

```
true | false
```

## Signatures

- `boolean IN array` → boolean
- `date IN array` → boolean
- `decimal IN array` → boolean
- `float IN array` → boolean
- `integer IN array` → boolean
- `nvarchar IN array` → boolean
- `timestamp IN array` → boolean
- `varbinary IN array` → boolean
- `varchar IN array` → boolean

## Notes

IN is a shorthand for a chain of `=`, and inherits its rules: the comparison is exact and case-sensitive. A list mixing types - `IN (NULL, 2)` among them - is an error, not a match against the elements that do share a type.

## See Also

- [Not in list `NOT IN`](notinlist.md)
- [Equals `=`](eq.md)
- [NULL semantics](../null-semantics.md)
