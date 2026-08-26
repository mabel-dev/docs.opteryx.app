---
title: JSON path exists — Opteryx Operator
description: Returns true when the supplied JSON path expression matches within the left document. Symbol: @?
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# JSON path exists

Returns true when the supplied JSON path expression matches within the left document.

**Category:** comparison

**SQL symbol:** `@?`

## Syntax

```sql
<document> @? <path>
```

## Parameters

- **`<document>`** — The JSON document to test. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar), [`variant`](../types/variant).
- **`<path>`** — The path to look for. It is resolved to RFC 6901 tokens once, when the query is planned. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar). Must be a literal.

## Returns

[`boolean`](../types/boolean)

## Examples

```sql
SELECT '{"contact": {"email": "a@b.c"}}' @? '$.contact.email';
```

```
true
```

```sql
SELECT '{"a": null}' @? '$.a', '{"a": 1}' @? '$.b';
```

```
true | false
```

## Signatures

- `nvarchar @? nvarchar` → boolean
- `nvarchar @? varbinary` → boolean
- `nvarchar @? varchar` → boolean
- `varbinary @? nvarchar` → boolean
- `varbinary @? varbinary` → boolean
- `varbinary @? varchar` → boolean
- `varchar @? nvarchar` → boolean
- `varchar @? varbinary` → boolean
- `varchar @? varchar` → boolean
- `variant @? nvarchar` → boolean
- `variant @? varchar` → boolean

## Notes

The path must be a literal — it is resolved to RFC 6901 tokens once when the query is planned, using the same resolver `->` uses, so `doc @? 'city'`, `doc @? '$.contact.email'` and `doc @? '/contact/email'` all name the same thing. Existence is not extraction: a path whose value is JSON `null` is TRUE here, while `doc->'key' IS NOT NULL` is FALSE. A NULL document row is NULL; a row whose bytes are not valid JSON is an error, never a silent false.

## See Also

- [JSON extract `->`](arrow)
- [JSON extract text `->>`](longarrow)
- [NULL semantics](../advanced/adv-null-semantics)
