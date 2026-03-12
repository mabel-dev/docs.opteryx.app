---
title: SQL Functions — Opteryx Reference
description: Concise, categorized reference for SQL functions supported by Opteryx with examples and usage notes.
---

# Functions

The following functions are supported by Opteryx.  For details, see individual pages where available.

!!! function "`ABS(value)`"  
    Return the absolute value of `value`.

!!! function "`ALL(boolean_expr)`"  
    Check if all values in the group are true.

!!! function "`ANY(boolean_expr)`"  
    Check if any value in the group is true.

!!! function "`ANY_VALUE(expr)`"  
    Return any non-null value from the group.

!!! function "`APPROXIMATE_MEDIAN(number)`"  
    Calculate an approximate median of values.

!!! function "`ARRAY_AGG([DISTINCT] expr)`"  
    Aggregate values into an array.

!!! function "`ARRAY_CONTAINS(array, value)`"  
    Check if `array` contains `value` (returns boolean).

!!! function "`ARRAY_CONTAINS_ALL(array, values)`"  
    Check if `array` contains all values from the `values` array.

!!! function "`ARRAY_CONTAINS_ANY(array, values)`"  
    Check if `array` contains any value from the `values` array.

!!! function "`ASCII(string)`"  
    Return the ASCII code of the first character in `string`.

!!! function "`AVG([DISTINCT] number)`"  
    Calculate the average of values. Use AVG(DISTINCT number) for distinct values.

!!! function "`BASE64_DECODE(value)`"  
    Decode `value` from Base64.

!!! function "`BASE64_ENCODE(value)`"  
    Encode `value` as Base64.

!!! function "`CEILING(value)`"  
    Return the smallest integer value not less than `value`.

!!! function "`CEILING(value, scale)`"  
    Rounds up a numeric value to the specified scale

!!! function "`CHAR(value)`"  
    Return the character with the specified ASCII/Unicode code.

!!! function "`COALESCE(value1, value2, ...)`"  
    Return the first non-null value from the list.

!!! function "`CONCAT(string1, string2, ...)`"  
    Concatenate multiple strings together.

!!! function "`CONCAT_WS(separator, string1, string2, ...)`"  
    Concatenate multiple strings with a separator between them.

!!! function "`CONNECTION_ID()`"  
    Return the connection ID.

!!! function "`COSINE_SIMILARITY(vector1, vector2)`"  
    Calculate the cosine similarity between two vectors.

!!! function "`COUNT([DISTINCT] expr)`"  
    Count the number of non-null values. Use COUNT(DISTINCT expr) for distinct values.

!!! function "`COUNT(DISTINCT expr)`"  
    Count the number of distinct values.

!!! function "`CURRENT_DATE()`"  
    Return the current date.

!!! function "`CURRENT_TIME()`"  
    Return the current time.

!!! function "`CURRENT_TIMESTAMP()`"  
    Return the current timestamp (alias for NOW).

!!! function "`DATABASE()`"  
    Return the current database/schema.

!!! function "`DATEDIFF(unit, start_date, end_date)`"  
    Calculate the difference between two dates in specified units.

!!! function "`DATEPART(part, date)`"  
    Extract a part of a date (YEAR, MONTH, DAY, HOUR, MINUTE, SECOND, WEEK, QUARTER).

!!! function "`DATE_FORMAT(date, format)`"  
    Format a date or timestamp according to a format string.

!!! function "`DATE_TRUNC(unit, timestamp)`"  
    Truncate `timestamp` to the precision specified by `unit` (e.g. 'hour', 'day').

!!! function "`DAY(date)`"  
    Extract the day of month (1-31) from a date or timestamp.

!!! function "`E()`"  
    Return Euler's number (e).

!!! function "`EMBED(text)`"  
    Convert text into a numeric embedding vector using the configured embedding provider.

!!! function "`FLOOR(value)`"  
    Return the largest integer value not greater than `value`.

!!! function "`FROM_UNIXTIME(unix_timestamp)`"  
    Convert Unix timestamp to a datetime.

!!! function "`GET(json_or_array, key)`"  
    Get value from JSON object or array by key/index.

!!! function "`GREATEST(value1, value2, ...)`"  
    Return the greatest (maximum) value from the list.

!!! function "`HASH(value)`"  
    Return a hash of `value`.

!!! function "`HEX_DECODE(value)`"  
    Decode `value` from hexadecimal.

!!! function "`HEX_ENCODE(value)`"  
    Encode `value` as hexadecimal.

!!! function "`HISTOGRAM(number)`"  
    Generate a histogram distribution from values.

!!! function "`HOUR(timestamp)`"  
    Extract the hour (0-23) from a timestamp.

!!! function "`HUMANIZE(number)`"  
    Convert number to a human-readable format.

!!! function "`IFNOTNULL(value, result)`"  
    Return `result` if `value` is not null, otherwise null.

!!! function "`IFNULL(value, replacement)`"  
    Return `value` if not null, otherwise return `replacement`.

!!! function "`IIF(condition, true_value, false_value)`"  
    Return `true_value` if `condition` is true, otherwise return `false_value`.

!!! function "`INITCAP(string)`"  
    Convert string to initial capital (first letter capitalized, rest lowercase).

!!! function "`JSONB_OBJECT_KEYS(json_object)`"  
    Return an array of all keys in a JSON object.

!!! function "`LEAST(value1, value2, ...)`"  
    Return the least (minimum) value from the list.

!!! function "`LEFT(string, length)`"  
    Return the leftmost `length` characters from `string`.

!!! function "`LENGTH(string)`"  
    Return the length of the string in characters.

