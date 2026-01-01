# EXPLAIN

`EXPLAIN` shows the logical and physical plan for a query. Use `EXPLAIN ANALYZE` to execute the query and include runtime metrics.

```sql
EXPLAIN SELECT * FROM orders WHERE id = 1;
```

`FORMAT MERMAID` produces a mermaid diagram representation of the plan.