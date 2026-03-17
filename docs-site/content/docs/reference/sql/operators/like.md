---
title: Like — Opteryx Operator
description: Returns true when the left string matches the SQL LIKE pattern on the right. Symbol: LIKE
---

# Like

Pattern match comparison.

Returns true when the left string matches the SQL LIKE pattern on the right.

**Category:** comparison

**SQL symbol:** `LIKE`

## Example

```sql
SELECT 'a' LIKE 'a';
```

## Signatures

- `blob LIKE blob` → boolean
- `blob LIKE varchar` → boolean
- `varchar LIKE blob` → boolean
- `varchar LIKE varchar` → boolean

## Types

- **Left:** blob, varchar
- **Right:** blob, varchar
- **Result:** boolean
