---
title: MATCH — Opteryx Function
description: Performs semantic text matching using embeddings and cosine similarity.
---

# MATCH

Performs semantic text matching using embeddings and cosine similarity.

**Category:** String Functions

## Syntax

```
MATCH(str) AGAINST(pattern)
```

## Arguments

- **string** `varchar`
    String input value.
- **query** `varchar`
    String input value.

## Returns

**boolean** — Returns `true` or `false` based on whether the function's condition is satisfied.

## Usage Notes

Canonical form is `MATCH(str) AGAINST(pattern)`. Opteryx normalizes this syntax to an internal helper.
