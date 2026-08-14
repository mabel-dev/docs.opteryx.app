---
title: JSON path exists — Opteryx Operator
description: Returns true when the supplied JSON path expression matches within the left document. Symbol: @?
---

# JSON path exists

Returns true when the supplied JSON path expression matches within the left document.

**Category:** comparison

**SQL symbol:** `@?`

## Notes

The path must be a literal — it is resolved to RFC 6901 tokens once when the query is planned, using the same resolver `->` uses, so `doc @? 'city'`, `doc @? '$.contact.email'` and `doc @? '/contact/email'` all name the same thing. Existence is not extraction: a path whose value is JSON `null` is TRUE here, while `doc->'key' IS NOT NULL` is FALSE. A NULL document row is NULL; a row whose bytes are not valid JSON is an error, never a silent false.
