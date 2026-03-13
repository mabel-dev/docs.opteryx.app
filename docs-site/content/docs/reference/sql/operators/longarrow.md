---
title: LongArrow — Opteryx Operator
description: Token: ->>
---

# ->>

**Category:** extraction

**Token:** `->>`

**Signatures:** 8

## Signatures

- `blob ->> blob` → blob
- `blob ->> varchar` → blob
- `jsonb ->> blob` → blob
- `jsonb ->> varchar` → blob
- `struct ->> blob` → blob
- `struct ->> varchar` → blob
- `varchar ->> blob` → blob
- `varchar ->> varchar` → blob

## Types

- **Left:** blob, jsonb, struct, varchar
- **Right:** blob, varchar
- **Result:** blob
