---
title: Sample Data in Opteryx - Built-in Test Datasets
description: Explore the built-in sample dataset in Opteryx for testing and demonstration.
---

# Sample Data

Opteryx includes one built-in relation for demonstration and testing:

- `$planets` (20 columns, 9 rows)

```sql
SELECT *
  FROM $planets;
```

`$planets` is temporal — using [Time Travel](adv-time-travel.md) returns different results depending on the date. Uranus was discovered in 1781 and Pluto in 1930, so querying before those dates returns fewer rows:

```sql
SELECT name
  FROM $planets
   TIMESTAMP AS OF '1700-01-01'::TIMESTAMP;
```

Other internal relations exist prefixed with `$` (such as `$variables` and `$user`). These are not intended for end-user queries — their structure and availability are not guaranteed.

