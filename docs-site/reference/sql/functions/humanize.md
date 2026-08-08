---
title: HUMANIZE — Opteryx Function
description: Format number in human-readable form.
---

# HUMANIZE

Format number in human-readable form.

**Category:** Conversion Functions

## Syntax

```sql
HUMANIZE(val, [mode])
```

## Arguments

- **val** `number`
    Input value.
- **mode** `varchar` [optional | constant]
    Scale system to render into: 'words' (default), 'compact', 'bytes', 'si', 'time', 'clock', 'percent' or 'odds'. Must be a constant expression. Optional.

## Returns

**VARCHAR** — Returns the computed result as `VARCHAR`.