!!! function "`LEVENSHTEIN(string1, string2)`"  
    Return the Levenshtein distance (edit distance) between two strings.

!!! function "`LN(value)`"  
    Return the natural logarithm of `value`.

!!! function "`LOG(value, base)`"  
    Return the logarithm of `value` to the specified `base`.

!!! function "`LOG10(value)`"  
    Return the base-10 logarithm of `value`.

!!! function "`LOG2(value)`"  
    Return the base-2 logarithm of `value`.

!!! function "`LOWER(string)`"  
    Convert string to lowercase.

!!! function "`LPAD(string, length, [pad_string])`"  
    Pad the left side of `string` to `length` using `pad_string` (default space).

!!! function "`LTRIM(string)`"  
    Remove leading whitespace from `string`.

!!! function "`MAX(expr)`"  
    Return the maximum value.

!!! function "`MD5(value)`"  
    Return the MD5 hash of `value`.

!!! function "`MIN(expr)`"  
    Return the minimum value.

!!! function "`MINUTE(timestamp)`"  
    Extract the minute (0-59) from a timestamp.

!!! function "`MONTH(date)`"  
    Extract the month (1-12) from a date or timestamp.

!!! function "`NORMAL()`"  
    Generate a random value from a normal distribution.

!!! function "`NOW()`"  
    Return the current timestamp.

!!! function "`NULLIF(value1, value2)`"  
    Return null if `value1` equals `value2`, otherwise return `value1`.

!!! function "`PHI()`"  
    Return the golden ratio (phi).

!!! function "`PI()`"  
    Return the value of pi.

!!! function "`POSITION(substring IN string)`"  
    Return the position of `substring` in `string` (1-based, 0 if not found).

!!! function "`POWER(base, exponent)`"  
    Return `base` raised to the power of `exponent`.

!!! function "`PRODUCT(number)`"  
    Calculate the product of values.

!!! function "`QUARTER(date)`"  
    Extract the quarter (1-4) from a date or timestamp.

!!! function "`RAND()`"  
    Generate a random double between 0 and 1 (alias for RANDOM).

!!! function "`RANDOM()`"  
    Generate a random double between 0 and 1.

!!! function "`RANDOM_STRING(length)`"  
    Generate a random string of specified length.

!!! function "`REGEXP_REPLACE(string, pattern, replacement)`"  
    Replace matches of regex `pattern` with `replacement` in `string`.

!!! function "`REPLACE(string, search, replacement)`"  
    Replace all occurrences of `search` with `replacement` in `string`.

!!! function "`REVERSE(string)`"  
    Reverse the characters in `string`.

!!! function "`RIGHT(string, length)`"  
    Return the rightmost `length` characters from `string`.

!!! function "`ROUND(value, [scale])`"  
    Round `value` to `scale` decimal places. `scale` is optional and defaults to 0.

!!! function "`RPAD(string, length, [pad_string])`"  
    Pad the right side of `string` to `length` using `pad_string` (default space).

!!! function "`RTRIM(string)`"  
    Remove trailing whitespace from `string`.

!!! function "`SEARCH(text, pattern)`"  
    Search for a pattern in text (boolean result).

!!! function "`SECOND(timestamp)`"  
    Extract the second (0-59) from a timestamp.

!!! function "`SHA1(value)`"  
    Return the SHA1 hash of `value`.

!!! function "`SHA256(value)`"  
    Return the SHA256 hash of `value`.

!!! function "`SHA512(value)`"  
    Return the SHA512 hash of `value`.

!!! function "`SIGN(value)`"  
    Return the sign of `value` (-1, 0, or 1).

!!! function "`SORT(array)`"  
    Sort the elements in an array.

!!! function "`SOUNDEX(string)`"  
    Return the Soundex code of `string` for phonetic comparison.

!!! function "`SPLIT(string, delimiter)`"  
    Split `string` by `delimiter` and return an array of substrings.

!!! function "`SQRT(value)`"  
    Return the square root of `value`.

!!! function "`STDDEV(number)`"  
    Calculate the standard deviation of values.

!!! function "`SUBSTRING(string, start, [length])`"  
    Extract a substring from `string` starting at `start` position for `length` characters.

!!! function "`SUM([DISTINCT] number)`"  
    Calculate the sum of values. Use SUM(DISTINCT number) for distinct values.

!!! function "`TIMEDIFF(start_time, end_time)`"  
    Calculate the time difference between two timestamps.

!!! function "`TIME_BUCKET(interval, timestamp)`"  
    Bucket a timestamp into time intervals.

!!! function "`TITLE(string)`"  
    Convert string to title case (first letter of each word capitalized).

!!! function "`TODAY()`"  
    Return the current date (alias for CURRENT_DATE).

!!! function "`TRIM(string)`"  
    Remove leading and trailing whitespace from `string`.

!!! function "`TRUNC(value)`"  
    Truncate `value` to an integer (remove decimal part).

!!! function "`UNIXTIME([timestamp])`"  
    Convert a timestamp to Unix timestamp, or return current Unix timestamp if no argument.

!!! function "`UPPER(string)`"  
    Convert string to uppercase.

!!! function "`USER()`"  
    Return the current user.

!!! function "`UTC_TIMESTAMP()`"  
    Return the current UTC timestamp.

!!! function "`VARIANCE(number)`"  
    Calculate the variance of values.

!!! function "`VERSION()`"  
    Return the version of Opteryx.

!!! function "`WEEK(date)`"  
    Extract the ISO week number (1-53) from a date or timestamp.

!!! function "`YEAR(date)`"  
    Extract the year from a date or timestamp.

!!! function "`YESTERDAY()`"  
    Return yesterday's date.

