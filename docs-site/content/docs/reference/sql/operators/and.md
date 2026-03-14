---
title: Logical AND — Opteryx Operator
description: Returns true only when both boolean operands evaluate to true. Symbol: AND
---

# Logical AND

Logical conjunction.

Returns true only when both boolean operands evaluate to true.

**Category:** logical

**Node kind:** logical

**SQL symbol:** `AND`

## Example

```sql
SELECT col1 AND col2 FROM table;
```

**Signatures:** 1

## Signatures

- `boolean AND boolean` → boolean

## Types

- **Left:** boolean
- **Right:** boolean
- **Result:** boolean
