---
title: Subtraction — Opteryx Operator
description: Returns the difference between two numeric, date, timestamp, or interval-compatible operands. Symbol: -
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Subtraction

Returns the difference between two numeric, date, timestamp, or interval-compatible operands.

**Category:** binary

**SQL symbol:** `-`

## Syntax

```sql
<left> - <right>
```

## Parameters

- **`<left>`** — The value to subtract from. Accepts [`date`](../types/date), [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer), [`interval`](../types/interval), [`timestamp`](../types/timestamp).
- **`<right>`** — The value to subtract. Subtracting one TIMESTAMP from another gives an INTERVAL; subtracting an INTERVAL from a timestamp gives a timestamp. Accepts [`date`](../types/date), [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer), [`interval`](../types/interval), [`timestamp`](../types/timestamp).

## Returns

[`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer), [`interval`](../types/interval), [`timestamp`](../types/timestamp)

## Examples

```sql
SELECT name, aphelion - perihelion FROM $planets LIMIT 3;
```

```
Mercury | 23.800003051757812
Venus | 1.4000015258789062
Earth | 5.0
```

```sql
SELECT CAST('2026-03-01' AS TIMESTAMP) - INTERVAL '1' MONTH;
```

```
2026-02-01 00:00:00+00:00
```

## Signatures

- `date - date` → interval
- `date - interval` → timestamp
- `date - timestamp` → interval
- `decimal - decimal` → decimal
- `decimal - float` → float
- `decimal - integer` → decimal
- `float - decimal` → float
- `float - float` → float
- `float - integer` → float
- `integer - decimal` → decimal
- `integer - float` → float
- `integer - integer` → integer
- `interval - date` → timestamp
- `interval - interval` → interval
- `interval - timestamp` → timestamp
- `timestamp - date` → interval
- `timestamp - interval` → timestamp
- `timestamp - timestamp` → interval

## Notes

Unlike addition, subtraction is not symmetric across types: a timestamp minus an interval is a timestamp, but an interval minus a timestamp is not accepted.

## See Also

- [Addition `+`](plus)
- [Multiplication `*`](multiply)
- [Division `/`](divide)
