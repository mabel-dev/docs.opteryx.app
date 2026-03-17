---
title: Regex like — Opteryx Operator
description: Returns true when the left string matches the regular expression on the right. Symbol: RLIKE
---

# Regex like

Regular expression match comparison.

Returns true when the left string matches the regular expression on the right.

**Category:** comparison

**SQL symbol:** `RLIKE`

## Example

```sql
SELECT 'a' RLIKE 'a';
```

## Signatures

- `blob RLIKE blob` → boolean
- `blob RLIKE varchar` → boolean
- `varchar RLIKE blob` → boolean
- `varchar RLIKE varchar` → boolean

## Types

- **Left:** blob, varchar
- **Right:** blob, varchar
- **Result:** boolean
