---
title: Bitwise OR — Opteryx Operator
description: Combines integer operands using a bitwise OR operation. When used with address and CIDR-compatible operands, the same `|` token acts as an IP containment predicate and returns a boolean result. Symbol: |
---

# Bitwise OR

Bitwise OR and IP containment operator.

Combines integer operands using a bitwise OR operation. When used with address and CIDR-compatible operands, the same `|` token acts as an IP containment predicate and returns a boolean result.

**Category:** bitwise

**SQL symbol:** `|`

## Example

```sql
SELECT 1 | 1;
```

## Signatures

- `blob | varchar` → boolean
- `integer | integer` → integer
- `varchar | blob` → boolean
- `varchar | varchar` → boolean

## Types

- **Left:** blob, integer, varchar
- **Right:** blob, integer, varchar
- **Result:** boolean, integer

## Notes

This operator is overloaded by operand type: integer inputs perform bitwise OR, while address/CIDR-style inputs use `|` for containment checks.
