---
title: Logical XOR — Opteryx Operator
description: Returns true when exactly one boolean operand evaluates to true. Symbol: XOR
---

# Logical XOR

Logical exclusive OR.

Returns true when exactly one boolean operand evaluates to true.

**Category:** logical

**Node kind:** logical

**SQL symbol:** `XOR`

## Example

```sql
SELECT col1 XOR col2 FROM table;
```

**Signatures:** 1

## Signatures

- `boolean XOR boolean` → boolean

## Types

- **Left:** boolean
- **Right:** boolean
- **Result:** boolean
