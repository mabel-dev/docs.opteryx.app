---
title: Right shift — Opteryx Operator
description: Shifts the bits of the left integer operand right by the number of positions in the right operand. Symbol: >>
---

# Right shift

Right shift operator.

Shifts the bits of the left integer operand right by the number of positions in the right operand.

**Category:** binary

**Node kind:** binary

**SQL symbol:** `>>`

## Example

```sql
SELECT col1 >> col2 FROM table;
```

**Signatures:** 1

## Signatures

- `integer >> integer` → integer

## Types

- **Left:** integer
- **Right:** integer
- **Result:** integer
