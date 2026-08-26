---
title: Not like — Opteryx Operator
description: Returns true when the left string does not match the SQL LIKE pattern on the right. Symbol: NOT LIKE
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Not like

Returns true when the left string does not match the SQL LIKE pattern on the right.

**Category:** comparison

**SQL symbol:** `NOT LIKE`

## Syntax

```sql
<haystack> NOT LIKE <pattern>
```

## Parameters

- **`<haystack>`** — The value tested against the pattern. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).
- **`<pattern>`** — A SQL LIKE pattern: `%` matches any run of characters, `_` matches exactly one. The whole value must match for the row to be excluded. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).

## Returns

[`boolean`](../types/boolean)

## Examples

```sql
SELECT name FROM $planets WHERE name NOT LIKE 'Ma%' LIMIT 3;
```

```
Mercury
Venus
Earth
```

## Signatures

- `nvarchar NOT LIKE nvarchar` → boolean
- `nvarchar NOT LIKE varbinary` → boolean
- `nvarchar NOT LIKE varchar` → boolean
- `varbinary NOT LIKE nvarchar` → boolean
- `varbinary NOT LIKE varbinary` → boolean
- `varbinary NOT LIKE varchar` → boolean
- `varchar NOT LIKE nvarchar` → boolean
- `varchar NOT LIKE varbinary` → boolean
- `varchar NOT LIKE varchar` → boolean

## Notes

Case-sensitive, like `LIKE` itself. NOT ILIKE is the case-insensitive form.

## See Also

- [Like `LIKE`](like)
- [Not case-insensitive like `NOT ILIKE`](notilike)
- [NULL semantics](../advanced/adv-null-semantics)
