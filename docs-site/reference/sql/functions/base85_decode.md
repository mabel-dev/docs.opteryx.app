---
title: BASE85_DECODE — Opteryx Function
description: Base85 decode.
---

# BASE85_DECODE

Base85 decode.

**Category:** Hash & Encoding Functions

## Syntax

```sql
BASE85_DECODE(blob)
```

## Arguments

- **blob** `varchar`
    Must be well-formed base85 text; other input is rejected at execution.

## Returns

**VARBINARY** — Returns the computed result as `VARBINARY`.
