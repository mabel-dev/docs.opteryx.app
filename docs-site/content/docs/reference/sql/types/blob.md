---
title: BLOB — Opteryx Type
description: BLOB
---

# BLOB

**Canonical name:** BLOB

**Aliases:** byte_array, fixed_len_byte_array

**Accepted spellings:** blob, byte_array, fixed_len_byte_array

**Family:** binary

## Flags

- **numeric**: `False`
- **temporal**: `False`
- **collection**: `False`
- **parameterized**: `False`

## Ingestion Mappings

- **parquet_physical**: byte_array, fixed_len_byte_array
- **parquet_logical**: binary, byte_array, fixed_len_byte_array
- **jsonl**: bytes, null
