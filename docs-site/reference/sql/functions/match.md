---
title: MATCH — Opteryx Function
description: Full-text match.
---

# MATCH

Full-text match.

**Category:** String Functions

## Syntax

```
MATCH(str) AGAINST(pattern)
```

## Arguments

- **str** `varchar`
    Input string value.
- **pattern** `varchar`
    Pattern string used to format, search, or match values.

## Returns

**boolean** — Returns `true` or `false` based on whether the function's condition is satisfied.

## Usage Notes

Canonical form is `MATCH(str) AGAINST(pattern)`. Opteryx normalizes this syntax to an internal helper.
