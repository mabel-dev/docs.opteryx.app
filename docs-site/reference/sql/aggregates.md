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
  - Support: grouped, strict_grouped
  - Notes: Supports DISTINCT, ORDER BY, and LIMIT forms in the aggregate surface.
- **CIDR_AGG** — Collects IPv4 addresses into the smallest list of CIDR blocks that covers exactly those addresses.
  - SQL forms: `CIDR_AGG(ipv4_expr)`
  - Support: global, grouped, strict_grouped
  - Notes: Returns ARRAY<VARCHAR> of CIDR blocks, ascending and non-overlapping. The cover is MINIMAL and unique: adjacent addresses fold into the largest aligned block, so 10.0.0.0-10.0.0.7 becomes a single 10.0.0.0/29. The operand must be IPV4 (a plain integer column is rejected). Duplicate addresses are free - the set deduplicates on insert - and NULLs are not members, so a group with no addresses returns an empty array rather than NULL. Works with and without GROUP BY. Bounded by two independent budgets, one on the collected address set and one on the emitted text: see @@cidr_agg_state_budget_bytes and @@cidr_agg_emit_budget_bytes.

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
- **CORR** — Computes the Pearson correlation coefficient between two numeric columns.
  - SQL forms: `CORR(x, y)`
  - Support: global, grouped, strict_grouped
  - Notes: Pearson correlation over (x, y) pairs where both values are non-null. Returns DOUBLE in [-1, 1]; NULL when undefined (no pairs, or zero variance in either input). DECIMAL inputs must be CAST to DOUBLE first.
- **MEDIAN** — Computes the exact median (middle value) of the input values.
  - SQL forms: `MEDIAN(expr)`
  - Support: global, grouped, strict_grouped
  - Notes: Buffers all non-null values per group and selects the middle. Even-count inputs interpolate; result type is FLOAT. Buffering is bounded by a global 512MB memory budget — exceeding it raises an error. Decimal inputs must be CAST to FLOAT.
- **STDDEV** — Computes the population standard deviation of the input values.
  - SQL forms: `STDDEV(expr)`
  - Support: global, grouped, strict_grouped
  - Notes: Population standard deviation (N denominator, not N-1/sample). Ignores nulls. DECIMAL inputs must be CAST to DOUBLE first.
- **SUM** — Sums the input values.
  - SQL forms: `SUM(expr)`
  - Support: global, grouped, strict_grouped
  - Notes: Nulls are ignored; non-null values are accumulated.

### Selection

- **ANY_VALUE** — Returns one non-null value from the input set.
  - SQL forms: `ANY_VALUE(expr)`
  - Support: grouped, strict_grouped
  - Notes: Useful when a grouped query only needs one representative value from each group.
