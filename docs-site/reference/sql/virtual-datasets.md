---
title: Virtual Datasets — Opteryx Reference
description: The $-prefixed relations Opteryx computes at query time.
---

# Virtual Datasets

Opteryx computes a small number of relations when queried rather than reading them
from storage. They are named with a leading `$`, which is reserved for the engine —
a name you create can never collide with one.

`$` is reserved for the engine generally, not for relations specifically. Most
`$` names are relations, and one — [`$me`](#the-me-pronoun) — is not; it is a
name part that stands for your username.

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

## The $me pronoun

Not a relation. `$me` stands for your username, and it resolves **inside a
relation name**, wherever a name part can appear:

```sql
SELECT * FROM personal.$me.planet_notes;
```

If your username is `ada`, that reads `personal.ada.planet_notes`. Everything
after the statement is parsed sees the resolved name, so a task you create, a
trigger you hang off it and the permission check it passes all see
`personal.ada.…`.

It is the only word that behaves this way, and it can only ever mean you — there
is no spelling that addresses someone else's collection without naming them.
Because `personal.<username>.*` is yours outright (see
[Access and Permissions](/docs/core-concepts/access-and-permissions)),
`personal.$me.*` always passes.

Three things it does not do:

- **It is not a relation.** `$me` substitutes wherever a name part can appear,
  so `SELECT * FROM $me` becomes `SELECT * FROM ada` and fails with
  ``Dataset `ada` cannot be found``. Use [SHOW USER](statements/show-user) to
  see who you are.
- **It is not a value.** It resolves in a name, not in an expression — a `$me`
  in a `SELECT` list or a `WHERE` clause is an ordinary column reference.
- **It does not work inside a task's body.** A task's statement is stored as you
  write it and re-parsed each time the task fires, as whoever the task runs as,
  so `$me` there would have no single answer. It is refused, and you write the
  name out. The task's own name takes `$me` normally.

Quoting it escapes it: `` personal.`$me`.x `` is a collection literally named
`$me`.

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
- The set of virtual datasets is not a stable API. `$me` is part of the
  documented SQL surface and is.
