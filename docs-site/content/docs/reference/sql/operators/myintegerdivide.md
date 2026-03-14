---
title: Integer division — Opteryx Operator
description: Divides two integers and truncates the result toward zero. Symbol: DIV
---

# Integer division

Integer division operator.

Divides two integers and truncates the result toward zero.

**Category:** binary

**Node kind:** binary

**SQL symbol:** `DIV`

## Example

```sql
SELECT col1 DIV col2 FROM table;
```

**Signatures:** 1

## Signatures

- `integer DIV integer` → integer

## Types

- **Left:** integer
- **Right:** integer
- **Result:** integer
