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

- **`<left>`** — A boolean expression. Accepts [`boolean`](../types/boolean).
- **`<right>`** — A boolean expression. Accepts [`boolean`](../types/boolean).

## Returns

[`boolean`](../types/boolean)

## Examples

```sql
SELECT name FROM $planets WHERE (gravity > 5) XOR (number_of_moons > 10);
```

```
Venus
Earth
```

```sql
SELECT TRUE XOR NULL;
```

```
NULL
```

## Signatures

- `boolean XOR boolean` → boolean

## Notes

Unlike AND and OR, XOR has no dominant value: the answer always depends on both sides, so NULL on either side gives NULL.

## See Also

- [Logical AND `AND`](and)
- [Logical OR `OR`](or)
- [NULL semantics](../advanced/adv-null-semantics)
