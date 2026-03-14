---
title: Left shift — Opteryx Operator
description: Shifts the bits of the left integer operand left by the number of positions in the right operand. Symbol: <<
---

# Left shift

Left shift operator.

Shifts the bits of the left integer operand left by the number of positions in the right operand.

**Category:** binary

**Node kind:** binary

**SQL symbol:** `<<`

## Example

```sql
SELECT col1 << col2 FROM table;
```

**Signatures:** 1

## Signatures

- `integer << integer` → integer

## Types

- **Left:** integer
- **Right:** integer
- **Result:** integer
