---
title: Reserved Words — Opteryx Reference
description: The small set of words Opteryx cannot read as a bare identifier, and how to quote around them.
---

# Reserved Words

Opteryx reserves far fewer words than most SQL engines. A keyword is only a
problem where the parser would otherwise have to guess whether you meant the
keyword or a name — in practice that is a **bare column reference** and a **bare
table name**, and nowhere else.

Everything on this page is escapable. **Double quotes or backticks always work**,
including for every word listed below.

## Reserved as a bare column reference

`SELECT start FROM …` fails for these; `SELECT "start" FROM …` does not.

```
ALL   DISTINCT   DISTINCTROW   EXISTS   FROM   INTERVAL   TOP   TRIM
```

## Reserved as a bare table name

`SELECT * FROM table` fails for these; `SELECT * FROM "table"` does not.

```
LATERAL   TABLE
```

## Quoting

Two quoting styles identify a name rather than a string:

```sql
SELECT "FROM" FROM events;     -- double quotes
SELECT `FROM` FROM events;     -- backticks
```

Single quotes are **only** for string literals — `'FROM'` is the five-character
text, not a column.

Backticks are the only way to quote a name containing a hyphen, because a bare
`-` is always the subtraction operator (`a-b` parses as arithmetic). Blob-store
paths usually need them:

```sql
SELECT * FROM `my-bucket`.`my-data`;
```

## Aliases Are Not Restricted

Unlike Snowflake and Postgres, Opteryx does not reserve anything in an alias
position — `SELECT 1 AS from` and `… AS t(select)` both parse. Quoting an alias
is still clearer, but it is not required.

## Notes

- This list is derived by testing every keyword the parser knows (935 candidates)
  in each position, so it reflects what the engine actually rejects rather than
  what the SQL standard reserves.
- No word is reserved in **both** positions — a name that fails as a column may
  still be a valid table name, and vice versa.
- Identifiers may start with a letter, `_`, `$` or `@`, and `$`-prefixed names
  are reserved for Opteryx's own [virtual datasets](advanced/adv-sample-data).
