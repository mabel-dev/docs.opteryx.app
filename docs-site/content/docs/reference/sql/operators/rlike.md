---
title: Regex like — Opteryx Operator
description: Returns true when the left string matches the regular expression on the right. Symbol: RLIKE
---

# Regex like

Regular expression match comparison.

Returns true when the left string matches the regular expression on the right.

**Category:** comparison

**Node kind:** comparison

**SQL symbol:** `RLIKE`

## Example

```sql
SELECT col1 RLIKE col2 FROM table;
```

**Signatures:** 4

## Signatures

- `blob RLIKE blob` → boolean
- `blob RLIKE varchar` → boolean
- `varchar RLIKE blob` → boolean
- `varchar RLIKE varchar` → boolean

## Types

- **Left:** blob, varchar
- **Right:** blob, varchar
- **Result:** boolean
