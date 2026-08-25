---
title: MERGE Statement — Opteryx Reference
description: SQL MERGE INTO statement syntax, examples and limitations for applying a set of changes to a table in Opteryx
---

# MERGE

The `MERGE` statement applies a set of changes to a table in one atomic statement —
updating rows that already exist, inserting those that do not, and deleting those a
rule says should go.

> Warning: MERGE is experimental and only works against catalog-backed tables. It is not
> suitable for production use.

## Syntax

~~~sql
MERGE INTO <target> AS <alias>
USING <source> AS <alias>
   ON <condition>
[ WHEN MATCHED [ AND <predicate> ] THEN UPDATE SET <column> = <expression> [, ...] ]
[ WHEN MATCHED [ AND <predicate> ] THEN DELETE ]
[ WHEN NOT MATCHED [ AND <predicate> ] THEN
      INSERT ( <column> [, ...] ) VALUES ( <expression> [, ...] ) ];
~~~

## Parameters

- **`<target>`** — the table being changed. Must be a catalog-backed table, and must be
  aliased.
- **`<source>`** — the table supplying the changes. Must be a table, and must be aliased.
- **`<condition>`** — how a source row is paired with a target row. Usually an equality
  on a key; multi-column conditions are supported.
- **`<predicate>`** — an extra condition on an arm. The arm only fires when it holds.
- **`WHEN MATCHED`** — applies to target rows the source paired with.
- **`WHEN NOT MATCHED`** — applies to source rows that paired with nothing.

At least one `WHEN` clause is required. Arms are evaluated **in the order written**: the
first arm whose condition holds is the one that fires.

## What Each Row Does

Every row of the join resolves to exactly one action:

| Outcome | When | Effect |
|---------|------|--------|
| Nothing | The row paired with nothing and no `NOT MATCHED` arm fired, or it paired but no arm's condition held | The target row is left exactly as it was |
| Insert | A `NOT MATCHED` arm fired | A new row is added |
| Update | A `WHEN MATCHED … UPDATE` arm fired | The old row is replaced |
| Delete | A `WHEN MATCHED … DELETE` arm fired | The row is removed |

Target rows the source never mentions are not touched, not rewritten, and cost nothing.

## Examples

### Upsert

The common case — bring a table up to date from a table of changes:

~~~sql
MERGE INTO catalogue.security.vulnerabilities AS v
USING catalogue.security.vulnerabilities_delta AS d
   ON v.cve = d.cve
 WHEN MATCHED THEN UPDATE SET details = d.details
 WHEN NOT MATCHED THEN INSERT (cve, details) VALUES (d.cve, d.details);
~~~

### Only Update What Actually Changed

A feed that republishes everything will re-write every row unless you say otherwise.
Guarding the `MATCHED` arm means an unchanged row is left alone entirely:

~~~sql
MERGE INTO catalogue.security.vulnerabilities AS v
USING catalogue.security.vulnerabilities_delta AS d
   ON v.cve = d.cve
 WHEN MATCHED AND v.details IS DISTINCT FROM d.details
      THEN UPDATE SET details = d.details,
                      revision = v.revision + 1,
                      last_updated = CURRENT_TIMESTAMP
 WHEN NOT MATCHED
      THEN INSERT (cve, details, revision, last_updated)
           VALUES (d.cve, d.details, 1, CURRENT_TIMESTAMP);
~~~

Note `v.revision + 1`. An `UPDATE` arm can read the row it is replacing, which is what
`MERGE` offers that a delete followed by an insert cannot. Columns the `SET` list does
not mention keep their existing values.

Without the `IS DISTINCT FROM` guard, `revision` would count how many times the feed ran
rather than how many times the CVE changed.

### Several Arms

Arms are tried in order, so put the more specific one first:

~~~sql
MERGE INTO catalogue.inventory.stock AS s
USING catalogue.inventory.movements AS m
   ON s.sku = m.sku
 WHEN MATCHED AND m.quantity = 0 THEN DELETE
 WHEN MATCHED THEN UPDATE SET quantity = m.quantity
 WHEN NOT MATCHED THEN INSERT (sku, quantity) VALUES (m.sku, m.quantity);
~~~

### Delete Only

Omit the other arms to remove every target row the source names:

