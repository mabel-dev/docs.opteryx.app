---
title: Array contains any — Opteryx Operator
description: Returns true when the left array contains any of the values provided by the right array. Symbol: @>
---

# Array contains any

Array containment operator.

Returns true when the left array contains any of the values provided by the right array.

**Category:** comparison

**Node kind:** comparison

**SQL symbol:** `@>`

## Example

```sql
SELECT col1 @> col2 FROM table;
```

**Signatures:** 1

## Signatures

- `array @> array` → boolean

## Types

- **Left:** array
- **Right:** array
- **Result:** boolean
