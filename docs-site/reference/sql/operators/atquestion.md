---
title: @? — Opteryx Operator
description: 
---

# @?

**Category:** comparison

**Token:** `@?`

**Signatures:** 8

## Signatures

- `blob @? blob` → boolean
- `blob @? varchar` → boolean
- `jsonb @? blob` → boolean
- `jsonb @? varchar` → boolean
- `struct @? blob` → boolean
- `struct @? varchar` → boolean
- `varchar @? blob` → boolean
- `varchar @? varchar` → boolean

## Types

- **Left:** blob, jsonb, struct, varchar
- **Right:** blob, varchar
- **Result:** boolean
