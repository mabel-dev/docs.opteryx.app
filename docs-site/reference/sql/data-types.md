---
title: SQL Data Types - Opteryx Reference Guide
description: Learn about SQL data types in Opteryx including VARCHAR, INTEGER, TIMESTAMP, ARRAY, and more. Understand type casting and coercion.
---

# Data Types

Opteryx supports a streamlined set of data types compared to full DBMS platforms, focusing on the types most commonly needed for analytical queries.

## Types

Name        | Description
----------- | --------------
`ARRAY`     | A list of items, all of the same type
`BOOLEAN`   | Logical boolean (True/False)
`VARBINARY` | Variable-length binary data (also `BLOB`)
`DOUBLE`    | Double-precision floating-point number
`INTEGER`   | Whole number (64-bit signed integer)
`DECIMAL` :octicons-star-16:  | Fixed-point number with specified precision and scale
`VARCHAR`   | Variable-length character string (text)
`DATE`      | Calendar date (year, month, day)
`TIME` :octicons-star-16: | Time of day (hour, minute, second)
`TIMESTAMP` | Combined date and time
`INTERVAL` :octicons-star-16: | Time duration (difference between two TIMESTAMP values)

!!! Note
    `BLOB` is being transitioned to `VARBINARY` and some parts of the system may expect one or the other type name during this transition.

!!! Note  
    Types marked with :octicons-star-16: (DECIMAL, TIME, and INTERVAL) have limited support and may not be fully implemented in all contexts.

## Casting

### Functions

Values can be cast to different types using the `CAST` function. The syntax is `CAST(value AS type)`. When a value cannot be converted to the target type, an error will be raised. To avoid errors, use `TRY_CAST` (or its alias `SAFE_CAST`) which returns `null` instead of raising an error when casting fails.

### Type Hints

**Intervals**

Intervals require definition using type hints. Use the `INTERVAL` keyword followed by a literal value and a time unit.

~~~
INTERVAL 'value' unit
~~~

Where unit can be 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', or 'SECOND'.

Example:
~~~sql
SELECT INTERVAL '1' YEAR
~~~

**Other Types**

`BOOLEAN`, `DOUBLE`, `INTEGER`, and `TIMESTAMP` also support type hint notation (e.g., `SELECT TIMESTAMP '2022-01-01';`) to perform casting.

`VARBINARY` supports the `b` prefix notation (e.g., `b'string'`) to create binary string literals.

### Type Annotations

Some types support type annotations using the form `<value>::<type>`. For example, `1::double` is equivalent to `1.0`.

### Byte Strings

The `b` prefix can be used to mark string literals as byte strings (BLOB type). For example, `b'abc'` is equivalent to `'abc'::VARBINARY`.

## Coercion

### Timestamps & Dates

Literal string values in quotes may be automatically interpreted as `TIMESTAMP` or `DATE` types when they match valid dates in [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format (e.g., `YYYY-MM-DD` or `YYYY-MM-DD HH:MM`). Values without a time component are coerced to `DATE`, while those with a time component become `TIMESTAMP`.

All `TIMESTAMP` values read from datasets are standardized to nanosecond precision internally.

The default precision for `TIMESTAMP` values is milliseconds. Values in other precisions may be converted internally to maintain consistency.

### Numbers

Hexadecimal literals can be provided using the `0x` prefix. For example, `0xc0ffee` is interpreted as the integer `12648430`.

Numeric literals may contain underscores (`_`) to improve readability of long numbers. For example, `1_000_000` is equivalent to `1000000`.

### Structs

`VARCHAR` and `VARBINARY` columns containing JSON-formatted strings support struct accessors and functions, allowing you to query nested data structures.
