---
title: VARIANT — Opteryx Type
description: VARIANT
---

# VARIANT

A semi-structured type for heterogeneous or schema-on-read data. VARIANT values are typically produced by reading JSON columns. Use the `->` operator to extract a field as NVARCHAR, or `->>` to extract as plain text.

## Comparisons

This type does not support direct comparisons with `=`, `<`, or `>`. Extract or cast values first.

## Notes

VARIANT is produced automatically when reading JSON/NVARCHAR columns that contain structured data. Use `->` and `->>` operators to navigate the structure.

## Limitations

- You cannot CAST any value to VARIANT — it is read-only at the SQL level.
- VARIANT values cannot be compared with = or <. Extract a field first.
- VARIANT columns cannot be used in GROUP BY, ORDER BY, or JOIN conditions directly — extract and cast first.
