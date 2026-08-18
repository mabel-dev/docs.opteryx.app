---
title: Bitwise AND — Opteryx Operator
description: Combines integer operands using a bitwise AND operation. Symbol: &
---

# Bitwise AND

Combines integer operands using a bitwise AND operation.

**Category:** bitwise

**SQL symbol:** `&`

## Syntax

```sql
<left> & <right>
```

## Parameters

- **`<left>`** — An integer value. Accepts [`integer`](../types/integer.md).
- **`<right>`** — An integer value. The result keeps the operands' integer width rather than widening to 64-bit. Accepts [`integer`](../types/integer.md).

## Returns

[`integer`](../types/integer.md)

## Examples

```sql
SELECT 12 & 10;
```

```
8
```

## Signatures

- `integer & integer` → integer

## See Also

- [Bitwise OR `|`](bitwiseor.md)
- [Bitwise XOR `^`](bitwisexor.md)
