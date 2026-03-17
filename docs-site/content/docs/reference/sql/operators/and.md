---
title: Logical AND — Opteryx Operator
description: Returns true only when both boolean operands evaluate to true. Symbol: AND
---

# Logical AND

Logical conjunction.

Returns true only when both boolean operands evaluate to true.

**Category:** logical

**SQL symbol:** `AND`

## Example

```sql
SELECT TRUE AND TRUE; -- expected: TRUE
```

## Signatures

- `boolean AND boolean` → boolean

## Types

- **Left:** boolean
- **Right:** boolean
- **Result:** boolean
