---
title: Division — Opteryx Operator
description: Returns the quotient of two numeric operands. Symbol: /
---

# Division

Division operator.

Returns the quotient of two numeric operands.

**Category:** binary

**Node kind:** binary

**SQL symbol:** `/`

## Example

```sql
SELECT col1 / col2 FROM table;
```

**Signatures:** 7

## Signatures

- `decimal / decimal` → decimal
- `decimal / integer` → decimal
- `double / double` → double
- `double / integer` → double
- `integer / decimal` → double
- `integer / double` → double
- `integer / integer` → double

## Types

- **Left:** decimal, double, integer
- **Right:** decimal, double, integer
- **Result:** decimal, double
