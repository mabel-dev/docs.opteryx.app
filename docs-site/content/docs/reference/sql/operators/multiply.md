---
title: Multiplication — Opteryx Operator
description: Returns the product of two numeric operands. Symbol: *
---

# Multiplication

Multiplication operator.

Returns the product of two numeric operands.

**Category:** binary

**Node kind:** binary

**SQL symbol:** `*`

## Example

```sql
SELECT col1 * col2 FROM table;
```

**Signatures:** 7

## Signatures

- `decimal * decimal` → decimal
- `decimal * integer` → decimal
- `double * double` → double
- `double * integer` → double
- `integer * decimal` → double
- `integer * double` → double
- `integer * integer` → integer

## Types

- **Left:** decimal, double, integer
- **Right:** decimal, double, integer
- **Result:** decimal, double, integer
