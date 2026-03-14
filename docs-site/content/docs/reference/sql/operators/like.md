---
title: Like — Opteryx Operator
description: Returns true when the left string matches the SQL LIKE pattern on the right. Symbol: LIKE
---

# Like

Pattern match comparison.

Returns true when the left string matches the SQL LIKE pattern on the right.

**Category:** comparison

**Node kind:** comparison

**SQL symbol:** `LIKE`

## Example

```sql
SELECT col1 LIKE col2 FROM table;
```

**Signatures:** 4

## Signatures

- `blob LIKE blob` → boolean
- `blob LIKE varchar` → boolean
- `varchar LIKE blob` → boolean
- `varchar LIKE varchar` → boolean

## Types

- **Left:** blob, varchar
- **Right:** blob, varchar
- **Result:** boolean
