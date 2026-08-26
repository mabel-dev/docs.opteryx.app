---
title: Multiplication — Opteryx Operator
description: Returns the product of two numeric operands. Symbol: *
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Multiplication

Returns the product of two numeric operands.

**Category:** binary

**SQL symbol:** `*`

## Syntax

```sql
<left> * <right>
```

## Parameters

- **`<left>`** — A numeric value. Accepts [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer).
- **`<right>`** — A numeric value. The result takes the wider of the two types - see Signatures. Accepts [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer).

## Returns

[`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer)

## Examples

```sql
SELECT name, diameter * 2 FROM $planets LIMIT 3;
```

```
Mercury | 9758
Venus | 24208
Earth | 25512
```

## Signatures

- `decimal * decimal` → decimal
- `decimal * float` → float
- `decimal * integer` → decimal
- `float * decimal` → float
- `float * float` → float
- `float * integer` → float
- `integer * decimal` → decimal
- `integer * float` → float
- `integer * integer` → integer

## See Also

- [Division `/`](divide)
- [Addition `+`](plus)
- [Subtraction `-`](minus)
