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

- **`<left>`** — An integer value. Accepts [`integer`](../types/integer).
- **`<right>`** — An integer value. The result keeps the operands' integer width rather than widening to 64-bit. Accepts [`integer`](../types/integer).

## Returns

[`integer`](../types/integer)

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

- [Bitwise OR `|`](bitwiseor)
- [Bitwise XOR `^`](bitwisexor)
