---
title: INTEGER — Opteryx Type
description: INTEGER
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# INTEGER

Signed 64-bit integer. Write `INTEGER`, `INT`, or `BIGINT` in SQL — they are all equivalent.

**Aliases:** `BIGINT`, `INT`

## Example

```sql
SELECT 42;
```

## Range

- **Min:** `-9223372036854775808`
- **Max:** `9223372036854775807`

## Casting

| From | Example | Notes |
|------|---------|-------|
| from FLOAT | `3.9::INTEGER` | Truncates toward zero — 3.9 becomes 3, -3.9 becomes -3 |
| from BOOLEAN | `TRUE::INTEGER` | TRUE → 1, FALSE → 0 |
| from VARCHAR | `'42'::INTEGER` | String must contain only digits with an optional leading minus sign — unlike FLOAT's VARCHAR cast, a leading '+' and surrounding whitespace are NOT tolerated |
| from TIMESTAMP | `ts_col::INTEGER` | Returns microseconds since the Unix epoch (1970-01-01 00:00:00 UTC) |
| from DATE | `date_col::INTEGER` | Returns days since the Unix epoch |

## Comparisons

Can be compared (using `=`, `<`, `>`, etc.) with: `INTEGER`, `FLOAT`, `DECIMAL`.

## Limitations

- Cannot compare INTEGER to VARCHAR or temporal types — cast first.
- Overflow is not detected at runtime: values outside the ±9,223,372,036,854,775,807 range wrap silently.
- Division and modulo by zero do not raise — `INTEGER / 0` and `INTEGER % 0` silently return 0.
