---
title: Virtual Datasets — Opteryx Reference
description: The $-prefixed relations Opteryx computes at query time, and which are reachable by name.
---

# Virtual Datasets

Opteryx provides a small number of relations that are computed when queried
rather than read from storage. They are named with a leading `$`, which is
reserved for the engine — a name you create can never collide with one.

They fall into two groups, and the difference matters: some are ordinary
relations you can `SELECT` from and join, and some exist **only** to back a
`SHOW` statement.

## Queryable by name

These behave like any other relation — you can project, filter, join and
aggregate them.

| Dataset | Contents |
|---------|----------|
| [`$planets`](advanced/adv-sample-data) | Sample data: 9 rows, 20 columns of planetary facts. Also **temporal** — see [time travel](advanced/adv-time-travel), where querying before 1781 returns fewer rows |
| `$no_table` | A single row with one column, used as the source for a `SELECT` with no `FROM`. Rarely written explicitly |

```sql
SELECT name, gravity
  FROM $planets
 WHERE number_of_moons > 1;
```

## Reachable only through a `SHOW` statement

Each of these is deliberately **not** addressable by name. Each has exactly one
surface, so the statement and the relation cannot drift into disagreeing:

| Relation | Its only surface | Columns |
|----------|------------------|---------|
| `$variables` | [SHOW VARIABLES](statements/show-variables) | `name`, `value`, `type`, `owner`, `visibility` |
| `$user` | [SHOW USER](statements/show-user) | `attribute`, `value`, `type` |
| `$grants` | [SHOW GRANTS](statements/show-grants) | `pattern`, `role`, `actions` |

Querying one by name is refused, and the error names the statement to use
instead:

```sql
SELECT * FROM $grants;
-- '$grants' cannot be queried directly; use `SHOW GRANTS`.
```

The cost of that rule is real and taken deliberately: because no `SHOW` form can
appear in a `FROM` clause, these cannot be joined or filtered at the source.
Filter the returned rows client-side instead.

## Notes

- `$`-prefixed names are reserved for the engine. See
  [Reserved Words](reserved-words) for the identifier rules.
- The set of virtual datasets is not a stable API — treat `$planets` as sample
  data for learning and testing, not as a fixture to build on.
