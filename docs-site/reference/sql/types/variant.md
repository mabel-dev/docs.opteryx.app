---
title: VARIANT — Opteryx Type
description: VARIANT
---

# VARIANT

A semi-structured type produced exclusively by the `->` operator when extracting a JSON field from a VARCHAR/NVARCHAR/VARBINARY column. Use `->` to extract a field as VARIANT (a JSON value), or `->>` to extract the same field as NVARCHAR (JSON strings unquoted to plain text).

## Comparisons

This type does not support direct comparisons with `=`, `<`, or `>`. Extract or cast values first.

## Notes

VARIANT is NOT produced by reading JSON files/columns directly — file connectors map JSON object/struct columns to NVARCHAR. VARIANT only appears as the result of the `->` operator; there is no PARSE_JSON()/TO_VARIANT() function.

## Limitations

- You cannot CAST any value to VARIANT — it is read-only at the SQL level.
- VARIANT values cannot be compared with = or <. Extract a field first.
- VARIANT columns cannot be used in GROUP BY, ORDER BY, or JOIN conditions directly — extract and cast first.
