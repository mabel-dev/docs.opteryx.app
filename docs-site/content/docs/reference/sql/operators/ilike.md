---
title: Case-insensitive like — Opteryx Operator
description: Returns true when the left string matches the SQL ILIKE pattern on the right without case sensitivity. Symbol: ILIKE
---

# Case-insensitive like

Case-insensitive pattern match comparison.

Returns true when the left string matches the SQL ILIKE pattern on the right without case sensitivity.

**Category:** comparison

**SQL symbol:** `ILIKE`

## Example

```sql
SELECT 'a' ILIKE 'a';
```

## Signatures

- `blob ILIKE blob` → boolean
- `blob ILIKE varchar` → boolean
- `varchar ILIKE blob` → boolean
- `varchar ILIKE varchar` → boolean

## Types

- **Left:** blob, varchar
- **Right:** blob, varchar
- **Result:** boolean
