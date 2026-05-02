---
title: Aggregates — Opteryx Reference
description: SQL aggregate functions supported by Opteryx, organized by category.
---

# Aggregates

Aggregate functions combine multiple rows into a single summary value. They are used with `GROUP BY` or as window functions via `OVER(...)`. Aggregates ignore `NULL` inputs unless otherwise noted.

## Approximate

- **APPROX_COUNT_DISTINCT(expr)** — Estimates the number of distinct non-null values using a sketch-based estimator. Faster than exact `COUNT(DISTINCT ...)` on large sets.
- **APPROX_PERCENTILE(expr, percentile)** — Estimates the value at the given percentile (0.0–1.0) using sketch-based aggregation.

## Collection

- **ARRAY_AGG(expr)** — Collects values into an array.
  - `ARRAY_AGG(DISTINCT expr)` — Collect distinct values only.
  - `ARRAY_AGG(expr LIMIT n)` — Limit collected values to n.
  - `ARRAY_AGG(expr ORDER BY expr [ASC|DESC] LIMIT n)` — Collect in order, with limit.

## Counting

- **COUNT(\*)** — Counts all rows including those with nulls.
- **COUNT(expr)** — Counts non-null values.
- **COUNT(DISTINCT expr)** / **COUNT_DISTINCT(expr)** — Exact count of distinct non-null values.

## Extrema

- **MAX(expr)** — Returns the largest non-null value.
- **MIN(expr)** — Returns the smallest non-null value.

## Numeric

- **AVG(expr)** — Arithmetic mean of non-null values.
- **SUM(expr)** — Sum of non-null values.

## Selection

- **ANY_VALUE(expr)** — Returns one non-null value from the group. Useful when a grouped query only needs a representative value and any will do.
