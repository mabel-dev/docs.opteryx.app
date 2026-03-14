---
title: Modulo — Opteryx Operator
description: Returns the remainder after division of the left numeric operand by the right numeric operand. Symbol: %
---

# Modulo

Modulo operator.

Returns the remainder after division of the left numeric operand by the right numeric operand.

**Category:** binary

**Node kind:** binary

**SQL symbol:** `%`

## Example

```sql
SELECT col1 % col2 FROM table;
```

**Signatures:** 2

## Signatures

- `double % integer` → double
- `integer % integer` → integer

## Types

- **Left:** double, integer
- **Right:** integer
- **Result:** double, integer
