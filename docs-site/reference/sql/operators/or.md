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

- **`<left>`** — A boolean expression. A comparison that produced NULL counts as unknown here, not as false. Accepts [`boolean`](../types/boolean.md).
- **`<right>`** — A boolean expression, evaluated under the same rules. Accepts [`boolean`](../types/boolean.md).

## Returns

[`boolean`](../types/boolean.md)

## Examples

```sql
SELECT name FROM $planets WHERE name = 'Earth' OR name = 'Mars';
```

```
Earth
Mars
```

```sql
SELECT TRUE OR NULL, FALSE OR NULL;
```

```
true | NULL
```

## Signatures

- `boolean OR boolean` → boolean

## Notes

OR is three-valued, and the mirror of AND: TRUE wins over an unknown - `TRUE OR NULL` is TRUE - while `FALSE OR NULL` is NULL, not FALSE.

## See Also

- [Logical AND `AND`](and.md)
- [Logical XOR `XOR`](xor.md)
- [NULL semantics](../null-semantics.md)
