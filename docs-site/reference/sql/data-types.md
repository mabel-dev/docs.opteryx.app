---
title: SQL Data Types — Opteryx Reference
description: Overview of SQL data types supported by Opteryx, casting rules, coercion, and examples.
---

# Data Types

Opteryx supports a compact set of data types optimized for analytical workflows on file-backed datasets. This page summarizes the most commonly used types, casting/coercion rules, and practical examples.

## Common types
- `INTEGER` — 64-bit signed integers
- `DOUBLE` / `FLOAT` — floating-point numbers
- `DECIMAL(precision, scale)` — fixed-point decimals (partial support)
- `VARCHAR` — variable-length strings
- `BOOLEAN` — true/false
- `DATE`, `TIME`, `TIMESTAMP` — date/time types (ISO-8601 parsing supported)
- `VARBINARY` / `BLOB` — binary data
- `ARRAY<type>` — fixed-type arrays
- `STRUCT` / JSON-like objects — nested data structures

> Note: `BLOB` is being transitioned to `VARBINARY` in some places; prefer `VARBINARY` in new content.

---

## Casting & coercion
- Use `CAST(value AS TYPE)` to convert types. `TRY_CAST` / `SAFE_CAST` return `NULL` on failure instead of raising an error.
- Literal type hints: `TIMESTAMP '2024-01-01'`, `INTERVAL '1' DAY` are supported.
- Numeric underscores (`1_000_000`) and hex (`0xc0ffee`) are parsed as numeric literals.

Example:
```sql
SELECT CAST('2024-01-01' AS TIMESTAMP), TRY_CAST('abc' AS INTEGER);
```

---

## Arrays, Structs, and JSON
- `ARRAY` supports homogeneous elements: `ARRAY[1,2,3]`.
- `ARRAY_AGG()` collects values into arrays during aggregation.
- JSON/struct accessors vary by source type — use `JSON_EXTRACT()` / `->` operator where available.

Example:
```sql
SELECT ARRAY_AGG(item_id) AS items FROM order_items WHERE order_id = 10;
```

---

## Nulls & precision
- `NULL` follows SQL semantics; most functions propagate `NULL` unless explicitly noted.
- `TIMESTAMP` precision may be normalized internally; prefer ISO-8601 literals for determinism.

---

## Where to go next
- See [Functions](/docs/reference/sql/functions) for casting helpers.
- See [Statements](/docs/reference/sql/statements) for example queries that demonstrate type usage.
- Advanced topics: time travel, decimals and interval limitations are documented in the `adv-*` pages.