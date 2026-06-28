---
title: Bitwise OR — Opteryx Operator
description: Combines integer operands using a bitwise OR operation. When used with address and CIDR-compatible operands, the same `|` token acts as an IP containment predicate and returns a boolean result. Symbol: |
---

# Bitwise OR

Combines integer operands using a bitwise OR operation. When used with address and CIDR-compatible operands, the same `|` token acts as an IP containment predicate and returns a boolean result.

**Category:** bitwise

**SQL symbol:** `|`

## Notes

This operator is overloaded by operand type: integer inputs perform bitwise OR, while address/CIDR-style inputs use `|` for containment checks.
