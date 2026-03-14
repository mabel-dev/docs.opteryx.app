---
title: JSON extract text — Opteryx Operator
description: Returns the selected JSON value encoded as a blob or text-like binary value. Symbol: ->>
---

# JSON extract text

JSON text extraction operator.

Returns the selected JSON value encoded as a blob or text-like binary value.

**Category:** extraction

**Node kind:** extraction

**SQL symbol:** `->>`

## Example

```sql
SELECT col1 ->> col2 FROM table;
```

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
