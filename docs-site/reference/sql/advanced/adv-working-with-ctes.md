---
title: Working with CTEs in Opteryx - Common Table Expressions and Recursion
description: How to use Common Table Expressions in Opteryx SQL - named subqueries, shared materialization, and recursive queries for hierarchies and graph traversal.
---

# Working with CTEs

A Common Table Expression (CTE) is a named subquery declared with `WITH` at the
top of a statement. It exists only for that statement, and it can be referenced
like a relation anywhere below its declaration — including from later CTEs in
the same `WITH` list.

```sql
WITH recent AS (
  SELECT * FROM orders WHERE created_at > '2024-01-01'
)
SELECT customer_id, COUNT(*) AS order_count
  FROM recent
 GROUP BY customer_id;
```

CTEs are for readability and reuse: name the intermediate result once instead of
repeating the subquery, and build a pipeline of transformations as a sequence of
named steps rather than a tower of nested parentheses.

## Scope and shadowing

- A CTE is visible to the main query and to CTEs declared **after** it in the
  same `WITH` list — never to earlier ones, and a CTE cannot reference itself
  (except under `RECURSIVE`, below).
- A CTE **shadows** a catalog relation of the same name for the duration of the
  statement.
- A view's body is a closed unit: it sees its own CTEs, never the CTEs of the
  query that reads it.

## One body, many references

A CTE referenced **once** is folded into the plan at its reference — it costs
nothing over writing the subquery inline. A CTE referenced **two or more
times** is materialized **once** and every reference reads the same result:

```sql
WITH totals AS (
  SELECT customer_id, SUM(amount) AS spend
    FROM orders
   GROUP BY customer_id
)
SELECT big.customer_id
  FROM totals AS big
  JOIN totals AS everyone ON everyone.spend < big.spend;
```

`totals` executes once here, not twice. A self-join of a CTE with itself is two
references to one materialized result, not two executions.

Two consequences worth knowing:

- **Shared work is coordinated, not duplicated.** A column no reference reads
  is never materialized, and a filter applied identically above *every*
  reference is moved into the body. A filter above only *some* references
  stays where it is — dropping rows one consumer needs would be a wrong
  answer, not an optimization.
- **Making a CTE single-reference changes the plan shape.** If you fold a
  second reference away, the body is inlined again and optimized in place.

## Recursive CTEs

`WITH RECURSIVE` lets a CTE reference itself, which turns it into an iterative
computation: hierarchies, reachability, sequences — anything defined as "start
here, then repeatedly apply a step until nothing new appears".

```sql
WITH RECURSIVE <name> [ (<columns>) ] AS (
    <anchor query>          -- the starting rows; must not reference <name>
    UNION [ ALL ]
    <recursive query>       -- the step; references <name> exactly once
)
SELECT ... FROM <name> ...
```

Evaluation is **semi-naive**: the anchor's rows are the first *frontier*; each
pass runs the recursive query with the self-reference bound to **only the
previous pass's rows**, and appends what it produces to the result. When a pass
produces nothing new, the recursion is finished. On a graph this is exactly
breadth-first frontier expansion — each pass sees the newly-discovered rows,
never the whole accumulated result.

### Counting and sequences

```sql
WITH RECURSIVE series (n) AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM series WHERE n < 10
)
SELECT n FROM series ORDER BY n;
```

For a plain integer sequence, prefer `GENERATE_SERIES` — it is a single native
call. Reach for recursion when each row genuinely depends on the previous one:

```sql
WITH RECURSIVE fib AS (
    SELECT 1 AS pos, 0 AS val, 1 AS next_val
    UNION ALL
    SELECT pos + 1, next_val, val + next_val
    FROM fib
    WHERE pos < 10
)
SELECT pos, val AS fibonacci_number
FROM fib
ORDER BY pos;
```

### Hierarchies and graph traversal

Walking an edge list is the canonical use. The recursive query joins the
frontier to the edges to discover the next frontier:

```sql
WITH RECURSIVE reach (node) AS (
  SELECT 1 AS node                      -- start at node 1
  UNION
  SELECT e.dst
    FROM reach
    JOIN edges AS e ON e.src = reach.node
)
SELECT node FROM reach ORDER BY node;
```

