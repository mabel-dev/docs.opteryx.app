---
title: Sample Data in Opteryx - Built-in Test Datasets
description: Explore the built-in sample relations in Opteryx, and fork a ready-made dataset with CREATE TABLE ... CLONE.
---

# Sample Data

Opteryx includes one built-in relation for demonstration and testing:

- `$planets` (20 columns, 9 rows)

```sql
SELECT *
  FROM $planets;
```

`$planets` is temporal — using [Time Travel](adv-time-travel) returns different results depending on the date. Uranus was discovered in 1781 and Pluto in 1930, so querying before those dates returns fewer rows:

```sql
SELECT name
  FROM $planets
   TIMESTAMP AS OF '1700-01-01'::TIMESTAMP;
```

Other internal relations exist prefixed with `$` (such as `$variables` and `$user`). These are not intended for end-user queries — their structure and availability are not guaranteed.

## Starting From a Ready-Made Dataset

The `$` relations are tiny — enough to try an expression, not enough to write a
realistic query against. For that, fork a dataset that already exists with
[CREATE TABLE ... CLONE](../statements/clone):

```sql
CREATE TABLE personal.alice.lineitem CLONE samples.tpch_sf1.lineitem;
```

Nothing is copied: the new dataset borrows the original's files, so the statement costs
the same whether the source holds a megabyte or a terabyte. Unlike the `$` relations,
what you get is an ordinary dataset — you can write to it, time-travel it and drop it,
and it occupies no storage of your own until you change it.

Use [ALTER TABLE ... RESYNC](../statements/alter-table#resync) to pick up changes the
source has made since, and [ALTER TABLE ... DETACH](../statements/alter-table#detach) to
take a private copy and end the relationship.
