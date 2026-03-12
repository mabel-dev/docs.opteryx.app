---
title: SQL Functions — Opteryx Reference
description: Concise, categorized reference for SQL functions supported by Opteryx with examples and usage notes.
---

# Functions

The following functions are supported by Opteryx.  For details, see individual pages where available.

!!! function "`ABS(num)`"  
    Returns absolute value of input number.

!!! function "`ARRAY(expr, type_name)`"  
    Constructs an array of the specified element type.

!!! function "`ARRAY_CONTAINS(arr, item)`"  
    Test if array contains item.

!!! function "`ARRAY_CONTAINS_ALL(arr, items)`"  
    Test if array contains all items from set.

!!! function "`ARRAY_CONTAINS_ANY(arr, items)`"  
    Test if array contains any item from set.

!!! function "`ASCII(str)`"  
    Return ASCII codepoint of first character.

!!! function "`BASE64_DECODE(blob)`"  
    Base64 decode.

!!! function "`BASE64_ENCODE(blob)`"  
    Base64 encode.

!!! function "`BASE85_DECODE(blob)`"  
    Base85 decode.

!!! function "`BASE85_ENCODE(blob)`"  
    Base85 encode.

!!! function "`CASE(arg0, [args...])`"  
    Returns a value based on conditional expressions.

!!! function "`CEILING(num, [scale...])`"  
    Returns smallest integer greater than or equal to input.

!!! function "`CHAR(val)`"  
    Convert codepoint to character.

!!! function "`COALESCE(arg0, [args...])`"  
    Returns the first non-null value from the list of arguments.

!!! function "`CONCAT(str1, [more...])`"  
    Returns concatenation of all input strings.

!!! function "`CONCAT_WS(sep, str1, [more...])`"  
    Concatenate with separator.

!!! function "`CONNECTION_ID()`"  
    Current connection identifier.

!!! function "`COSINE_DISTANCE(arr, vec)`"  
    Cosine distance over numeric vectors or lexical text inputs.

!!! function "`COSINE_DISTANCE(arr, vec)`"  
    Cosine distance over numeric vectors or lexical text inputs.

!!! function "`COSINE_SIMILARITY(arr, vec)`"  
    Cosine similarity over numeric vectors or lexical text inputs.

!!! function "`COSINE_SIMILARITY(arr, vec)`"  
    Cosine similarity over numeric vectors or lexical text inputs.

!!! function "`CURRENT_DATE()`"  
    Current date (SQL-92).

!!! function "`CURRENT_TIME()`"  
    Current time (SQL-92).

!!! function "`CURRENT_TIMESTAMP()`"  
    Current timestamp (SQL-92).

!!! function "`DATABASE()`"  
    Current database name.

!!! function "`DATEDIFF(part, date, end)`"  
    Difference between two dates in the specified unit.

!!! function "`DATEPART(part, date)`"  
    Extracts a named part (year, month, day, epoch, etc.) from a date or timestamp.

!!! function "`DATETRUNC(part, date)`"  
    Truncate date/timestamp to specified granularity. Alias for `DATE_TRUNC`.

!!! function "`DATE_DIFF(part, date, end)`"  
    Difference between two dates in the specified unit. Alias for `DATEDIFF`.

!!! function "`DATE_FORMAT(date, pattern)`"  
    Format date/timestamp as string.

!!! function "`DATE_TRUNC(part, date)`"  
    Truncate date/timestamp to specified granularity.

!!! function "`E()`"  
    Euler's number e.

!!! function "`EMBED(text)`"  
    Embeds text using the configured engine embedding provider.

!!! function "`FLOOR(num, [scale...])`"  
    Returns largest integer less than or equal to input.

!!! function "`FROM_UNIXTIME(ts)`"  
    Convert Unix timestamp to TIMESTAMP.

!!! function "`GET_STRING(struct, key)`"  
    Extract string field from struct/map.

!!! function "`GREATEST(arr)`"  
    Returns the maximum element from an array column.

!!! function "`HASH(val)`"  
    Generic hash.

!!! function "`HEX_DECODE(blob)`"  
    Hex decode.

!!! function "`HEX_ENCODE(blob)`"  
    Hex encode.

!!! function "`HUMANIZE(val)`"  
    Format number in human-readable form.

!!! function "`IFNOTNULL(value, result)`"  
    Returns second argument if first argument is not null, otherwise null.

!!! function "`IFNULL(value, default)`"  
    Returns first argument if not null, otherwise returns second argument.

!!! function "`IIF(condition, true_value, false_value)`"  
    Returns second argument if condition is true, otherwise third argument.

