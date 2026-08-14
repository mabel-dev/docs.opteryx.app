---
title: SQL Compatibility Notes
description: Notes on areas where Opteryx's behaviour may differ from other SQL engines — covering permitted SQL standard variations, extension behaviour, and known limitations.
---

# SQL Compatibility Notes

SQL standards leave a number of behaviours explicitly unspecified or implementation-defined. Beyond the standard, most engines also implement extensions — things like regular expressions, string functions, or temporal handling — where there is no single authoritative specification and implementations legitimately differ.

Opteryx uses DuckDB as a validation reference to help ensure the engine performs similarly to other SQL systems. Where differences exist, this document records what Opteryx does, why, and how to write queries that produce predictable results.

---

## Strings are byte-oriented by default

Opteryx has a three-member string family, and the default type is **byte-oriented**:

| Type        | Storage    | Semantics                                |
|-------------|------------|------------------------------------------|
| `VARCHAR`   | raw bytes  | default; ASCII-oriented, no UTF-8 decode |
| `NVARCHAR`  | raw bytes  | opt-in UTF-8; decoded for character ops  |
| `VARBINARY` | raw bytes  | opaque bytes                             |

Many other engines treat all strings as UTF-8. Opteryx's `VARCHAR` may legitimately hold bytes that are **not valid UTF-8** (for example, CP1251-encoded text), where a "character count" is undefined. The byte-oriented default means Opteryx never has to assume — or pay to decode — an encoding it cannot guarantee.

### `LENGTH` / `CHAR_LENGTH` count bytes on `VARCHAR`

| Expression                           | Result               |
|--------------------------------------|----------------------|
| `LENGTH('abcde')`                    | 5 (bytes = codepoints for ASCII) |
| `LENGTH('ффф')` on `VARCHAR`         | 6 (bytes)            |
| `LENGTH(x)` where `x` is `NVARCHAR` | 3 (codepoints)       |
| `OCTET_LENGTH('ффф')`                | 6 (always bytes)     |

- `LENGTH` / `CHAR_LENGTH` / `CHARACTER_LENGTH` count **codepoints on `NVARCHAR`** and **bytes on `VARCHAR` / `VARBINARY`** — length in the type's natural unit.
- `OCTET_LENGTH` (alias `BYTE_LENGTH`) always counts **bytes**, regardless of type.

**For character-count semantics:** cast to `NVARCHAR`, or operate on data already typed
`NVARCHAR`. Use `OCTET_LENGTH` when you specifically want bytes.

`CAST(x AS NVARCHAR)` (equivalently `x::NVARCHAR`) re-tags the value, and the length
functions then count codepoints:

| Expression                              | Result           |
|-----------------------------------------|------------------|
| `LENGTH('ффф')`                         | 6 (bytes)        |
| `LENGTH(CAST('ффф' AS NVARCHAR))`       | 3 (codepoints)   |
| `CHAR_LENGTH(CAST('ффф' AS NVARCHAR))`  | 3 (codepoints)   |
| `OCTET_LENGTH(CAST('ффф' AS NVARCHAR))` | 6 (always bytes) |

> Be Aware: The same byte-orientation applies to other string operations (substring, position, pattern matching). On ASCII data engines typically agree; they can diverge on multibyte or non-UTF-8 input.

---

## Pattern matching (`LIKE`, `RLIKE`, `REGEXP_REPLACE`)

**There is no regex engine at execution time.** A `RLIKE` / `REGEXP_LIKE` pattern is compiled
when the query is planned into a byte-level DFA — a transition table — and matching is a
table walk: one byte read and one array index per input byte, with no backtracking. RE2
appears only as the plan-time *parser* that builds the pattern AST; RE2's own matcher is
never called, and it is not linked into the execution path at all.

That buys predictable, linear-time matching, and costs generality. The **supported dialect
is a subset**, and a pattern outside it is refused when the query is planned rather than
served by a slower fallback:

| Not supported | Note |
|---------------|------|
| Lookaround, backreferences | No DFA equivalent |
| Case-folding — `(?i)`, `RLIKE` with a case-insensitive flag | Refused rather than silently matched case-sensitively; use `ILIKE` |
| Non-ASCII **pattern** content | Subject strings may be any UTF-8; the *pattern* must be ASCII |
| `^` / `$` nested inside alternation or repetition | Anchors are recognised only at the outermost start/end — `^foo$` is fine, `(^foo|bar$)` is refused |
| Very large bounded repeats (`{n,m}`) | Unrolled, with a size cap; over the cap the pattern is refused |

`.` matches any single **byte** except newline, not a codepoint. For a yes/no match this
agrees with codepoint-aware engines on any pattern that doesn't count exact character
positions — `.{3}` against a multi-byte subject counts bytes.

### `REGEXP_REPLACE` is capture extraction only

The only supported form is whole-match capture extraction — `REGEXP_REPLACE(s, pattern, '\1')`
where `pattern` compiles to an anchored DFA program consuming the whole input. The optimizer
rewrites those calls to a native extraction kernel. An arbitrary replacement template, or a
pattern outside the DFA-compilable subset, raises:

