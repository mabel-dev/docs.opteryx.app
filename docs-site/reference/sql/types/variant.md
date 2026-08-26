---
title: VARIANT — Opteryx Type
description: VARIANT
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# VARIANT

A semi-structured type produced exclusively by the `->` operator when extracting a JSON field from a VARCHAR/NVARCHAR/VARBINARY column. Use `->` to extract a field as VARIANT (a JSON value), or `->>` to extract the same field as NVARCHAR (JSON strings unquoted to plain text).

## Example

```sql
SELECT '{"a": 1}' -> 'a';
```

## Comparisons

This type does not support direct comparisons with `=`, `<`, or `>`. Extract or cast values first.

## Notes

VARIANT is NOT produced by reading JSON files/columns directly — file connectors map JSON object/struct columns to NVARCHAR. VARIANT only appears as the result of the `->` operator; there is no PARSE_JSON()/TO_VARIANT() function.

## Limitations

- You cannot CAST any value to VARIANT — it is read-only at the SQL level.
- VARIANT values cannot be compared with = or <. Extract a field first.
- VARIANT columns cannot be used in GROUP BY, ORDER BY, or JOIN conditions directly — extract and cast first.

## See Also

- [Working with structs](../advanced/adv-working-with-structs) — worked examples.
