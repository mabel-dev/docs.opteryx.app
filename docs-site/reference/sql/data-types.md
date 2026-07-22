---
title: SQL Data Types — Opteryx Reference
description: Reference for SQL data types supported by Opteryx.
---

# Data Types

The following data types are supported by Opteryx.  Click a name for details.

## Numeric types

- [DECIMAL](types/decimal) — Exact fixed-point number with declared precision and scale: `DECIMAL(precision, scale)`. Precision is the total number of significant digits (1–38); scale is the number of digits after the decimal point (0–precision). For example, `DECIMAL(10, 2)` holds values up to 99999999.99.
- [FLOAT](types/float) — 64-bit IEEE 754 double-precision floating-point number. Write `FLOAT` or `DOUBLE` in SQL — they are equivalent.
- [INTEGER](types/integer) — Signed 64-bit integer. Write `INTEGER`, `INT`, or `BIGINT` in SQL — they are all equivalent.

## Temporal types

- [DATE](types/date) — A calendar date with no time component. Stored as the number of days since 1970-01-01.
- [TIME](types/time) — A time of day with no date component. Stored as microseconds since midnight (TIME64).
- [TIMESTAMP](types/timestamp) — A date and time value. The default scale is microseconds. Use `TIMESTAMP[s]`, `TIMESTAMP[ms]`, `TIMESTAMP[us]`, `TIMESTAMP[ns]`, or `TIMESTAMP[d]` to declare a specific scale — this matters when casting integer epoch columns.

## Interval types

- [INTERVAL](types/interval) — A duration or period of time. Written as `INTERVAL 'value' UNIT` where UNIT is one of `DAY`, `MONTH`, `YEAR`, `HOUR`, `MINUTE`, `SECOND`, or `MICROSECOND`.

## Text types

- [NVARCHAR](types/nvarchar) — A variable-length UTF-8 encoded text string. Use NVARCHAR for any text that may contain non-ASCII characters. JSON columns are stored as NVARCHAR.
- [VARCHAR](types/varchar) — A variable-length ASCII text string. Use VARCHAR for columns that contain only ASCII characters. For text with accented characters, emoji, or any non-ASCII content, use NVARCHAR instead.

## Binary types

- [VARBINARY](types/varbinary) — Raw binary data (arbitrary bytes). Use for hashes, encoded payloads, or any non-text binary content.

## Boolean types

- [BOOLEAN](types/boolean) — A logical TRUE or FALSE value.

## Collection types

- [ARRAY](types/array) — An ordered sequence of elements, all of the same type. Array columns appear when reading Parquet or JSONL files that contain repeated/array fields. The element type is declared as `ARRAY<type>` (e.g. `ARRAY<INTEGER>`, `ARRAY<VARCHAR>`).
- [VARIANT](types/variant) — A semi-structured type produced exclusively by the `->` operator when extracting a JSON field from a VARCHAR/NVARCHAR/VARBINARY column. Use `->` to extract a field as VARIANT (a JSON value), or `->>` to extract the same field as NVARCHAR (JSON strings unquoted to plain text).

## Vector types

- [VECTOR](types/vector) — A fixed-length vector of FP16 (half-precision) floating-point values. Used for similarity search and ML embedding workloads. Declared as `VECTOR(n)` where n is the number of dimensions.

## Null type

- [NULL](types/null) — The absence of a value. NULL is not a type you declare — it appears when a column has no value or an expression produces no result.
