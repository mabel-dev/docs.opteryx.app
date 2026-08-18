---
title: Logical AND — Opteryx Operator
description: Returns true only when both boolean operands evaluate to true. Symbol: AND
---

# Logical AND

Returns true only when both boolean operands evaluate to true.

**Category:** logical

**SQL symbol:** `AND`

## Syntax

```sql
<left> AND <right>
```

## Parameters

- **`<left>`** — A boolean expression. Accepts [`boolean`](../types/boolean.md).
- **`<right>`** — A boolean expression. Accepts [`boolean`](../types/boolean.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE gravity > 5 AND number_of_moons = 0;
```

## Signatures

- `boolean AND boolean` → boolean

## See Also

- [Logical OR `OR`](or.md)
- [Logical XOR `XOR`](xor.md)
