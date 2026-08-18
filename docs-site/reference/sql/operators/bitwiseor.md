---
title: Bitwise OR — Opteryx Operator
description: Combines integer operands using a bitwise OR operation. Symbol: |
---

# Bitwise OR

Combines integer operands using a bitwise OR operation.

**Category:** bitwise

**SQL symbol:** `|`

## Syntax

```sql
<left> | <right>
```

## Parameters

- **`<left>`** — An integer value. Accepts [`integer`](../types/integer.md).
- **`<right>`** — An integer value. Accepts [`integer`](../types/integer.md).

## Returns

[`integer`](../types/integer.md)

## Examples

```sql
SELECT 12 | 10;
```

## Signatures

- `integer | integer` → integer

## See Also

- [Bitwise AND `&`](bitwiseand.md)
- [Bitwise XOR `^`](bitwisexor.md)
