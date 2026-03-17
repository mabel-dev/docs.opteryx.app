---
title: Not like — Opteryx Operator
description: Returns true when the left string does not match the SQL LIKE pattern on the right. Symbol: NOT LIKE
---

# Not like

Negated pattern match comparison.

Returns true when the left string does not match the SQL LIKE pattern on the right.

**Category:** comparison

**SQL symbol:** `NOT LIKE`

## Example

```sql
SELECT 'a' NOT LIKE 'a';
```

## Signatures

- `blob NOT LIKE blob` → boolean
- `blob NOT LIKE varchar` → boolean
- `varchar NOT LIKE blob` → boolean
- `varchar NOT LIKE varchar` → boolean

## Types

- **Left:** blob, varchar
- **Right:** blob, varchar
- **Result:** boolean