!!! function "`INITCAP(str)`"  
    Capitalise first letter of each word.

!!! function "`JSONB_OBJECT_KEYS(json)`"  
    Extract keys from JSON object.

!!! function "`LEAST(arr)`"  
    Returns the minimum element from an array column.

!!! function "`LEFT(str, n)`"  
    Return leftmost N characters.

!!! function "`LENGTH(str)`"  
    Returns the number of characters in the input string.

!!! function "`LEVENSHTEIN(a, b)`"  
    Levenshtein edit distance between two strings.

!!! function "`LN(num)`"  
    Natural logarithm.

!!! function "`LOG(num, base)`"  
    Logarithm with arbitrary base.

!!! function "`LOG10(num)`"  
    Base-10 logarithm.

!!! function "`LOG2(num)`"  
    Base-2 logarithm.

!!! function "`LOWER(str)`"  
    Returns input string with all characters in lowercase.

!!! function "`LPAD(str, width, [fill])`"  
    Left-pad string to width.

!!! function "`LTRIM(str, [chars])`"  
    Trim leading characters.

!!! function "`MD5(val)`"  
    MD5 hash.

!!! function "`NORMAL(n)`"  
    Generate normally-distributed random numbers.

!!! function "`NULLIF(value, compare)`"  
    Returns null if arguments are equal, otherwise returns first argument.

!!! function "`PASSTHRU(value)`"  
    Returns the input value unchanged. Used for testing and compatibility.

!!! function "`PHI()`"  
    Golden ratio φ.

!!! function "`PI()`"  
    Mathematical constant π.

!!! function "`POSITION(needle, haystack)`"  
    Find position of substring.

!!! function "`POWER(num, exp)`"  
    Raise base to exponent (SQL-92).

!!! function "`RANDOM(n)`"  
    Generate random numbers.

!!! function "`RANDOM_STRING(n)`"  
    Generate random strings.

!!! function "`REGEXP_REPLACE(str, pattern, replacement)`"  
    Replace regex matches.

!!! function "`REPLACE(str, search, replacement)`"  
    Replace occurrences of substring.

!!! function "`REVERSE(str)`"  
    Reverse a string.

!!! function "`RIGHT(str, n)`"  
    Return rightmost N characters.

!!! function "`ROUND(num, [precision...])`"  
    Rounds input number to nearest integer or specified decimal places.

!!! function "`RPAD(str, width, [fill])`"  
    Right-pad string to width.

!!! function "`RTRIM(str, [chars])`"  
    Trim trailing characters.

!!! function "`SHA1(val)`"  
    SHA-1 hash.

!!! function "`SHA224(val)`"  
    SHA-224 hash.

!!! function "`SHA256(val)`"  
    SHA-256 hash.

!!! function "`SHA384(val)`"  
    SHA-384 hash.

!!! function "`SHA512(val)`"  
    SHA-512 hash.

!!! function "`SIGN(num)`"  
    Sign of number (-1, 0, 1).

!!! function "`SORT(arr)`"  
    Returns a sorted version of an array column.

!!! function "`SOUNDEX(str)`"  
    Return Soundex phonetic code.

!!! function "`SPLIT(str, [delimiter], [limit])`"  
    Split string into array.

!!! function "`SQRT(num)`"  
    Returns square root of input number.

!!! function "`SUBSTRING(str, start)`"  
    Returns substring starting at position with optional length.

!!! function "`TIMEDIFF(time1, time2)`"  
    Difference between two times.

!!! function "`TIME_BUCKET(magnitude, units, date)`"  
    Bucket date into fixed-width intervals.

!!! function "`TIME_DIFF(time1, time2)`"  
    Difference between two times. Alias for `TIMEDIFF`.

!!! function "`TITLE(str)`"  
    Convert string to title case.

!!! function "`TITLECASE(str)`"  
    Convert string to title case. Alias for `TITLE`.

!!! function "`TO_UNIXTIME(date)`"  
    Convert TIMESTAMP to Unix epoch seconds. Alias for `UNIXTIME`.

!!! function "`TRIM(str, [chars])`"  
    Trim leading and trailing characters.

!!! function "`TRUNCATE(num, [scale...])`"  
    Truncate towards zero.

!!! function "`TRY_ARRAY(expr, type_name)`"  
    Like ARRAY but returns null on type conversion failure.

!!! function "`UNIXTIME(date)`"  
    Convert TIMESTAMP to Unix epoch seconds.

!!! function "`UPPER(str)`"  
    Returns input string with all characters in uppercase.

!!! function "`USER()`"  
    Current user name.

!!! function "`VERSION()`"  
    Database version string.
