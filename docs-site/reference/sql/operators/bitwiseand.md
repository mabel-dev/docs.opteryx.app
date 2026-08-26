---
title: Bitwise AND — Opteryx Operator
description: Combines integer operands using a bitwise AND operation. Symbol: &
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Bitwise AND

Combines integer operands using a bitwise AND operation.

**Category:** bitwise

**SQL symbol:** `&`

## Syntax

```sql
<left> & <right>
```

## Parameters

- **`<left>`** — An integer value. Accepts [`integer`](../types/integer).
- **`<right>`** — An integer value. The result keeps the operands' integer width rather than widening to 64-bit. Accepts [`integer`](../types/integer).

## Returns

[`integer`](../types/integer)

## Examples

```sql
SELECT 12 & 10;
```

```
8
```

## Signatures

- `integer & integer` → integer

## See Also

- [Bitwise OR `|`](bitwiseor)
- [Bitwise XOR `^`](bitwisexor)
