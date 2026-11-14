---
title: Multiplication — Opteryx Operator
description: Returns the product of two numeric operands, or scales an INTERVAL by a number. Symbol: *
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Multiplication

Returns the product of two numeric operands, or scales an INTERVAL by a number.

**Category:** binary

**SQL symbol:** `*`

**Precedence:** level 4 of 15 (1 binds tightest) — see [operator precedence](../operators#operator-precedence).

## Syntax

```sql
<left> * <right>
```

## Parameters

- **`<left>`** — A numeric value, or an INTERVAL. Accepts [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer), [`interval`](../types/interval).
- **`<right>`** — A numeric value, or an INTERVAL when the left side is a number. The result takes the wider of the two types - see Signatures. Accepts [`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer), [`interval`](../types/interval).

## Returns

[`decimal`](../types/decimal), [`float`](../types/float), [`integer`](../types/integer), [`interval`](../types/interval)

## Examples

```sql
SELECT name, diameter * 2 FROM $planets LIMIT 3;
```

```
Mercury | 9758
Venus | 24208
Earth | 25512
```

```sql
SELECT id, CAST('2026-01-31' AS TIMESTAMP) + INTERVAL '1' MONTH * id FROM $planets LIMIT 3;
```

```
1 | 2026-02-28 00:00:00+00:00
2 | 2026-03-31 00:00:00+00:00
3 | 2026-04-30 00:00:00+00:00
```

## Signatures

- `decimal * decimal` → decimal
- `decimal * float` → float
- `decimal * integer` → decimal
- `float * decimal` → float
- `float * float` → float
- `float * integer` → float
- `float * interval` → interval
- `integer * decimal` → decimal
- `integer * float` → float
- `integer * integer` → integer
- `integer * interval` → interval
- `interval * float` → interval
- `interval * integer` → interval

## Notes

An INTERVAL times a number (either way round) is an INTERVAL. Months and the sub-month part scale separately, and a fractional month spills into days at 30 days per month, as in PostgreSQL: `INTERVAL '1' MONTH * 1.5` is 1 month 15 days. An integer factor is exact; a float factor goes through double precision. A result too large for an INTERVAL is an error.

## See Also

- [Division `/`](divide)
- [Addition `+`](plus)
- [Subtraction `-`](minus)
