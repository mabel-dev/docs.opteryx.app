---
title: JSON extract — Opteryx Operator
description: Returns the selected JSON value from a document or JSON-like value. Symbol: ->
---

# JSON extract

JSON extraction operator.

Returns the selected JSON value from a document or JSON-like value.

**Category:** extraction

**Node kind:** extraction

**SQL symbol:** `->`

## Example

```sql
SELECT col1 -> col2 FROM table;
```

**Signatures:** 8

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
