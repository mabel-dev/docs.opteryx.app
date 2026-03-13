---
title: NotEq — Opteryx Operator
description: Token: !=
---

# !=

**Category:** comparison

**Token:** `!=`

**Signatures:** 23

## Signatures

- `blob != blob` → boolean
- `blob != varchar` → boolean
- `boolean != boolean` → boolean
- `date != date` → boolean
- `date != integer` → boolean
- `date != timestamp` → boolean
- `decimal != decimal` → boolean
- `decimal != double` → boolean
- `decimal != integer` → boolean
- `double != decimal` → boolean
- `double != double` → boolean
- `double != integer` → boolean
- `integer != date` → boolean
- `integer != decimal` → boolean
- `integer != double` → boolean
- `integer != integer` → boolean
- `integer != timestamp` → boolean
- `interval != interval` → boolean
- `timestamp != date` → boolean
- `timestamp != integer` → boolean
- `timestamp != timestamp` → boolean
- `varchar != blob` → boolean
- `varchar != varchar` → boolean

## Types

- **Left:** blob, boolean, date, decimal, double, integer, interval, timestamp, varchar
- **Right:** blob, boolean, date, decimal, double, integer, interval, timestamp, varchar
- **Result:** boolean
