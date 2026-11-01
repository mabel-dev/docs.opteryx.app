---
title: In list — Opteryx Operator
description: Returns true when the left operand matches any element in the right-hand list or array. Symbol: IN
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# In list

Returns true when the left operand matches any element in the right-hand list or array.

**Category:** comparison

**SQL symbol:** `IN`

**Precedence:** level 9 of 15 (1 binds tightest) — see [operator precedence](../operators#operator-precedence).

## Syntax

```sql
<value> IN (<item> [, ...])
<value> IN <array>
```

## Parameters

- **`<value>`** — The value to look for. Accepts [`boolean`](../types/boolean), [`date`](../types/date), [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer), [`nvarchar`](../types/nvarchar), [`timestamp`](../types/timestamp), [`uuid`](../types/uuid), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).
- **`<list>`** — The values to look in - a parenthesised list, or an array-valued expression. Every element must share one type; a mixed list is rejected at plan time rather than being silently skipped. A NULL element is allowed (see Notes). Accepts [`array`](../types/array).

## Returns

[`boolean`](../types/boolean)

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

```sql
SELECT 1 IN (1, NULL), 2 IN (1, NULL), NULL IN (1, NULL);
```

```
true | NULL | NULL
```

## Signatures

- `boolean IN array` → boolean
- `date IN array` → boolean
- `decimal IN array` → boolean
- `float IN array` → boolean
- `integer IN array` → boolean
- `nvarchar IN array` → boolean
- `timestamp IN array` → boolean
- `uuid IN array` → boolean
- `varbinary IN array` → boolean
- `varchar IN array` → boolean

## Notes

IN is a shorthand for a chain of `=` joined by OR, and inherits its rules: the comparison is exact and case-sensitive, and a list mixing types is an error, not a match against the elements that do share a type. A NULL element is the comparison `= NULL`, which is NULL: `x IN (1, NULL)` is `x = 1 OR x = NULL`, so it is true when `x` is 1 and NULL otherwise - never false. A NULL left operand gives NULL.

## See Also

- [Not in list `NOT IN`](notinlist)
- [Equals `=`](eq)
- [NULL semantics](../advanced/adv-null-semantics)
