---
title: CREATE TABLE ... CLONE — Opteryx Reference
description: SQL CREATE TABLE ... CLONE statement syntax and examples for forking a dataset in Opteryx without copying data
---

# CREATE TABLE ... CLONE

`CREATE TABLE ... CLONE` creates a dataset as a **fork** of another one, copying no
data. The new dataset's first manifest lists the same files the source's manifest
listed, so the cost is the same whether the source holds a megabyte or a terabyte.

What lands is an ordinary dataset. You query it, write to it, time-travel it and drop
it exactly as you would any other — and writes to it land in **its own** storage, never
touching the files it borrowed. The source records that the fork exists, and will not
expire the snapshot the fork rests on.

## Syntax

~~~sql
CREATE TABLE <target> CLONE <source>;
CREATE COLLECTION <target> CLONE <source_collection>;
~~~

The collection form forks every dataset in the source collection in one statement — which
is how a set of related tables, like a benchmark schema, is taken in one go rather than one
table at a time.

## Parameters

- **`<target>`** — the dataset to create. It must not already exist.
- **`<source>`** — the dataset to fork. It must be a dataset with a manifest, so one
  projected from an external catalog cannot be cloned — use
  [CREATE TABLE AS SELECT](create-table) for those.

`CLONE` cannot be combined with `AS SELECT`, with column definitions, or with
`OR REPLACE`: a clone takes the source's schema whole, so there is nothing for those to
describe.

## Examples

### Fork a dataset
~~~sql
CREATE TABLE personal.alice.lineitem CLONE samples.tpch_sf1.lineitem;
~~~

### Fork a whole collection
~~~sql
CREATE COLLECTION personal.alice.tpch CLONE samples.tpch_sf1;
~~~

Refused wholesale if any one dataset would be refused — the membership is read and every
target name checked before the first fork is made, because a half-cloned collection is a
state nobody can act on. Views are not cloned: a view is a query over dataset names, and
copying one where those names mean something else would silently read the wrong data.

### Query the fork, and edit it
~~~sql
SELECT COUNT(*) FROM personal.alice.lineitem;

DELETE FROM personal.alice.lineitem WHERE l_quantity < 5;
~~~

The delete writes to the fork alone. `samples.tpch_sf1.lineitem` is unchanged, and so
are every other fork of it.

## Permissions

- `READ` on the source. A fork exposes nothing a `SELECT *` would not, so forking is a
  read-tier act.
- `CREATE` on the target, the same tier as any other `CREATE TABLE`.
- Forking **out of another workspace** is refused while that workspace has
  `egress_protection` on. A fork is exactly the standing, systematic copy that guard
  exists to stop — a full mirror kept off the back of a single `reader` grant — so the
  source workspace's owner opens it deliberately with
  `ALTER WORKSPACE <source> SET egress_protection TO OFF`. No `SECURE` exemption
  applies: `SECURE` sanctions a named task or materialized view, and a hand-run
  statement is neither. Forking **within** one workspace is not egress and is never
  refused on this ground.

## Notes

- The source cannot be dropped or renamed while forks of it exist. Detach them first —
  see [ALTER TABLE](alter-table#detach).
- A fork of a fork is allowed, and inherits its parent's obligations: every dataset in
  the chain keeps the snapshot the fork below it rests on.
- The fork occupies no storage of its own until you write to it, and you are billed for
  only what you add.

## See Also

- [ALTER TABLE ... RESYNC](alter-table#resync) — bring a fork back up to date
- [ALTER TABLE ... DETACH](alter-table#detach) — turn a fork into an ordinary dataset
- [CREATE TABLE](create-table)
- [Sample Data](../advanced/adv-sample-data)
