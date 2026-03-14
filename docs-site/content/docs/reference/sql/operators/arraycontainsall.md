---
title: Array contains all — Opteryx Operator
description: Returns true when the left array contains all values from the right array. Symbol: @>>
---

# Array contains all

Array contains-all operator.

Returns true when the left array contains all values from the right array.

**Category:** comparison

**Node kind:** comparison

**SQL symbol:** `@>>`

## Example

```sql
SELECT col1 @>> col2 FROM table;
```

**Signatures:** 1

## Signatures

- `array @>> array` → boolean

## Types

- **Left:** array
- **Right:** array
- **Result:** boolean
