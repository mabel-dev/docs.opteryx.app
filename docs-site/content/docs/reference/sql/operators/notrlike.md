---
title: Not regex like — Opteryx Operator
description: Returns true when the left string does not match the regular expression on the right. Symbol: NOT RLIKE
---

# Not regex like

Negated regular expression match comparison.

Returns true when the left string does not match the regular expression on the right.

**Category:** comparison

**Node kind:** comparison

**SQL symbol:** `NOT RLIKE`

## Example

```sql
SELECT col1 NOT RLIKE col2 FROM table;
```

**Signatures:** 4

## Signatures

- `blob NOT RLIKE blob` → boolean
- `blob NOT RLIKE varchar` → boolean
- `varchar NOT RLIKE blob` → boolean
- `varchar NOT RLIKE varchar` → boolean

## Types

- **Left:** blob, varchar
- **Right:** blob, varchar
- **Result:** boolean
