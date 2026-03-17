---
title: In list — Opteryx Operator
description: Returns true when the left operand matches any element in the right-hand list or array. Symbol: IN
---

# In list

Membership comparison.

Returns true when the left operand matches any element in the right-hand list or array.

**Category:** comparison

**SQL symbol:** `IN`

## Example

```sql
SELECT CAST('0102' AS BLOB) IN ARRAY[1,2];
```

## Signatures

- `blob IN array` → boolean
- `boolean IN array` → boolean
- `date IN array` → boolean
- `decimal IN array` → boolean
- `double IN array` → boolean
- `integer IN array` → boolean
- `timestamp IN array` → boolean
- `varchar IN array` → boolean

## Types

- **Left:** blob, boolean, date, decimal, double, integer, timestamp, varchar
- **Right:** array
- **Result:** boolean