~~~sql
MERGE INTO catalogue.sessions.active AS a
USING catalogue.sessions.expired AS e
   ON a.session_id = e.session_id
 WHEN MATCHED THEN DELETE;
~~~

### Insert Only

~~~sql
MERGE INTO catalogue.reference.countries AS c
USING catalogue.reference.countries_new AS n
   ON c.iso_code = n.iso_code
 WHEN NOT MATCHED THEN INSERT (iso_code, name) VALUES (n.iso_code, n.name);
~~~

## Inspecting the Plan

`EXPLAIN` shows what a `MERGE` will do without running it:

~~~sql
EXPLAIN
MERGE INTO catalogue.security.vulnerabilities AS v
USING catalogue.security.vulnerabilities_delta AS d
   ON v.cve = d.cve
 WHEN MATCHED THEN UPDATE SET details = d.details
 WHEN NOT MATCHED THEN INSERT (cve, details) VALUES (d.cve, d.details);
~~~

`EXPLAIN ANALYZE` is **rejected** for `MERGE`, because `ANALYZE` measures a statement by
running it — which would make inspecting a plan change your table.

## Duplicate Source Rows

If a target row is paired with more than one source row, the statement would have to act
on that row twice. That is rejected:

~~~
MERGE INTO cardinality violation: a row of <table> is matched by more than one
source row, so the statement would act on it twice. De-duplicate the source on
the ON key.
~~~

Nothing is written when this happens. De-duplicate the source first — for example with
`GROUP BY` or a window function picking one row per key — and re-run.

## Concurrency

A `MERGE` is built against the version of the table it read. If another writer commits to
that table first, the statement is refused rather than published, because publishing
would drop their work:

~~~
Another writer committed to <table> while this statement was preparing its own
commit, so it was refused. Nothing was written. Re-run the statement - it will be
rebuilt against the current state of the relation.
~~~

Nothing is written, and re-running rebuilds against whatever is now current. It is not
retried for you: whether the work is still valid depends on what the other writer did.

## Limitations

MERGE is experimental. The following are rejected when the query is planned, not
silently ignored:

- **Both relations must be aliased.** `MERGE INTO t AS x USING s AS y` — an un-aliased
  relation is refused.
- **The source must be a table.** `USING ( SELECT ... )` is not supported; write the
  query's result to a table first.
- **`WHEN NOT MATCHED BY SOURCE` is not supported.** It acts on target rows the source
  never mentioned, which this implementation does not read.
- **An `INSERT` arm must name its columns.** `INSERT (a, b) VALUES (...)`, never a bare
  `VALUES`, so the values cannot silently bind to different columns if the target's
  schema changes. `INSERT ROW` and `INSERT *` are not supported.
- **An `UPDATE` arm cannot carry its own `WHERE`.** Put the condition on the arm:
  `WHEN MATCHED AND <predicate> THEN UPDATE ...`.
- **One `VALUES` row per `INSERT` arm**, and each column assigned at most once per
  `UPDATE` arm.
- **Catalog-backed tables only.** A read-only or non-catalog connector is refused.
- **The target's schema is not changed.** `MERGE` writes rows; it does not add, drop or
  retype columns.

There is also a memory ceiling. A merge holds the address of every row it acts on until
it commits, because the commit is atomic. An extremely large merge is refused rather than
partially applied:

~~~
MERGE INTO ran out of address budget tracking which rows of <table> it has acted on.
~~~

## Notes

- The whole statement is one commit. Readers see either all of its changes or none of
  them — never a half-applied merge.
- Replacing a row does not rewrite the file it lives in. The old row is marked as removed
  and the replacement written alongside, so the cost of a merge scales with how much
  changed, not with the size of the table. Removed rows are cleaned up by
  [OPTIMIZE TABLE](optimize-table).
- A merge in which no arm fires for any row is a success that does nothing — it writes no
  new version of the table.
- Re-running the same merge against the same source is safe: the second run finds nothing
  left to change.
- A materialized view is **not** a table: this statement is rejected against one. Its
  contents come from its defining `SELECT` — see [REFRESH MATERIALIZED VIEW](refresh-materialized-view#a-materialized-view-is-not-a-table).

## See Also

- [INSERT](insert)
- [JOIN](joins)
- [OPTIMIZE TABLE](optimize-table)
- [EXPLAIN](explain)
