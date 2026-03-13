---
title: IFNULL — Opteryx Function
description: Selects the first argument when it is not null; otherwise uses the second argument.
---

# IFNULL

Selects the first argument when it is not null; otherwise uses the second argument.

**Category:** Utility Functions

## Syntax

```
IFNULL(value, default)
```

## Arguments

- **value: any** — Primary input value.
- **default: any** — Fallback value returned when the primary value is null.

## Returns

**compatible input type** — Returns either the primary value or the fallback value using a type compatible with both arguments.
