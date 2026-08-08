---
title: Virtual Datasets — Opteryx Reference
description: The $-prefixed relations Opteryx computes at query time.
---

# Virtual Datasets

Opteryx computes a small number of relations when queried rather than reading them
from storage. They are named with a leading `$`, which is reserved for the engine —
a name you create can never collide with one.

## `$planets`

Sample data: 9 rows, 20 columns of planetary facts. It behaves like any other
relation, so you can project, filter, join and aggregate it:

```sql
SELECT name, gravity
  FROM $planets
 WHERE number_of_moons > 1;
```

`$planets` is also **temporal** — see [time travel](advanced/adv-time-travel), where
querying as of a date before 1781 returns fewer rows, because Uranus and Neptune had
not been discovered.

It exists so every example in this documentation can be run without loading data
first. Treat it as sample data for learning and testing, not as a fixture to build
on.

## Other `$` names

Other `$`-prefixed relations exist inside the engine but are **internal** and not
part of the documented SQL surface. They are not addressable by name, and querying
one is refused with an error naming the statement to use instead:

```sql
SELECT * FROM $grants;
-- '$grants' cannot be queried directly; use `SHOW GRANTS`.
```

The information they carry is reached through its own statement —
[SHOW VARIABLES](statements/show-variables), [SHOW USER](statements/show-user),
[SHOW GRANTS](statements/show-grants) — so the statement and the relation cannot
drift into disagreeing. Because no `SHOW` form can appear in a `FROM` clause, these
results cannot be joined or filtered at the source; filter the returned rows
client-side instead.

## Notes

- `$`-prefixed names are reserved for the engine. See
  [Reserved Words](reserved-words) for the identifier rules.
- The set of virtual datasets is not a stable API.
