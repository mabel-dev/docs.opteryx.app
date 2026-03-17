---
title: Array contains any — Opteryx Operator
description: Returns true when the left array contains any of the values provided by the right array. Symbol: @>
---

# Array contains any

Array containment operator.

Returns true when the left array contains any of the values provided by the right array.

**Category:** comparison

**SQL symbol:** `@>`

## Example

```sql
SELECT ARRAY[1,2] @> ARRAY[1,2]; -- expected: TRUE
```

## Signatures

- `array @> array` → boolean

## Types

- **Left:** array
- **Right:** array
- **Result:** boolean
