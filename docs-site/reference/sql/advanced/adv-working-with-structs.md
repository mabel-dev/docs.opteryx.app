---
title: Working with JSON Strings in Opteryx - SQL JSON Operations
description: Query nested data in Opteryx with JSON strings. Extract keys with the arrow operators, list keys with JSONB_OBJECT_KEYS, and understand how Parquet struct columns are surfaced.
---

# Working with JSON Strings

**Opteryx has no native struct type.** Nested data is held as a **JSON string** in a
`VARCHAR` or `NVARCHAR` column, and every operation on this page is a string operation over
that text. There is no `STRUCT` you can declare, cast to, or see in a schema.

That includes data that was nested at rest: **a Parquet `STRUCT` column is surfaced as an
`NVARCHAR` column holding the JSON encoding of each value.** `SHOW COLUMNS` and
`information_schema.columns` report it as `NVARCHAR`, not as a struct, and the field access
below is what reads into it.

## Creating JSON Values

JSON values are ordinary string literals:

```sql
SELECT '{"name": "Alice", "age": 30}';
```

Keys are always text; values may be of mixed types, because nothing constrains them but the
JSON itself.

## Reading Values

### Arrow Operator (`->`)

Returns the JSON-encoded value for a key. String values include their surrounding quotes — `'"Alice"'`, not `'Alice'`. Nested objects are returned as JSON strings.

```sql
struct -> 'key'
```

Example:

```sql
SELECT address -> 'city' AS city
  FROM records;
-- Returns '"London"' (with quotes), not 'London'
```

Use `->` when you want to pass the result to another JSON operator, or when the type of the value is unknown.

### Arrow Text Operator (`->>`)

Returns the value for a key as a plain `VARCHAR`, stripping JSON encoding. String values do not include surrounding quotes.

```sql
struct ->> 'key'
```

Example:

```sql
SELECT address ->> 'city' AS city
  FROM records;
-- Returns 'London' (no quotes)
```

Use `->>` when you need the result as a plain string for comparison, filtering, or concatenation:

```sql
SELECT *
  FROM records
 WHERE address ->> 'city' = 'London';
```

### Listing Keys (`JSONB_OBJECT_KEYS`)

Returns the document's top-level keys as an `ARRAY<VARCHAR>`, in document order:

```sql
SELECT JSONB_OBJECT_KEYS(address) AS keys
  FROM records;
-- ['street', 'city', 'postcode']
```

It reads only the **top level**, in document order — a nested object contributes its own key,
not its children's. Given `{"a":1,"b":{"c":2},"d":3}` the result is `['a', 'b', 'd']`.

> Be Aware: `JSONB_OBJECT_KEYS` is usable in a **projection**, not in a `WHERE` clause. Containment tests over its result have no native kernel, so `WHERE 'k' = ANY (JSONB_OBJECT_KEYS(doc))` is refused when the query is planned. Project the keys and filter downstream, or use the key-existence form below.

### Key Existence

`@?` tests whether a path resolves in the document. It runs in a `WHERE` clause and in a
projection alike:

```sql
SELECT *
  FROM records
 WHERE address @? 'postcode';
```

The path is written the way `->` writes one, and is resolved by the same code, so all three
spellings below name the same thing — a bare key, a JSON Path, or an RFC 6901 pointer:

```sql
SELECT address @? 'postcode'         AS has_postcode,
       address @? '$.contact.email'  AS has_email,
       address @? '/contact/email'   AS also_has_email
  FROM records;
```

The path must be a **literal**. It is resolved once, when the query is planned, so a path that
varies per row is not supported — that form is refused with a message saying so, rather than
failing later.

**Existence is not extraction.** Testing a key with `IS NOT NULL` on an extraction also
executes, and means something slightly different:

```sql
SELECT *
  FROM records
 WHERE address -> 'postcode' IS NOT NULL;
```

An absent key extracts as `NULL`, so the `->` form distinguishes "key not present" from "key
present" — but not from "key present with a JSON `null` value", which also extracts as `NULL`.
`@?` answers `TRUE` for that case, because the key is there. Where that distinction matters,
`@?` is the form that asks the question you meant.

Null and error behaviour: a row whose document is `NULL` answers `NULL`, and a row whose bytes
are not valid JSON raises an error — never a silent `false`, which would be indistinguishable
from "no such key".

### Nested Access

Chain `->` calls to navigate nested documents. Each `->` returns the JSON encoding of what it
selected, which the next one parses in turn; finish with `->>` when you want a plain string.

Given a `profile` column holding:

```json
{"name": "Alice", "address": {"city": "London", "postcode": "N1 7GU"}}
```

| Expression | Result |
|------------|--------|
| `profile -> 'address'` | `'{"city": "London", "postcode": "N1 7GU"}'` |
| `profile -> 'address' -> 'city'` | `'"London"'` |
| `profile -> 'address' ->> 'city'` | `'London'` |
| `profile ->> 'address'` | `'{"city": "London", "postcode": "N1 7GU"}'` |
| `profile -> 'missing'` | `NULL` |

Only the **last** step should be `->>`. Using it earlier still returns the JSON text, but the
result is typed as a plain string, and chaining another key access onto it is not the
navigation you want.

### JSON Arrays

There is **no subscript into a JSON array**. Extracting one gives you its JSON text, and
neither `doc -> 'items' -> 0` nor `(doc -> 'items')[0]` works — the first is an operator type
error, the second is refused because subscripting a JSON value is ambiguous (it might hold an
array or a string, and which it is can differ per row).

Cast it to a real array first, then subscript that:

```sql
-- doc holds {"scores": [10, 20, 30]}
SELECT CAST(doc ->> 'scores' AS ARRAY<INTEGER>)     AS all_scores,   -- [10, 20, 30]
       CAST(doc ->> 'scores' AS ARRAY<INTEGER>)[0]  AS first_score   -- 10
  FROM records;
```

Once cast, everything on [Working with Arrays](adv-working-with-lists) applies —
`= ANY`, `@>`, `UNNEST`, negative indexing.

The reverse direction needs no cast: a column that is **already** an array of JSON strings
subscripts normally, and `->` works on the element.

```sql
SELECT events[0]  ->> 'type' AS first_event,
       events[-1] ->> 'type' AS last_event
  FROM records;
```

## Comparing

JSON values can be compared for equality against a JSON literal:

```sql
SELECT *
  FROM records
 WHERE config = '{"mode": "strict"}';
```

> Warning: This is **string** equality, not structural equality — the value *is* JSON text. The literal has to match the stored text exactly, so a difference in whitespace or key order silently returns no rows.

```sql
SELECT '{"mode":"strict"}' = '{"mode":"strict"}';    -- true
SELECT '{"mode":"strict"}' = '{"mode": "strict"}';   -- false (one extra space)
```

To compare a single field, extract it first: `config ->> 'mode' = 'strict'`.

## Limitations

- There is no native struct type — nested data is JSON text, and there is nothing to declare or cast to
- Key access requires the `->` or `->>` operators; square-bracket subscript (`doc['key']`) is for integer-indexed arrays, not JSON keys
- A JSON array cannot be subscripted in place — cast it to `ARRAY<type>` first, see [JSON Arrays](#json-arrays)
- `@?` requires a literal path — it is resolved when the query is planned, so a per-row path is not supported, see [Key Existence](#key-existence)
- `JSONB_OBJECT_KEYS` is projection-only; it cannot be filtered on
- JSON values are opaque to the query planner — predicates on JSON fields cannot use row-group pruning or bloom filters, so they are evaluated over every row that reaches the filter
