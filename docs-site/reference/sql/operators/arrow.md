---
title: JSON extract — Opteryx Operator
description: Returns the selected JSON value from a document or JSON-like value. Symbol: ->
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# JSON extract

Returns the selected JSON value from a document or JSON-like value.

**Category:** extraction

**SQL symbol:** `->`

## Syntax

```sql
<document> -> <path>
```

## Parameters

- **`<document>`** — The JSON document to read from. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar), [`variant`](../types/variant).
- **`<path>`** — The key or path to select. A bare key (`'city'`), a JSONPath (`'$.contact.email'`) and an RFC 6901 pointer (`'/contact/email'`) all name the same thing. A path that is not present gives NULL, not an error. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).

## Returns

[`variant`](../types/variant)

## Examples

```sql
SELECT '{"name": "Earth", "moons": 1}' -> 'name';
```

```
"Earth"
```

```sql
SELECT '{"a": 1}' -> 'missing';
```

```
NULL
```

## Signatures

- `nvarchar -> nvarchar` → variant
- `nvarchar -> varbinary` → variant
- `nvarchar -> varchar` → variant
- `varbinary -> nvarchar` → variant
- `varbinary -> varbinary` → variant
- `varbinary -> varchar` → variant
- `varchar -> nvarchar` → variant
- `varchar -> varbinary` → variant
- `varchar -> varchar` → variant
- `variant -> nvarchar` → variant
- `variant -> varchar` → variant

## Notes

`->` keeps the value as JSON, so a selected string arrives still quoted (`"Earth"`); `->>` is the form that gives the text itself (`Earth`). That is the difference between the two, and the usual cause of a comparison against a string literal not matching. The result type is dynamic because the selected JSON value may be scalar, object, array, or null.

## See Also

- [JSON extract text `->>`](longarrow)
- [JSON path exists `@?`](atquestion)
- [Subscript access `[]`](mapaccess)
