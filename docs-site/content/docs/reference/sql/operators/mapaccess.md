---
title: Subscript access — Opteryx Operator
description: Returns the element at the requested index from an array, string, or blob-like value. Symbol: []
---

# Subscript access

Subscript access operator.

Returns the element at the requested index from an array, string, or blob-like value.

**Category:** extraction

**Node kind:** extraction

**SQL symbol:** `[]`

## Example

```sql
SELECT col1 [] col2 FROM table;
```

**Signatures:** 4

## Signatures

- `array [] integer`
- `blob [] integer` → blob
- `varchar [] integer` → varchar
- `vector [] integer` → double

## Types

- **Left:** array, blob, varchar, vector
- **Right:** integer
- **Result:** blob, double, varchar

## Notes

For arrays the result type depends on the array element type, so the exported result type may be dynamic.
