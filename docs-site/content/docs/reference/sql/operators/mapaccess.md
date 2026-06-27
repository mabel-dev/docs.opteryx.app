---
title: Subscript access — Opteryx Operator
description: Returns the element at the requested index from an array, string, or blob-like value. Symbol: []
---

# Subscript access

Subscript access operator.

Returns the element at the requested index from an array, string, or blob-like value.

**Category:** extraction

**SQL symbol:** `[]`

## Notes

Subcript access is zero-based, the first element is at index 0. For arrays the result type depends on the array element type, so the exported result type may be dynamic.
