---
title: vector — Opteryx Type
description: VECTOR
---

# vector

**Canonical name:** VECTOR

**Accepted spellings:** vector

**Family:** vector

## Flags

- **numeric**: `False`
- **temporal**: `False`
- **collection**: `True`
- **parameterized**: `False`

## Notes

Fixed-length numeric vector. Length can be specified as `VECTOR[<size>]`.

Used as input and output for vector similarity functions such as `COSINE_SIMILARITY` and `COSINE_DISTANCE`, and for the `EMBED` function which produces vector embeddings from text.