### UNION vs UNION ALL — this choice matters

- **`UNION`** deduplicates every produced row against everything the recursion
  has already emitted. A row seen before does not re-enter the frontier — which
  is precisely what makes traversal of a **cyclic** graph terminate. Use it
  whenever the data can revisit a state.
- **`UNION ALL`** appends unconditionally. It is cheaper (no dedup) and right
  for recursions that provably move forward — a counter that only increases, a
  strictly-deepening hierarchy.

A `UNION ALL` recursion over cyclic data never converges. It does not hang and
it does not silently truncate: the iteration ceiling
(`MAX_RECURSION_ITERATIONS`, default 1000) stops it with an error that names
the CTE. The fixes, in order of preference: switch to `UNION`, bound the
recursion with a depth column, or — if the recursion is legitimate and deep —
raise the ceiling.

```sql
-- depth-bounded traversal under UNION ALL
WITH RECURSIVE walk (node, depth) AS (
  SELECT 1 AS node, 0 AS depth
  UNION ALL
  SELECT e.dst, depth + 1
    FROM walk
    JOIN edges AS e ON e.src = walk.node
   WHERE depth < 6
)
SELECT DISTINCT node FROM walk;
```

### Rules the planner enforces

Each of these is rejected with a specific error when the query is planned —
none of them fails at runtime or computes a wrong answer:

- The body must be `<anchor> UNION [ALL] <recursive query>`, and only the
  recursive query may reference the CTE — **exactly once**, directly in its
  `FROM` clause. (`RECURSIVE` is permission, not obligation: a CTE under
  `WITH RECURSIVE` that never references itself plans as an ordinary CTE.)
- Both queries must produce the **same number of columns with the same
  types**. There is no silent widening — where the types differ, the error
  names the column and you add an explicit `CAST`.
- The recursive query may not apply **aggregation, window functions,
  `ORDER BY` or `LIMIT`** over the self-reference, and may only reach it
  through **`INNER` joins**. Apply those in the query that reads the CTE.
- **Mutual recursion** (two CTEs referencing each other) is not supported.

### Ordering

Result order without an `ORDER BY` is unspecified — for recursive CTEs as for
every other query. Do not rely on rows appearing in iteration order (some
engines happen to emit that way; Opteryx does not promise it). Add `ORDER BY`
to the reading query when order matters.

### Observing a recursion

`EXPLAIN` renders each recursive CTE as its own section with the anchor and
recursive-term plans; `EXPLAIN ANALYZE` adds what the fixpoint actually did —
the passes it ran and, for `UNION`, the distinct rows its visited set held:

```
RECURSIVE CTE reach | UNION, 3 iterations, 4 distinct rows, ceiling 1000
├─ ANCHOR
│  └─ ...
└─ RECURSIVE TERM
   └─ ...
```

An unexpectedly large iteration count is the first thing to look at when a
recursive query is slow: it usually means the frontier is not shrinking —
revisiting states under `UNION ALL`, or a step condition that filters less
than intended.

## Performance notes

- **Filter inside the body, not just above it.** Filters above a multiply-
  referenced or recursive CTE are not pushed into it unless every reference
  agrees (and never into a recursive body — filtering the frontier is not the
  same operation as filtering the result). If only part of the data matters,
  say so in the anchor and in the CTE body.
- **Keep the frontier narrow.** The recursive query re-runs every pass;
  columns it carries are carried through every iteration. Carry the columns
  the step needs, and join the rest back on afterwards.
- **Prefer set-based steps.** Each pass processes the whole frontier at once —
  a step that expands many rows per pass converges in few passes. A recursion
  that advances one row per pass (like the fibonacci example) works, but the
  per-pass cost is paid per row; that shape is for when the dependency is
  genuinely sequential.

## See Also

- [WITH](/docs/reference/sql/statements/with) — syntax reference
- [SELECT](/docs/reference/sql/statements/select)
- [Relation Constructors](adv-temp-tables) — `VALUES` and `UNNEST`, handy for
  edge lists in examples and tests
