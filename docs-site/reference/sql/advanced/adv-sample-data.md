---
title: Sample Data in Opteryx - Built-in Test Datasets
description: Explore the built-in sample relations in Opteryx, and load the TPC-H sample dataset with LOAD SAMPLE.
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

## Loading a Sample Dataset

The `$` relations are tiny — enough to try an expression, not enough to write a realistic
query against. For that, [LOAD SAMPLE](../statements/load-sample) copies a staged sample
dataset into a collection of your own:

```sql
LOAD SAMPLE TPCH INTO personal.alice AT SCALE 0.1;
```

That creates the eight [TPC-H](https://www.tpc.org/tpch/) tables — `region`, `nation`, `supplier`, `customer`, `part`,
`partsupp`, `orders` and `lineitem` — in an empty collection. Unlike the `$` relations,
these are ordinary datasets: they are copied into your own storage, they are billed like
any other dataset, and you drop them when you are done with them. Staged scale factors on
Opteryx Cloud are `0.01`, `0.1`, `1` (the default), `5` and `10`.

The staged data follows the TPC-H schema and is provided for demonstration and
testing only. It is not an official TPC benchmark implementation, and any timings
you take against it are not comparable to published TPC-H results. See the
[TPC-H specification](https://www.tpc.org/tpch/) for the benchmark itself.

---

TPC, TPC Benchmark, and TPC-H are trademarks of the
[Transaction Processing Performance Council](https://www.tpc.org/).
