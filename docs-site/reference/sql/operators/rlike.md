---
title: Regex like — Opteryx Operator
description: Returns true when the left string matches the regular expression on the right. Symbol: RLIKE
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Regex like

Returns true when the left string matches the regular expression on the right.

**Category:** comparison

**SQL symbol:** `RLIKE`

## Syntax

```sql
<haystack> RLIKE <regex>
```

## Parameters

- **`<haystack>`** — The value tested against the expression. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).
- **`<regex>`** — The regular expression to match. Unlike LIKE, it matches anywhere in the value unless anchored with `^` and `$`. Accepts [`nvarchar`](../types/nvarchar), [`varbinary`](../types/varbinary), [`varchar`](../types/varchar).

## Returns

[`boolean`](../types/boolean)

## Examples

```sql
SELECT name FROM $planets WHERE name RLIKE '^M.*s$';
```

```
Mars
```

## Signatures

- `nvarchar RLIKE nvarchar` → boolean
- `nvarchar RLIKE varbinary` → boolean
- `nvarchar RLIKE varchar` → boolean
- `varbinary RLIKE nvarchar` → boolean
- `varbinary RLIKE varbinary` → boolean
- `varbinary RLIKE varchar` → boolean
- `varchar RLIKE nvarchar` → boolean
- `varchar RLIKE varbinary` → boolean
- `varchar RLIKE varchar` → boolean

## Notes

A regular expression is more expressive than a LIKE pattern and more expensive to run; prefer LIKE when a prefix or suffix match is all that is needed.

## See Also

- [Not regex like `NOT RLIKE`](notrlike)
- [Like `LIKE`](like)
- [NULL semantics](../advanced/adv-null-semantics)
