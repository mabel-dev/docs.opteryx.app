---
title: SQL Functions — Opteryx Reference
description: Concise list of SQL functions with links to detail pages.
---

# Functions

The following functions are supported by Opteryx.  Click a name for details.

## Array Functions

- [ARRAY_CONTAINS](functions/array_contains) — Test if array contains item.
- [ARRAY_CONTAINS_ALL](functions/array_contains_all) — Test if array contains all items from set.
- [ARRAY_CONTAINS_ANY](functions/array_contains_any) — Test if array contains any item from set.
- [GREATEST](functions/greatest) — Return maximum element of an array.
- [LEAST](functions/least) — Return minimum element of an array.
- [SORT](functions/sort) — Sort an array.

## Conversion Functions

- [HUMANIZE](functions/humanize) — Format number in human-readable form.

## Date & Time Functions

- [CURRENT_DATE](functions/current_date) — Current date (SQL-92).
- [CURRENT_TIME](functions/current_time) — Current time (SQL-92).
- [CURRENT_TIMESTAMP](functions/current_timestamp) — Current timestamp (SQL-92).
- [DATEDIFF](functions/datediff) — Difference between two dates in the specified unit.
- [DATE_FORMAT](functions/date_format) — Format date/timestamp as string.
- [EXTRACT](functions/extract) — Extract a part from a date/timestamp.
- [FROM_UNIXTIME](functions/from_unixtime) — Convert Unix timestamp to TIMESTAMP.
- [TIMEDIFF](functions/timediff) — Difference between two times.
- [TIME_BUCKET](functions/time_bucket) — Bucket date into fixed-width intervals.
- [UNIXTIME](functions/unixtime) — Convert TIMESTAMP to Unix epoch seconds.

## Hash & Encoding Functions

- [BASE64_DECODE](functions/base64_decode) — Base64 decode.
- [BASE64_ENCODE](functions/base64_encode) — Base64 encode.
- [BASE85_DECODE](functions/base85_decode) — Base85 decode.
- [BASE85_ENCODE](functions/base85_encode) — Base85 encode.
- [HASH](functions/hash) — Generic hash.
- [HEX_DECODE](functions/hex_decode) — Hex decode.
- [HEX_ENCODE](functions/hex_encode) — Hex encode.
- [MD5](functions/md5) — MD5 hash.
- [SHA1](functions/sha1) — SHA-1 hash.
- [SHA224](functions/sha224) — SHA-224 hash.
- [SHA256](functions/sha256) — SHA-256 hash.
- [SHA384](functions/sha384) — SHA-384 hash.
- [SHA512](functions/sha512) — SHA-512 hash.

## Numeric Functions

- [ABS](functions/abs) — Absolute value.
- [CEILING](functions/ceiling) — Round up to nearest integer.
- [E](functions/e) — Euler's number e.
- [FLOOR](functions/floor) — Round down to nearest integer.
- [LOG](functions/log) — Logarithm with arbitrary base.
- [PHI](functions/phi) — Golden ratio φ.
- [PI](functions/pi) — Mathematical constant π.
- [POWER](functions/power) — Raise base to exponent (SQL-92).
- [ROUND](functions/round) — Round to nearest integer.
- [SIGN](functions/sign) — Sign of number (-1, 0, 1).
- [SQRT](functions/sqrt) — Square root.
- [TRUNC](functions/trunc) — Truncate a numeric or temporal value.

## String Functions

- [ASCII](functions/ascii) — Return ASCII codepoint of first character.
- [CHAR](functions/char) — Convert codepoint to character.
- [CONCAT](functions/concat) — Concatenate strings.
- [CONCAT_WS](functions/concat_ws) — Concatenate with separator.
- [INITCAP](functions/initcap) — Capitalise first letter of each word.
- [LEFT](functions/left) — Return leftmost N characters.
- [LENGTH](functions/length) — Return length of string.
- [LEVENSHTEIN](functions/levenshtein) — Levenshtein edit distance between two strings.
- [LOWER](functions/lower) — Convert string to lowercase.
- [LPAD](functions/lpad) — Left-pad string to width.
- [LTRIM](functions/ltrim) — Trim leading characters.
- [MATCH](functions/match) — Full-text match.
- [POSITION](functions/position) — Find position of substring.
- [REGEXP_REPLACE](functions/regexp_replace) — Replace regex matches.
- [REPLACE](functions/replace) — Replace occurrences of substring.
- [REVERSE](functions/reverse) — Reverse a string.
- [RIGHT](functions/right) — Return rightmost N characters.
- [RPAD](functions/rpad) — Right-pad string to width.
- [RTRIM](functions/rtrim) — Trim trailing characters.
- [SOUNDEX](functions/soundex) — Return Soundex phonetic code.
- [SPLIT](functions/split) — Split string into array.
- [SUBSTRING](functions/substring) — Extract substring.
- [TRIM](functions/trim) — Trim leading and trailing characters.
- [UPPER](functions/upper) — Convert string to uppercase.

## Struct/JSON Functions

- [JSONB_OBJECT_KEYS](functions/jsonb_object_keys) — Extract keys from JSON object.

## Utility Functions

- [COALESCE](functions/coalesce) — Return first non-null argument.
- [CONNECTION_ID](functions/connection_id) — Current connection identifier.
- [DATABASE](functions/database) — Current database name.
- [IFNOTNULL](functions/ifnotnull) — Return second argument if first is not null.
- [IFNULL](functions/ifnull) — Return value if not null, else default.
- [IIF](functions/iif) — Inline if: return second or third arg based on condition.
- [NORMAL](functions/normal) — Generate normally-distributed random numbers.
- [NULLIF](functions/nullif) — Return null if equal, else first value.
- [RANDOM](functions/random) — Generate random numbers.
- [RANDOM_STRING](functions/random_string) — Generate random strings.
- [USER](functions/user) — Current user name.
- [UTC_TIMESTAMP](functions/utc_timestamp) — Current UTC timestamp.
- [VERSION](functions/version) — Database version string.

## Vector / Embedding Functions

- [COSINE_DISTANCE](functions/cosine_distance) — Cosine distance between two vectors.
- [COSINE_SIMILARITY](functions/cosine_similarity) — Cosine similarity between two vectors.
- [EMBED](functions/embed) — Convert text to an embedding vector.
