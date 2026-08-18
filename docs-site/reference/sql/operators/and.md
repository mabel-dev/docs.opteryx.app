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

- **`<left>`** — A boolean expression. A comparison that produced NULL counts as unknown here, not as false. Accepts [`boolean`](../types/boolean).
- **`<right>`** — A boolean expression, evaluated under the same rules. Accepts [`boolean`](../types/boolean).

## Returns

[`boolean`](../types/boolean)

## Examples

```sql
SELECT name FROM $planets WHERE gravity > 5 AND number_of_moons = 0;
```

```
Venus
```

```sql
SELECT FALSE AND NULL, TRUE AND NULL;
```

```
false | NULL
```

## Signatures

- `boolean AND boolean` → boolean

## Notes

AND is three-valued. FALSE wins over an unknown - `FALSE AND NULL` is FALSE, because no value of the unknown side could make the pair true - while `TRUE AND NULL` is NULL. Only a TRUE result passes a WHERE clause, so a row whose condition is NULL is dropped exactly as a false one is.

## See Also

- [Logical OR `OR`](or)
- [Logical XOR `XOR`](xor)
- [NULL semantics](../advanced/adv-null-semantics)
