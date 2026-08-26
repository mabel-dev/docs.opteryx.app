---
title: Logical XOR — Opteryx Operator
description: Returns true when exactly one boolean operand evaluates to true. Symbol: XOR
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

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
