---
title: Bitwise XOR — Opteryx Operator
description: Combines integer operands using a bitwise exclusive OR operation. Symbol: ^
---

# Bitwise XOR

Combines integer operands using a bitwise exclusive OR operation.

**Category:** bitwise

**SQL symbol:** `^`

## Syntax

```sql
<left> ^ <right>
```

## Parameters

- **`<left>`** — An integer value. Accepts [`integer`](../types/integer.md).
- **`<right>`** — An integer value. Accepts [`integer`](../types/integer.md).

## Returns

[`integer`](../types/integer.md)

## Examples

```sql
SELECT 12 ^ 10;
```

```
6
```

## Signatures

- `integer ^ integer` → integer

## Notes

`^` is exclusive OR, not exponentiation - a habit worth checking when porting SQL from systems where it raises to a power.

## See Also

- [Bitwise AND `&`](bitwiseand.md)
- [Bitwise OR `|`](bitwiseor.md)