~~~sql
SELECT REGEXP_REPLACE(name, '^(M.*)$', '\1') FROM planets;   -- ok
SELECT REGEXP_REPLACE(name, 'a', 'X')        FROM planets;   -- raises
~~~

General regex replacement is not available. Rewrite with `REPLACE`, `SUBSTRING` or
`SPLIT` where the transformation is expressible without one.

### Byte orientation still applies

Because string operations are byte-oriented by default (see above), results can differ from
engines that operate over codepoints when the input contains **non-UTF-8 or multibyte
characters** — the match operates correctly over bytes, but "the same logical string" may not
be the same byte sequence another engine sees. This is not a bug in the matcher; it is the
byte-vs-codepoint model surfacing through pattern matching.

---

## Arithmetic

### `/` is true division; integer division is `DIV`

`/` always returns a floating-point result. The **integer (truncating) division operator is spelled `DIV`**. Some engines use `//` for this. Cross-type arithmetic (`INT` with `FLOAT`) promotes the integer operand to float.

### Decimal arithmetic stays decimal

`DECIMAL / DECIMAL` returns `DECIMAL`; `DECIMAL` mixed with an integer keeps decimal semantics rather than promoting to float. Very precise decimal results may still differ from other engines in trailing digits depending on scale handling.

### Floating-point aggregates are not bit-identical across engines

`SUM` / `AVG` over floating-point columns are computed in double precision, but **summation order affects the result**. Results typically agree to ~13–15 significant figures rather than exactly — this is inherent to floating-point addition, not a correctness issue. (`SUM` over `INT64` uses exact 128-bit accumulation and is stable.)

When comparing results programmatically, use a **relative tolerance** for float aggregates rather than exact equality.

---

## Temporal values require explicit typing

Opteryx does not infer temporal types as eagerly as some other engines.

- **Integer-encoded temporal columns are surfaced as `INT64`.** A column physically stored as epoch seconds or days reads back as an integer unless you cast it explicitly: `EventDate::DATE`, `EventTime::TIMESTAMP[s]`.

- **Timestamp casts carry an explicit unit.** `::TIMESTAMP[s]`, `[ms]`, `[us]`, `[ns]` select how the underlying integer is interpreted. Casting epoch **seconds** data with `[ms]` (or vice versa) will silently mis-scale the values.

- **Timestamps render as UTC-aware.** Opteryx tags timestamps with a UTC offset (`2013-07-15T12:40:00+00:00`). Other engines may return a naive datetime (`2013-07-15T12:40:00`). These denote the **same instant** — the difference is only in the rendered representation. When comparing, normalise to UTC-naive on both sides.

- **`DATE_TRUNC` is not available;** use `TRUNC(ts, 'minute')` for truncation to a unit.

---

## Ordering and `LIMIT`

### Tie-breaking among equal sort keys is unspecified

The SQL standard does not define which rows survive when many rows share the same sort key value and a `LIMIT` is applied. For `ORDER BY k ... LIMIT n` (and especially `... LIMIT n OFFSET m`), different engines may keep a different subset of tied rows. Both results are valid.

**To get deterministic output across engines:** add a tie-breaking column to `ORDER BY` so the ordering is total (e.g. `ORDER BY k, id`).

### `LIMIT` without `ORDER BY` returns an arbitrary subset

`SELECT ... LIMIT n` with no `ORDER BY` returns *some* `n` rows. The set is unspecified by the standard and is not guaranteed to be stable across runs or to match another engine's output. Add an `ORDER BY` if you need a defined result.

---

## NULL handling

NULL values within a column propagate correctly through scalar functions (three-valued logic: `f(NULL) = NULL`).

A **bare untyped `NULL` literal** passed to a function that requires a concrete type is rejected when the query is planned, rather than returning `NULL`. `NULL` on its own carries no type, so there is no overload to select:

~~~
OCTET_LENGTH arg1 (NULL): expected STRING - an untyped NULL has no type to match;
write `CAST(NULL AS VARCHAR)`.
~~~

Give the literal a type, or use column data, which carries one:

~~~sql
SELECT OCTET_LENGTH(CAST(NULL AS VARCHAR));   -- returns NULL
~~~

This applies only to the bare literal. A `NULL` **value** in a typed column propagates normally (`f(NULL) = NULL`), and functions that exist to handle `NULL` — `COALESCE`, `IFNULL`, `NULLIF` — accept an untyped `NULL` argument because they do not require a concrete type.

---

## Function availability

Opteryx implements a large but not exhaustive set of SQL functions. Extensions that are common across engines are not standardised, so names and signatures can legitimately differ. When a function is missing, Opteryx fails fast with an explicit "unknown function" error rather than silently degrading.

Notable differences relevant to users coming from other engines:

- Integer division is `DIV`, not `//`.
- `OCTET_LENGTH` / `BYTE_LENGTH` are available for explicit byte-length queries.
- `DATE_TRUNC` is not available; use `TRUNC(value, unit)`.
- `REGEXP_REPLACE` supports only the whole-match capture form — see [above](#regexp_replace-is-capture-extraction-only).
