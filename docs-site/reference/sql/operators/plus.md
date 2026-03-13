---
title: + — Opteryx Operator
description: 
---

# +

**Category:** binary

**Token:** `+`

**Signatures:** 12

## Signatures

- `date + interval` → timestamp
- `decimal + decimal` → integer
- `decimal + integer` → decimal
- `double + double` → double
- `double + integer` → double
- `integer + decimal` → double
- `integer + double` → double
- `integer + integer` → integer
- `interval + date` → timestamp
- `interval + interval` → interval
- `interval + timestamp` → timestamp
- `timestamp + interval` → timestamp

## Types

- **Left:** date, decimal, double, integer, interval, timestamp
- **Right:** date, decimal, double, integer, interval, timestamp
- **Result:** decimal, double, integer, interval, timestamp
