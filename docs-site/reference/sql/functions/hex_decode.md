---
title: HEX_DECODE — Opteryx Function
description: Hex decode.
---

# HEX_DECODE

Hex decode.

**Category:** Hash & Encoding Functions

## Syntax

```sql
HEX_DECODE(blob)
```

## Arguments

- **blob** `varchar`
    Must be well-formed hex text; other input is rejected at execution.

## Returns

**VARBINARY** — Returns the computed result as `VARBINARY`.
