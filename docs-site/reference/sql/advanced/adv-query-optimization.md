---
title: SQL Query Optimization - Best Practices for Opteryx
description: Learn SQL query optimization techniques for Opteryx. Best practices to improve query performance, reduce execution time, and optimize data retrieval.
---

# Query Optimization

Opteryx has a cost-based query optimizer that rewrites and reorders execution automatically. Understanding what it does — and what it cannot do — helps you write queries that perform well.

## What the Optimizer Does Automatically

**Predicate pushdown** — filter conditions are pushed as early in the plan as possible, including into the scan layer so that row groups failing the filter are skipped without being read.

**Column projection** — columns not referenced in the query are removed at scan time. `SELECT *` prevents this optimization.

**Join reordering (DPccp)** — for queries with multiple joins, the optimizer uses a dynamic programming algorithm to find a low-cost join ordering based on estimated row counts. You do not need to manually order your tables for most queries.

**Partition pruning** — when data is partitioned by date, a `TIMESTAMP AS OF` clause or a date-range filter on the partition key causes the scan to skip entire partitions.

---

## Things You Can Control

### Avoid `SELECT *`

`SELECT *` prevents column projection. Name only the columns you need:

```sql
-- Better
SELECT id, name, status FROM events;

-- Prevents column pruning
SELECT * FROM events;
```

### Filter early

The optimizer pushes `WHERE` conditions down automatically, but the more selective your filters are, the less data flows through expensive operations like `JOIN` and `GROUP BY`.

```sql
-- Filter before joining — the optimizer handles this, but explicit filters help cardinality estimates
SELECT e.id, e.name
  FROM events e
  JOIN users u ON e.user_id = u.id
 WHERE e.status = 'active'
   AND e.created_at >= '2024-01-01'::TIMESTAMP;
```

### Use `WHERE` rather than `HAVING` for pre-aggregation filters

`HAVING` runs after the aggregation. `WHERE` runs before it. Use `HAVING` only to filter on aggregated values:

```sql
-- Correct: WHERE filters rows before grouping
SELECT user_id, COUNT(*) AS event_count
  FROM events
 WHERE status = 'active'
 GROUP BY user_id
HAVING COUNT(*) > 10;

-- Wrong: this aggregates all rows first, then filters
SELECT user_id, COUNT(*) AS event_count
  FROM events
 GROUP BY user_id
HAVING status = 'active' AND COUNT(*) > 10;
```

### Prefer `INNER JOIN` over `CROSS JOIN` with a `WHERE` filter

A `CROSS JOIN` produces the full Cartesian product before filtering. If you are filtering the result by a join condition, use an explicit `INNER JOIN` instead:

```sql
-- Better
SELECT a.id, b.value
  FROM table_a a
  JOIN table_b b ON a.key = b.key;

-- Avoids the cross product
SELECT a.id, b.value
  FROM table_a a, table_b b
 WHERE a.key = b.key;
```

### Use `LIMIT` to stop early where possible

For queries without `ORDER BY` or `GROUP BY`, `LIMIT` stops execution once the requested rows are found:

```sql
SELECT * FROM events LIMIT 100;
```

Note: `ORDER BY`, `GROUP BY`, and `DISTINCT` are greedy — they must consume the full input before they can emit results. `LIMIT` after these operations only affects output size, not scan volume.

### Use `TIMESTAMP AS OF` for time-bounded queries on partitioned data

For datasets partitioned by date (Mabel partitioning), a `TIMESTAMP AS OF` clause restricts which partitions are opened:

```sql
SELECT *
  FROM my_table
   TIMESTAMP AS OF '2024-06-01'::TIMESTAMP;
```

This is faster than a `WHERE` filter on an event timestamp column, which still opens all partitions and then discards rows.

### Group by numeric columns where possible

`VARCHAR` key lookups in the hash table are slower than integer key lookups due to length-variable hashing and comparison. If you have a choice between grouping by a name and grouping by a numeric ID, prefer the ID:

```sql
-- Faster
SELECT user_id, COUNT(*) FROM events GROUP BY user_id;

-- Slower for high-cardinality data
SELECT username, COUNT(*) FROM events GROUP BY username;
```

### High-cardinality `GROUP BY` is inherently expensive

Grouping by a column with nearly unique values (user IDs in a large dataset, full timestamps) produces many small groups. This is memory-intensive and cannot be significantly optimized. Consider pre-aggregating at ingest time for such cases.

---

## NULL Checks

`IS NULL` and `IS NOT NULL` are optimized filter forms that are faster than `= NULL` (which never matches anything — see [NULL Semantics](adv-null-semantics.md)):

```sql
-- Correct and efficient
WHERE column IS NULL
WHERE column IS NOT NULL

-- Always returns no rows (NULL != NULL)
WHERE column = NULL
```
