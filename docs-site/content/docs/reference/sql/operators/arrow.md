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
SELECT 'a' -> 'a';
```

**Dynamic result:** yes

## Signatures

- `blob -> blob`
- `blob -> varchar`
- `jsonb -> blob`
- `jsonb -> varchar`
- `struct -> blob`
- `struct -> varchar`
- `varchar -> blob`
- `varchar -> varchar`

## Types

- **Left:** blob, jsonb, struct, varchar
- **Right:** blob, varchar

## Notes

The result type is dynamic because the selected JSON value may be scalar, object, array, or null.
