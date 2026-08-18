---
title: Logical OR — Opteryx Operator
description: Returns true when either boolean operand evaluates to true. Symbol: OR
---

# Logical OR

Returns true when either boolean operand evaluates to true.

**Category:** logical

**SQL symbol:** `OR`

## Syntax

```sql
<left> OR <right>
```

## Parameters

- **`<left>`** — A boolean expression. Accepts [`boolean`](../types/boolean.md).
- **`<right>`** — A boolean expression. Accepts [`boolean`](../types/boolean.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE name = 'Earth' OR name = 'Mars';
```

## Signatures

- `boolean OR boolean` → boolean

## See Also

- [Logical AND `AND`](and.md)
- [Logical XOR `XOR`](xor.md)
