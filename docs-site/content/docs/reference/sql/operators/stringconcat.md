---
title: Concatenation — Opteryx Operator
description: Concatenates the left and right string or blob operands. Symbol: ||
---

# Concatenation

String concatenation operator.

Concatenates the left and right string or blob operands.

**Category:** binary

**Node kind:** binary

**SQL symbol:** `||`

## Example

```sql
SELECT col1 || col2 FROM table;
```

**Signatures:** 4

## Signatures

- `blob || blob` → blob
- `blob || varchar` → blob
- `varchar || blob` → blob
- `varchar || varchar` → varchar

## Types

- **Left:** blob, varchar
- **Right:** blob, varchar
- **Result:** blob, varchar
