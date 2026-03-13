---
title: LtEq — Opteryx Operator
description: Token: <=
---

# <=

**Category:** comparison

**Token:** `<=`

**Signatures:** 22

## Signatures

- `blob <= blob` → boolean
- `blob <= varchar` → boolean
- `date <= date` → boolean
- `date <= integer` → boolean
- `date <= timestamp` → boolean
- `decimal <= decimal` → boolean
- `decimal <= double` → boolean
- `decimal <= integer` → boolean
- `double <= decimal` → boolean
- `double <= double` → boolean
- `double <= integer` → boolean
- `integer <= date` → boolean
- `integer <= decimal` → boolean
- `integer <= double` → boolean
- `integer <= integer` → boolean
- `integer <= timestamp` → boolean
- `interval <= interval` → boolean
- `timestamp <= date` → boolean
- `timestamp <= integer` → boolean
- `timestamp <= timestamp` → boolean
- `varchar <= blob` → boolean
- `varchar <= varchar` → boolean

## Types

- **Left:** blob, date, decimal, double, integer, interval, timestamp, varchar
- **Right:** blob, date, decimal, double, integer, interval, timestamp, varchar
- **Result:** boolean
