---
title: LPAD — Opteryx Function
description: Left-pad string to width.
---

# LPAD

Left-pad string to width.

**Category:** String Functions

## Syntax

```
LPAD(str, width, [fill])
```

## Arguments

- **str** `varchar`
    Input string value.
- **width** `integer`
    Target width for the output.
- **fill** `varchar` [optional]
    Padding text used when the input is shorter than the target width. Optional.

## Returns

**varchar** — Returns the computed result as `varchar`.
