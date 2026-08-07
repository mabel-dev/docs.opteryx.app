---
title: Working with Structs in Opteryx - SQL JSON Operations
description: Query and manipulate struct data types and JSON in Opteryx. Access nested data structures with SQL.
---

# Working with Structs

A struct is a collection of zero or more key-value pairs. Keys must be `VARCHAR`; values can be different types.

Structs are represented as JSON-formatted strings stored in `VARCHAR` or `NVARCHAR` columns. All struct operations work on any column containing valid JSON.

## Creating Structs

Structs are created as JSON-formatted string literals:

```sql
SELECT '{"name": "Alice", "age": 30}';
```

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

### Key Existence (`@?`)

Returns `TRUE` if the struct contains the specified key.

```sql
struct @? 'key'
```

Example:

```sql
SELECT *
  FROM records
 WHERE address @? 'postcode';
```

The `@?` operator also supports JSON Path expressions:

```sql
SELECT *
  FROM records
 WHERE address @? '$.contact.email';
```

### Nested Access

Chain `->` calls to navigate nested structures:

```sql
SELECT profile -> 'address' -> 'city'
  FROM records;
```

## Comparing

Structs can be compared for equality against a JSON literal:

```sql
SELECT *
  FROM records
 WHERE config = '{"mode": "strict"}';
```

> Warning: This is **string** equality, not structural equality — structs are stored as JSON text. The literal has to match the stored text exactly, so a difference in whitespace or key order silently returns no rows.

```sql
SELECT '{"mode":"strict"}' = '{"mode":"strict"}';    -- true
SELECT '{"mode":"strict"}' = '{"mode": "strict"}';   -- false (one extra space)
```

To compare a single field, extract it first: `config ->> 'mode' = 'strict'`.

## Limitations

- Key access requires the `->` or `->>` operators; square-bracket subscript (`struct['key']`) is for integer-indexed arrays, not struct fields
- Struct values are opaque to the query planner — predicates on struct fields cannot use row-group pruning or bloom filters
- Projection pushdown may remove struct columns as part of optimization; do not rely on specific optimizer behavior

> Be Aware: Some restrictions may be resolved by the query optimizer. For example, Projection Pushdown may remove struct columns you never read. However, you should not rely on the optimizer to take any particular action.
