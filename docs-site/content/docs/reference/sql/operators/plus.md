---
title: Addition — Opteryx Operator
description: Returns the sum of two numeric or interval-compatible operands. Symbol: +
---

# Addition

Addition operator.

Returns the sum of two numeric or interval-compatible operands.

**Category:** binary

**Node kind:** binary

**SQL symbol:** `+`

## Example

```sql
SELECT col1 + col2 FROM table;
```

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
