---
title: BASE64_DECODE — Opteryx Function
description: Base64 decode.
---

# BASE64_DECODE

Base64 decode.

**Category:** Hash & Encoding Functions

## Syntax

```sql
BASE64_DECODE(blob)
```

## Arguments

- **blob** `varchar`
    Must be well-formed base64 text; other input is rejected at execution.

## Returns

**VARBINARY** — Returns the computed result as `VARBINARY`.
