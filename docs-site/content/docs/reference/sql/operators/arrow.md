---
title: JSON extract — Opteryx Operator
description: Returns the selected JSON value from a document or JSON-like value. Symbol: ->
---

# JSON extract

JSON extraction operator.

Returns the selected JSON value from a document or JSON-like value.

**Category:** extraction

**SQL symbol:** `->`

## Example

```sql
SELECT '{"index": 1}' -> 'index'; -- expected: 1
```

**Dynamic result:** yes

## Signatures

- `blob -> blob` → dynamic
- `blob -> varchar` → dynamic
- `jsonb -> blob` → dynamic
- `jsonb -> varchar` → dynamic
- `struct -> blob` → dynamic
- `struct -> varchar` → dynamic
- `varchar -> blob` → dynamic
- `varchar -> varchar` → dynamic

## Types

- **Left:** blob, jsonb, struct, varchar
- **Right:** blob, varchar

## Notes

The result type is dynamic because the selected JSON value may be scalar, object, array, or null.
