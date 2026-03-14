---
title: Not case-insensitive like — Opteryx Operator
description: Returns true when the left string does not match the SQL ILIKE pattern on the right. Symbol: NOT ILIKE
---

# Not case-insensitive like

Negated case-insensitive pattern match comparison.

Returns true when the left string does not match the SQL ILIKE pattern on the right.

**Category:** comparison

**Node kind:** comparison

**SQL symbol:** `NOT ILIKE`

## Example

```sql
SELECT col1 NOT ILIKE col2 FROM table;
```

**Signatures:** 4

## Signatures

- `blob NOT ILIKE blob` → boolean
- `blob NOT ILIKE varchar` → boolean
- `varchar NOT ILIKE blob` → boolean
- `varchar NOT ILIKE varchar` → boolean

## Types

- **Left:** blob, varchar
- **Right:** blob, varchar
- **Result:** boolean
