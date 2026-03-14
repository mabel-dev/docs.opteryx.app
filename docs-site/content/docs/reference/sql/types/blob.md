---
title: BLOB — Opteryx Type
description: BLOB
---

# BLOB

Binary large object (bytes).

## Example

```
b'\x01\x02'
```

## Range

- **Min:** `0`

## Notes

By default, length is unbounded unless specified (e.g. BLOB[1024]).

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
