---
title: StringConcat — Opteryx Operator
description: Token: ||
---

# ||

**Category:** binary

**Token:** `||`

**Signatures:** 4

## Signatures

- `blob || blob` → blob
- `blob || varchar` → blob
- `varchar || blob` → blob
- `varchar || varchar` → varchar

## Types

- **Left:** blob, varchar
- **Right:** blob, varchar
- **Result:** blob, varchar
