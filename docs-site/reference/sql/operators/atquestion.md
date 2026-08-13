---
title: JSON path exists — Opteryx Operator
description: Returns true when the supplied JSON path expression matches within the left document. Symbol: @?
---

# JSON path exists

Returns true when the supplied JSON path expression matches within the left document.

**Category:** comparison

**SQL symbol:** `@?`

## Notes

NOT EXECUTABLE. The dialect parses `@?` and the binder types it (operator_map carries the VARCHAR/NVARCHAR/VARBINARY/VARIANT pairs), but the native engine has no kernel for it, in a filter or in a projection — both fail at lowering with "outside the c-native kernel set". Use `doc->'key' IS NOT NULL` instead.
