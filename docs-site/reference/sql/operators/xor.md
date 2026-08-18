---
title: Logical XOR — Opteryx Operator
description: Returns true when exactly one boolean operand evaluates to true. Symbol: XOR
---

# Logical XOR

Returns true when exactly one boolean operand evaluates to true.

**Category:** logical

**SQL symbol:** `XOR`

## Syntax

```sql
<left> XOR <right>
```

## Parameters

- **`<left>`** — A boolean expression. Accepts [`boolean`](../types/boolean.md).
- **`<right>`** — A boolean expression. Accepts [`boolean`](../types/boolean.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE (gravity > 5) XOR (number_of_moons > 10);
```

## Signatures

- `boolean XOR boolean` → boolean

## See Also

- [Logical AND `AND`](and.md)
- [Logical OR `OR`](or.md)
