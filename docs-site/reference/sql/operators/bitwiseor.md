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

- **`<left>`** — An integer value. Accepts [`integer`](../types/integer).
- **`<right>`** — An integer value. The result keeps the operands' integer width rather than widening to 64-bit. Accepts [`integer`](../types/integer).

## Returns

[`integer`](../types/integer)

## Examples

```sql
SELECT 12 | 10;
```

```
14
```

## Signatures

- `integer | integer` → integer

## See Also

- [Bitwise AND `&`](bitwiseand)
- [Bitwise XOR `^`](bitwisexor)
