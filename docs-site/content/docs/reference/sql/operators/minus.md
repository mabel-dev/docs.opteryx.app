---
title: Subtraction — Opteryx Operator
description: Returns the difference between two numeric, date, timestamp, or interval-compatible operands. Symbol: -
---

# Subtraction

Subtraction operator.

Returns the difference between two numeric, date, timestamp, or interval-compatible operands.

**Category:** binary

**Node kind:** binary

**SQL symbol:** `-`

## Example

```sql
SELECT col1 - col2 FROM table;
```

**Signatures:** 20

## Signatures

- `date - date` → interval
- `date - integer` → interval
- `date - interval` → timestamp
- `date - timestamp` → interval
- `decimal - decimal` → integer
- `decimal - integer` → decimal
- `double - double` → double
- `double - integer` → double
- `integer - date` → interval
- `integer - decimal` → double
- `integer - double` → double
- `integer - integer` → integer
- `integer - timestamp` → interval
- `interval - date` → timestamp
- `interval - interval` → interval
- `interval - timestamp` → timestamp
- `timestamp - date` → interval
- `timestamp - integer` → interval
- `timestamp - interval` → timestamp
- `timestamp - timestamp` → interval

## Types

- **Left:** date, decimal, double, integer, interval, timestamp
- **Right:** date, decimal, double, integer, interval, timestamp
- **Result:** decimal, double, integer, interval, timestamp
