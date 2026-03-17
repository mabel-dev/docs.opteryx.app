---
title: Not in list — Opteryx Operator
description: Returns true when the left operand does not match any element in the right-hand list or array. Symbol: NOT IN
---

# Not in list

Negated membership comparison.

Returns true when the left operand does not match any element in the right-hand list or array.

**Category:** comparison

**SQL symbol:** `NOT IN`

## Example

```sql
SELECT CAST('0102' AS BLOB) NOT IN ARRAY[1,2];
```

## Signatures

- `blob NOT IN array` → boolean
- `boolean NOT IN array` → boolean
- `date NOT IN array` → boolean
- `decimal NOT IN array` → boolean
- `double NOT IN array` → boolean
- `integer NOT IN array` → boolean
- `timestamp NOT IN array` → boolean
- `varchar NOT IN array` → boolean

## Types

- **Left:** blob, boolean, date, decimal, double, integer, timestamp, varchar
- **Right:** array
- **Result:** boolean
