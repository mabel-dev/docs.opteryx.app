---
title: Troubleshooting Opteryx Queries - Slow Queries and Errors
description: Diagnose slow Opteryx Core queries and common errors. Read EXPLAIN output, reduce data read with projection and filters, and understand single-node limits.
---

# Troubleshooting Queries

Most performance problems in Opteryx come down to one thing: reading more data than the query needs. This guide covers how to see what a query is doing and the handful of changes that fix the common cases.

## See the Plan First

Before changing anything, look at how the optimiser has planned the query. `EXPLAIN` shows the physical plan without running it:

```sql
EXPLAIN
SELECT name, mass
  FROM data.planets
 WHERE gravity > 5;
```

Read the plan from the bottom up. The scan is at the bottom — check that the filter and the column list have been pushed into it. If a filter you wrote is sitting in a separate step above the scan rather than in it, the scan is reading more than it should.

## The Usual Fixes

### Stop Selecting Everything

`SELECT *` forces every column to be decoded, even the ones you never look at. Name the columns you need:

```sql
-- reads every column
SELECT * FROM data.events WHERE level = 'ERROR';

-- reads two columns
SELECT event_id, message FROM data.events WHERE level = 'ERROR';
```

On a wide dataset this is often the single biggest win. Column projection only helps if you let it.

### Filter Early and Selectively

A `WHERE` clause on a column with good statistics (dates, IDs, low-cardinality keys) lets Opteryx skip whole row groups without decoding them. The more selective the filter, the more it skips:

```sql
SELECT customer_id, amount
  FROM data.orders
 WHERE ordered_at >= '2024-06-01';
```

## Confirming the Optimiser Is Helping

To check how much the optimiser is doing for a query, run it with the optimiser disabled and compare:

```sql
SET disable_optimizer = true;
SELECT ...;
```

If the query is dramatically slower this way, the optimiser is doing real work — which usually means the query is already benefiting from pushdown. Leave the optimiser on for normal use; this is a diagnostic, not a setting to ship.

You can also isolate the reader's behaviour with `WITH` hints — for example, `WITH(NO_PUSH_SELECTION)` forces the filter to run above the scan so you can measure the difference pushdown makes:

```sql
SELECT * FROM data.events WITH(NO_PUSH_SELECTION) WHERE level = 'ERROR';
```

See [Engine Configuration](/docs/reference/sql/advanced/engine-configuration) for the full list of hints and query parameters.

## Common Errors

**Unexpected `NULL`s in results.** A field missing or genuinely absent in the source data reads as `NULL`, and comparisons with `NULL` are neither true nor false. Use `IFNULL` or the null-aware functions, and see [NULL Semantics](/docs/reference/sql/advanced/null-semantics).

**A dataset name isn't found.** Dataset names are dot-separated and resolve through whichever workspace prefix you registered — `data.planets` only resolves if `register_workspace("data", ...)` has run in this process. See [Querying Local Data](/docs/guides/querying-local-data).

**A column comes back as the wrong type.** Cast explicitly when a column's inferred type doesn't match what you expect: `CAST(col AS TIMESTAMP)`. See [Data Types](/docs/reference/sql/data-types).

## When the Problem Is Not the Query

Opteryx is single-node by design — it scales up on one machine, not out across many. If a query is slow because the dataset genuinely exceeds what one machine can hold in memory, no amount of query tuning fixes that; the answer is a smaller working set (more selective filters, fewer columns, pre-aggregation) or a different tool. See [When to Use Opteryx](/docs/introduction/when-to-use) and [Known Limits](/docs/roadmap-guarantees/known-limits) for where that line sits.

## Related

- [Query Optimization](/docs/reference/sql/advanced/query-optimization)
- [Querying Local Data](/docs/guides/querying-local-data)
- [Engine Configuration](/docs/reference/sql/advanced/engine-configuration)
