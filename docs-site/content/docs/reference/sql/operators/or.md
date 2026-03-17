---
title: Logical OR — Opteryx Operator
description: Returns true when either boolean operand evaluates to true. Symbol: OR
---

# Logical OR

Logical disjunction.

Returns true when either boolean operand evaluates to true.

**Category:** logical

**SQL symbol:** `OR`

## Example

```sql
SELECT TRUE OR TRUE; -- expected: TRUE
```

## Signatures

- `boolean OR boolean` → boolean

## Types

- **Left:** boolean
- **Right:** boolean
- **Result:** boolean
