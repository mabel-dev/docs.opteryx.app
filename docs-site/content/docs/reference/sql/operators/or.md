---
title: Logical OR — Opteryx Operator
description: Returns true when either boolean operand evaluates to true. Symbol: OR
---

# Logical OR

Logical disjunction.

Returns true when either boolean operand evaluates to true.

**Category:** logical

**Node kind:** logical

**SQL symbol:** `OR`

## Example

```sql
SELECT col1 OR col2 FROM table;
```

**Signatures:** 1

## Signatures

- `boolean OR boolean` → boolean

## Types

- **Left:** boolean
- **Right:** boolean
- **Result:** boolean
