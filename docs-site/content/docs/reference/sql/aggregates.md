---
title: Aggregates — Opteryx Reference
description: Quick reference for SQL aggregate functions supported by Opteryx.
---

# Aggregates

Aggregates combine multiple rows into single summary values and are typically used with `GROUP BY`. Aggregates generally ignore `NULL` inputs.

## Supported aggregates

### Approximate

- **APPROX_COUNT_DISTINCT** — Estimates the number of distinct input values.
  - SQL forms: `APPROX_COUNT_DISTINCT(expr)`
  - Support: global, grouped, strict_grouped
  - Notes: Uses a sketch-based estimator instead of exact deduplication.
- **APPROX_PERCENTILE** — Estimates a percentile using sketch-based aggregation.
  - SQL forms: `APPROX_PERCENTILE(expr, percentile)`
  - Support: global, grouped, strict_grouped
  - Notes: Accepts an input expression and a percentile literal between 0.0 and 1.0.

### Collection

- **ARRAY_AGG** — Collects input values into an array.
  - SQL forms: `ARRAY_AGG(expr)`, `ARRAY_AGG(DISTINCT expr)`, `ARRAY_AGG(expr LIMIT n)`, `ARRAY_AGG(expr ORDER BY expr [ASC|DESC] LIMIT n)`
  - Support: global, grouped, strict_grouped
  - Notes: Supports DISTINCT, ORDER BY, and LIMIT forms in the aggregate surface.

### Counting

- **COUNT** — Counts rows or non-null input values.
  - SQL forms: `COUNT(*)`, `COUNT(expr)`, `COUNT(DISTINCT expr)`
  - Support: global, grouped, strict_grouped
  - Notes: COUNT(*) counts rows, while COUNT(expr) counts non-null values.
- **COUNT_DISTINCT** — Counts distinct non-null input values.
  - SQL forms: `COUNT_DISTINCT(expr)`, `COUNT(DISTINCT expr)`
  - Support: global, grouped, strict_grouped
  - Notes: Exact distinct count over the non-null input values.

### Extrema

- **MAX** — Returns the largest non-null input value.
  - SQL forms: `MAX(expr)`
  - Support: global, grouped, strict_grouped
  - Notes: Returns the greatest comparable non-null value encountered.
- **MIN** — Returns the smallest non-null input value.
  - SQL forms: `MIN(expr)`
  - Support: global, grouped, strict_grouped
  - Notes: Returns the smallest comparable non-null value encountered.

### Numeric

- **AVG** — Computes the arithmetic mean of the input values.
  - SQL forms: `AVG(expr)`
  - Support: global, grouped, strict_grouped
  - Notes: Ignores nulls and divides the running sum by the number of non-null values.
- **SUM** — Sums the input values.
  - SQL forms: `SUM(expr)`
  - Support: global, grouped, strict_grouped
  - Notes: Nulls are ignored; non-null values are accumulated.

### Selection

- **ANY_VALUE** — Returns one non-null value from the input set.
  - SQL forms: `ANY_VALUE(expr)`
  - Support: grouped, strict_grouped
  - Notes: Useful when a grouped query only needs one representative value from each group.
