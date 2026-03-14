---
title: Bitwise OR — Opteryx Operator
description: Combines integer operands using a bitwise OR operation. Symbol: |
---

# Bitwise OR

Bitwise OR operator.

Combines integer operands using a bitwise OR operation.

**Category:** binary

**Node kind:** binary

**SQL symbol:** `|`

## Example

```sql
SELECT col1 | col2 FROM table;
```

**Signatures:** 4

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

The same token may also appear in non-bitwise contexts depending on operand types.
