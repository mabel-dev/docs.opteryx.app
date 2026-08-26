---
title: Logical OR — Opteryx Operator
description: Returns true when either boolean operand evaluates to true. Symbol: OR
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Logical OR

Returns true when either boolean operand evaluates to true.

**Category:** logical

**SQL symbol:** `OR`

## Syntax

```sql
<left> OR <right>
```

## Parameters

- **`<left>`** — A boolean expression. A comparison that produced NULL counts as unknown here, not as false. Accepts [`boolean`](../types/boolean).
- **`<right>`** — A boolean expression, evaluated under the same rules. Accepts [`boolean`](../types/boolean).

## Returns

[`boolean`](../types/boolean)

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

- [Logical AND `AND`](and)
- [Logical XOR `XOR`](xor)
- [NULL semantics](../advanced/adv-null-semantics)
