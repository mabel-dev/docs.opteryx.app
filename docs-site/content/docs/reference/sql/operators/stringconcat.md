---
title: Concatenation — Opteryx Operator
description: Concatenates the left and right string or blob operands. Symbol: ||
---

# Concatenation

String concatenation operator.

Concatenates the left and right string or blob operands.

**Category:** binary

**SQL symbol:** `||`

## Example

```sql
SELECT 'a' || 'a'; -- expected: 'aa'
```

## Signatures

- `blob || blob` → blob
- `blob || varchar` → blob
- `varchar || blob` → blob
- `varchar || varchar` → varchar

## Types

- **Left:** blob, varchar
- **Right:** blob, varchar
- **Result:** blob, varchar
