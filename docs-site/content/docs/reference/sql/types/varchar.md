---
title: VARCHAR — Opteryx Type
description: VARCHAR
---

# VARCHAR

Variable-length string.

## Example

```
hello
```

## Range

- **Min:** `0`

## Notes

By default, length is unbounded unless specified (e.g. VARCHAR[255]).

**Canonical name:** VARCHAR

**Aliases:** string, utf8

**Accepted spellings:** string, utf8, varchar

**Family:** text

## Flags

- **numeric**: `False`
- **temporal**: `False`
- **collection**: `False`
- **parameterized**: `False`

## Ingestion Mappings

- **parquet_logical**: string, utf8, varchar
