---
title: Aggregates & Window Functions — Opteryx Reference
description: Quick reference for SQL aggregate and common window functions with examples and behavior notes.
---

# Aggregates

Aggregates combine multiple rows into single summary values and are typically used with `GROUP BY` (or as window functions). Aggregates generally ignore `NULL` inputs.

## Common aggregates
- `COUNT(*)`, `COUNT(col)`, `COUNT(DISTINCT col)` — row and value counts
- `SUM(col)`, `AVG(col)`, `MIN(col)`, `MAX(col)` — standard numeric aggregates
- `STDDEV(col)`, `VARIANCE(col)` — dispersion measures
- `ARRAY_AGG(col)` — collect values into an array (supports `DISTINCT` and `LIMIT`)
- `ANY_VALUE(col)` — pick an arbitrary value from the group
- `APPROXIMATE_MEDIAN(col)` — approximate median (T-Digest) for large sets

Example — grouped aggregation:
```sql
SELECT category, COUNT(*) AS cnt, SUM(amount) AS total
  FROM transactions
 GROUP BY category
 ORDER BY total DESC;
```

Example — array aggregator:
```sql
SELECT order_id, ARRAY_AGG(item_id) AS items FROM order_items GROUP BY order_id;
```

---

## Window functions
Many aggregates also have window variants via `OVER(...)` to compute running or partitioned summaries.

Example — partitioned sum:
```sql
SELECT id, user_id, amount,
       SUM(amount) OVER (PARTITION BY user_id ORDER BY ts ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
  FROM purchases;
```

---

## Behavior notes
- `COUNT(DISTINCT col)` can be more expensive than `COUNT(col)`; use approximate methods when needed.
- `ARRAY_AGG(DISTINCT ...)` preserves distinctness; `ARRAY_AGG` without `LIMIT` may produce large arrays — use `LIMIT` if needed.
- Aggregates ignore `NULL` values for most functions (e.g., `SUM`, `AVG`) unless documented otherwise.

---

## Where to go next
- Examples in [Statements](/docs/reference/sql/statements)
- Advanced aggregation & performance tips: see `adv-query-optimization` and `adv-sample-data` pages

If you want, I can expand this page with common pitfalls, expected outputs, and performance tips for large datasets.