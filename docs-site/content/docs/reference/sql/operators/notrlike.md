---
title: Not regex like — Opteryx Operator
description: Returns true when the left string does not match the regular expression on the right. Symbol: NOT RLIKE
---

# Not regex like

Negated regular expression match comparison.

Returns true when the left string does not match the regular expression on the right.

**Category:** comparison

**SQL symbol:** `NOT RLIKE`

## Example

```sql
SELECT 'a' NOT RLIKE 'a';
```

## Signatures

- `blob NOT RLIKE blob` → boolean
- `blob NOT RLIKE varchar` → boolean
- `varchar NOT RLIKE blob` → boolean
- `varchar NOT RLIKE varchar` → boolean

## Types

- **Left:** blob, varchar
- **Right:** blob, varchar
- **Result:** boolean
