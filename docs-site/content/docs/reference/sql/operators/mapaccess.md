---
title: Subscript access — Opteryx Operator
description: Returns the element at the requested index from an array, string, or blob-like value. Symbol: []
---

# Subscript access

Subscript access operator.

Returns the element at the requested index from an array, string, or blob-like value.

**Category:** extraction

**SQL symbol:** `[]`

## Example

```sql
SELECT 'a'[1];
```

**Dynamic result:** yes

## Signatures

- `array[integer]` → dynamic
- `blob[integer]` → blob
- `varchar[integer]` → varchar
- `vector[integer]` → double

## Types

- **Left:** array, blob, varchar, vector
- **Right:** integer
- **Result:** blob, double, varchar

## Notes

For arrays the result type depends on the array element type, so the exported result type may be dynamic.
