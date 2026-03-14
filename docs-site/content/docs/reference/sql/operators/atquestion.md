---
title: JSON path exists — Opteryx Operator
description: Returns true when the supplied JSON path expression matches within the left document. Symbol: @?
---

# JSON path exists

JSON path existence operator.

Returns true when the supplied JSON path expression matches within the left document.

**Category:** comparison

**Node kind:** comparison

**SQL symbol:** `@?`

## Example

```sql
SELECT col1 @? col2 FROM table;
```

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
