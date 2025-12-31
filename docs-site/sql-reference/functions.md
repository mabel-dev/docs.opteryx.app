---
title: SQL Functions and Operators - Opteryx Reference
description: Comprehensive guide to SQL functions and operators in Opteryx. String functions, date/time operations, mathematical functions, and more.
---

# Functions

This document describes the supported SQL functions and operators.

Generally functions will return `null` on `null` input, although note that this is not true in all circumstances, especially for null-aware functions like `COALESCE` and `IFNULL`.

Definitions noted with a :octicons-dot-16: accept different input arguments.

New functions for this version are annotated with the :octicons-star-16: icon.

## Conversion Functions

!!! function "`BOOLEAN` **any**: _any_ → _boolean_"  
    Cast **any** to a `BOOLEAN`, raises an error if cast is not possible. Note `BOOLEAN` does not require parenthesis, however any aliases do.      
    Alias for `CAST`(**any** AS BOOLEAN)   

!!! function "`BLOB` (**any**: _any_) → _varbinary_"    
    **Will be deprecated after version 0.29**  
    Cast **varchar** to **varbinary**, raises an error if cast is not possible.    
    Alias for `VARBINARY`(**any**)   
    _Note_: prefixing can also be used to define a literal binary string, `b'value'` is equivalent to `blob('value')`.  

!!! function "`CAST` (**any**: _any_ AS **type**) → _type_"  
    Cast **any** to **type**, raises an error if cast is not possible.   
    Also implemented as individual cast functions (`VARBINARY`, `BOOLEAN`, `INTEGER`, `FLOAT`, `VARCHAR`).

!!! function "`FLOAT` (**num**: _numeric_) → _numeric_"  
    Convert **num** to a floating point number.   
    Alias for `CAST`(**any** AS FLOAT)   

!!! function "`HUMANIZE` (**num**: _numeric_) → _varchar_"     
    :octicons-star-16: **New in 0.20** :octicons-beaker-24:    
    Convert large numbers to human-readable formats (e.g., 1000 becomes "1K", 1000000 becomes "1M").

!!! function "`INTEGER` (**num**: _numeric_) → _numeric_"  
    Convert **num** to an integer.   
    Alias for `CAST`(**any** AS INTEGER)  

!!! function "`SAFE_CAST` (**any**: _any_ AS **type**) → _type_"    
    Alias for `TRY_CAST`(**any** AS **type**)  

!!! function "`TIMESTAMP` **iso8601**: _varchar_ → _timestamp_"  
    Cast an [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) format string to a timestamp, raises an error if cast is not possible. Note `TIMESTAMP` does not require parenthesis, however any aliases do.    
    Alias for `CAST`(**iso8601** AS TIMESTAMP)   

!!! function "`TRY_CAST` (**any**: _any_ AS **type**) → _type_"  
    Cast **any** to **type**, if cast is not possible, returns `null`.   

!!! function "`VARBINARY` (_any_) → _varbinary_"  
    Cast **any** to a binary string, raises an error if cast is not possible.  
    Alias for `CAST`(**any** AS VARBINARY)

!!! function "`VARCHAR` (_any_) → _varchar_"  
    Cast **any** to a string, raises an error if cast is not possible.  
    Alias for `CAST`(**any** AS VARCHAR)

## Date & Time Functions

For more details, see [Working with Timestamps](../adv-working-with-timestamps/).

!!! function "`current_date` → _data_"  
    Return the current date, in UTC. Note `current_date` does not require parenthesis.  

!!! function "`current_time` → _time_"  
    Return the current time, in UTC. Note `current_time` does not require parenthesis.  

!!! function "`current_timestamp` → _timestamp_"  
    :octicons-star-16: **New in 0.24**    
    Return the current date and time, in UTC. Note `current_timestamp` does not require parenthesis.  

!!! function "`DATE` (**ts**: _timestamp_) → _timestamp_"  
    Extract the date portion from **ts**, removing any time information.   

!!! function "`DATE_FORMAT` (**ts**: _timestamp_, **format**: _varchar_) → _varchar_"  
    Format **ts** as a string according to the specified **format** string. Common format codes include `%Y` (year), `%m` (month), `%d` (day), `%H` (hour), `%M` (minute), `%S` (second).   

!!! function "`DATEPART`(**unit**: _varchar_, **ts**: _timestamp_) → _numeric_"  
    Alias of `EXTRACT`(**unit** FROM **ts**)

!!! function "`DATE_TRUNC` (**unit**: _varchar_, **ts**: _timestamp_) → _varchar_"  
    Truncate **ts** to the specified **unit** (e.g., 'day', 'month', 'year'), setting all less significant fields to their minimum values.  

!!! function "`DATEDIFF` (**unit**: _varchar_, **start**: _timestamp_, **end**: _timestamp_) → _numeric_"  
    Calculate the difference between **start** and **end** timestamps measured in the specified **unit** (e.g., 'day', 'hour', 'second').  

!!! function "`DAY` (_timestamp_) → _numeric_"  
    Extract the day of the month from a timestamp (value ranges from 1 to 31). See `EXTRACT`.

!!! function "`EXTRACT` (**unit** FROM _timestamp_) → _numeric_"       
    Extract **unit** of a timestamp.   
    - `NANOSECOND`  
    - `MICROSECOND`  
    - `MILLISECOND`  
    - `SECOND`  
    - `MINUTE`  
    - `HOUR`  
    - `DATE`  
    - `DAY`  
    - `DAYOFWEEK` / `DOW`  
    - `WEEK`  
    - `ISOWEEK`  
    - `MONTH`  
    - `QUARTER`  
    - `DAYOFYEAR` / `DOY`  
    - `YEAR`  
    - `ISOYEAR`  
    - `DECADE`  
    - `CENTURY`  
    - `EPOCH`   
    - `JULIAN`    

!!! function "`FROM_UNIXTIME` (**timestamp**: _numeric_) → _timestamp_"    
    Return a timestamp representation of an [Unix Timestamp](https://www.unixtimestamp.com/).    
    _Related:_ `UNIXTIME` 

!!! function "`NOW` () → _timestamp_"  
    Alias for `current_timestamp` 

!!! function "`TIME_BUCKET` (_timestamp_, **multiple**: _numeric_, **unit**: _varchar_) → _timestamp_"  
    Round timestamps down into fixed time interval buckets. For example, `TIME_BUCKET(timestamp, 5, 'minute')` groups timestamps into 5-minute buckets. The **unit** parameter is optional and defaults to `day` if not provided.

!!! function "`TODAY` () → _timestamp_"  
    Alias for `current_date`

!!! function "`HOUR` (**ts**: _timestamp_) → _numeric_"  
    Returns the hour of the day from **ts**. The value ranges from `0` to `23`.   
    If no **ts** provided, returns the current hour.      
    Alias for `EXTRACT`(hour FROM **ts**)

!!! function "`MINUTE` (**ts**: _timestamp_) → _numeric_"  
    Returns the minute of the hour from **ts**. The value ranges from `0` to `59`.  
    If no **ts** provided, returns the current minute.   
    Alias for `EXTRACT`(minute FROM **ts**)

!!! function "`MONTH` (**ts**: _timestamp_) → _numeric_"  
    Returns the month of the year from **ts**. The value ranges from `1` to `12`.  
    If no **ts** provided, returns the current month.   
    Alias for `EXTRACT`(month FROM **ts**)

!!! function "`QUARTER` (**ts**: _timestamp_) → _numeric_"  
    Returns the quarter of the year from **ts**. The value ranges from `1` to `4`.  
    Alias for `EXTRACT`(quarter FROM **ts**)

!!! function "`SECOND` (**ts**: _timestamp_) → _numeric_"  
    Returns the second of the minute from **ts**. The value ranges from `0` to `59`.  
    If no **ts** provided, returns the current second.   
    Alias for `EXTRACT`(second FROM **ts**)

!!! function "`TIMEDIFF` (**unit**: _varchar_, **start**: _timestamp_) → _numeric_"   
    Calculate the difference between **start** and the current time, measured in the specified **unit**.  

!!! function "`UNIXTIME` () → _numeric_:octicons-dot-16:"       
    Return the current time as a [Unix Timestamp](https://www.unixtimestamp.com/).    
    _Related:_ `FROM_UNIXTIME`, `current_time` 

!!! function "`UNIXTIME` (**timestamp**: _timestamp_) → _numeric_:octicons-dot-16:"    
    Return **timestamp** in [Unix Timestamp](https://www.unixtimestamp.com/) representation.    
    _Related:_ `FROM_UNIXTIME` 

!!! function "`UTC_TIMESTAMP` () → _timestamp_"   
    Alias for `current_time`

!!! function "`WEEK` (**ts**: _timestamp_) → _numeric_"  
    Returns the week of the year from **ts**. The value ranges from `1` to `53`.  
    Alias for `EXTRACT`(week FROM **ts**)

!!! function "`YEAR` (**ts**: _timestamp_) → _numeric_"  
    Returns the year from **ts**.   
    If no **ts** provided, returns the current year.   
    Alias for `EXTRACT`(year FROM **ts**)

## Infix Functions / Operations

These are functions that are called similar to comparison operators:

!!! function "_numeric_ `+` _numeric_ → _numeric_"  
    Numeric addition

!!! function "_timestamp_ `+` _interval_ → _timestamp_"  
    Timestamp and Interval addition

!!! function "_numeric_ `-` _numeric_ → _numeric_"  
    Numeric subtraction

!!! function "_timestamp_ `-` _interval_ → _timestamp_"  
    Timestamp and Interval subtraction

!!! function "_timestamp_ `-` _timestamp_ → _interval_"  
    Timestamp subtraction

!!! function "_numeric_ `*` _numeric_ → _numeric_"  
    Numeric multiplication

!!! function "_numeric_ `/` _numeric_ → _numeric_"  
    Numeric division

!!! function "_numeric_ `DIV` _numeric_ → _integer_"   
    Integer division

!!! function "_numeric_ `%` _numeric_ → _numeric_"  
    Numeric modulo (remainder)

!!! function "_varchar_ `||` _varchar_ → _varchar_"  
    String concatenation  

!!! function "_inet_ `|` _inet_ → _bool_"   
    IP address containment

!!! function "_integer_ `|` _integer_ → _integer_"   
    Bitwise OR

!!! function "_integer_ `&` _integer_ → _integer_"  
    Bitwise AND

!!! function "_integer_ `^` _integer_ → _integer_"   
    Bitwise XOR

## Array Functions

For more details, see [Working with Arrays](../adv-working-with-lists/).

!!! function "**array**: _array_`[`**index**: _numeric_`]` → _value_:octicons-dot-16:"  
    Return the **index**th element from **array**. 

!!! function "**array**: _array_ `@>` **values**: _array_ → _boolean_"   
    Return `true` if **array** contains any of the elements in **values** (set overlap).   
    _Related:_ `ARRAY_CONTAINS_ANY`   

!!! function "**values**: _array_ `@>>` **array**: _array_ → _boolean_"   
    Return `true` if **array** contains all of the elements in **values**.   
    _Related:_ `ARRAY_CONTAINS_ALL`   

!!! function "`ARRAY_CONTAINS` (**array**: _array_, **value**) → _boolean_"  
    Return `true` if **array** contains **value**.  
    See also `SEARCH`(**array**, **value**)  
    See also `ANY`

!!! function "`ARRAY_CONTAINS_ANY` (**array**: _array_, **values**: _array_) → _boolean_"    
    Return `true` if **array** contains any of the elements in **values**.
    _Related:_ `@>`  

!!! function "`ARRAY_CONTAINS_ALL` (**array**: _array_, **values**: _array_) → _boolean_"   
    Return `true` if **array** contains all of elements in **values**.
    _Related:_ `@>>`  

!!! function "`GET` (**array**: _array_, **index**: _numeric_) → _value_:octicons-dot-16:" 
    **Will be deprecated after version 0.28**    
    Alias of **array**`[`**index**`]`  

!!! function "`GREATEST` (**array**: _array_) → _value_"   
    Return the greatest value in **array**.  
    _Related:_ `LEAST`

!!! function "`LEAST` (**array**: _array_) → _value_"   
    Return the smallest value in **array**.  
    _Related:_ `GREATEST`

!!! function "`LENGTH` (**array**: _array_) → _numeric_:octicons-dot-16:"   
    Returns the number of elements in **array**.

!!! function "`SEARCH` (**array**: _array_, **value**) → _boolean_:octicons-dot-16:"  
    **Will be deprecated after version 0.28**   
    Return `true` if **array** contains **value**. 

!!! function "`SORT` (**array**: _array_) → _array_"  
    Return **array** in ascending order. 

## Numeric Functions

!!! function "`ABS` (**x**: _numeric_) → _numeric_"  
    Returns the absolute value of **x**.   

!!! function "`CEIL` (**x**: _numeric_, **scale**: _integer_) → _double_"  
    Return the smallest integer greater than or equal to **x**, or when **scale** is provided, round up to **scale** decimal places.   
    _Related:_ `FLOOR`   

!!! function "`E` () → _numeric_"  
    Returns the constant _e_, also known as [_Euler's number_](https://en.wikipedia.org/wiki/E_(mathematical_constant)).  
    _Related:_ `LN`.

!!! function "`FLOOR` (**x**: _numeric_) → _numeric_"  
    Return the largest integer less than or equal to **x**, or when **scale** is provided, round down to **scale** decimal places.   
    _Related:_ `CEIL`    

!!! function "`PHI` () → _numeric_"  
    Returns the constant φ (_phi_), also known as [_the golden ratio_](https://en.wikipedia.org/wiki/Golden_ratio).  

!!! function "`PI` () → _numeric_"  
    Returns the constant [π](https://en.wikipedia.org/wiki/Pi) (_pi_).  

!!! function "`POWER` (**base**: _numeric_, **exponent**: _numeric_) → _numeric_"   
    Return **base** raised to the power of **exponent** (i.e., base^exponent).  

!!! function "`LN` (**x**: _numeric_) → _numeric_"   
    Return the natural logarithm of **x** (logarithm to the base e).  
    _Related:_ `E`, `LOG`, `LOG10`, `LOG2`

!!! function "`LOG` (**x**: _numeric_, **base**: _numeric_) → _numeric_"   
    Return the logarithm of **x** using **base** as the logarithm base.   
    _Related:_ `LN`, `LOG10`, `LOG2`

!!! function "`LOG10` (**x**: _numeric_) → _numeric_"   
    Return the base-10 logarithm of **x**.  
    _Related:_ `LN`, `LOG`, `LOG2`

!!! function "`LOG2` (**x**: _numeric_) → _numeric_"   
    Return the base-2 logarithm of **x**.  
    _Related:_ `LN`, `LOG`, `LOG10`

!!! function "`ROUND` (**x**: _numeric_) → _numeric_:octicons-dot-16:"  
    Returns **x** rounded to the nearest integer. 

!!! function "`ROUND` (**x**: _numeric_, **places**: _numeric_) → _numeric_:octicons-dot-16:"  
    Returns **x** rounded to **places** decimal places.

!!! function "`SIGN` (**x**: _numeric_) → _numeric_"   
    Return the sign of **x**: returns 0 if **x** is 0, -1 if **x** is negative, and 1 if **x** is positive.

!!! function "`SIGNUM` (**x**: _numeric_) → _numeric_"   
    Alias for `SIGN`

!!! function "`SQRT` (**x**: _numeric_) → _numeric_"   
    Return the square root of **x**.

!!! function "`TRUNC` (**x**: _numeric_) → _numeric_"  
    Return **x** truncated to an integer by removing digits after the decimal point.   

## String Functions

Functions for examining and manipulating string values. 

!!! function "**str**: _varchar_`[`**index**: _numeric_`]` → _varchar_:octicons-dot-16:"  
    Subscript operator, return the **index**th character from **str**. 

!!! function "`ASCII` (**string**: _char_) → _integer_"   
    Returns the ASCII code for a given character.  
    _Related:_ `CHAR`

!!! function "`CHAR` (**code**: _integer_) → _char_"   
    Returns the character for a given ASCII code.  
    _Related:_ `ASCII`

!!! function "`CONCAT` (**list**: _array_<_varchar_>) → _varchar_"   
    Concatenate all string values in **list** into a single string.  
    _Related:_ `CONCAT_WS`

!!! function "`CONCAT_WS` (**separator**: _varchar_, **list**: _array_<_varchar_>) → _varchar_"   
    Concatenate all string values in **list** into a single string, using **separator** to delimit each value.  
    _Related:_ `CONCAT`

!!! function "`ENDS_WITH` (**str**: _varchar_, **value**: _varchar_) → _boolean_"  
    Return `true` if **str** ends with **value**.  
    _Related:_ `STARTS_WITH`

!!! function "`GET` (**str**: _varchar_, **index**: _numeric_) → _varchar_:octicons-dot-16:"  
    **Will be deprecated after version 0.28**    
    Alias of **str**`[`**index**`]`   

!!! function "`INITCAP` (**str**: _varchar_) → _varchar_"   
    :octicons-star-16: **New in 0.26**   
    Capitalize the initial letter of each word in a string.  

!!! function "`LEFT` (**str**: _varchar_, **n**: _numeric_) → _varchar_"  
    Extract the left-most **n** characters of **str**.  
    _Related:_ `RIGHT`

!!! function "`LEN` (**str**: _varchar_) → _numeric_:octicons-dot-16:"   
    Alias of `LENGTH`

!!! function "`LENGTH` (**str**: _varchar_) → _numeric_:octicons-dot-16:"  
    Returns the length of **str** in characters.    

!!! function "`LEVENSHTEIN` (**str1**: _varchar_, **str2**: _varchar_) → _numeric_"   
    Calculate the [Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance) between **str1** and **str2**. This measures the minimum number of single-character edits required to change one string into the other.   

!!! function "`LOWER` (**str**: _varchar_) → _varchar_"  
    Converts **str** to lowercase.   
    _Related:_ `UPPER`, `TITLE`

!!! function "`LPAD` (**string**: _varchar_, **width**: _integer_, **fill**: _char_) → _varchar_"   
    Return a string that is at least **width** characters wide. If **string** is shorter than **width**, pad it on the left with **fill** characters to reach the required width.   
    _Related:_ `RPAD`

!!! function "`LTRIM` (**str**: _varchar_) → _varchar_"    
    Remove leading whitespace from **str**.   
    _Related:_ `RTRIM`, `TRIM`

!!! function "`MATCH` (**column**: _varchar_) `AGAINST` (**query**: _varchar_) → _boolean_"    
    Perform a full-text search of **column** for the values in **query**. This function is useful for searching text content.  
    _Note:_ Values in `$stop_words` are ignored.

!!! function "`POSITION` (**substring**: _varchar_ IN **string**: _varchar_) → _numeric_"    
    Return the starting position of the first occurrence of **substring** within **string**. Positions start at 1. If **substring** is not found, 0 is returned.   

!!! function "`REGEXP_REPLACE` (**str**: _varchar_, **pattern**: _varchar_, **replace**: _varchar_) → _varchar_"   
    Replace all occurrences of the regular expression **pattern** in **str** with **replace**.  

!!! function "`REPLACE` (**str**: _varchar_, **pattern**: _varchar_, **replace**: _varchar_) → _varchar_"   
    :octicons-star-16: **New in 0.26**   
    Replace all occurrences of **pattern** in **str** with **replace**.  

!!! function "`REVERSE` (**str**: _varchar_) → _varchar_"  
    Return **str** with its characters in reverse order.

!!! function "`RIGHT` (**str**: _varchar_, **n**: _numeric_) → _varchar_"  
    Extract the right-most **n** characters of **str**.   
    _Related:_ `LEFT`

!!! function "`RPAD` (**string**: _varchar_, **width**: _integer_, **fill**: _char_) → _varchar_"   
    Return a string that is at least **width** characters wide. If **string** is shorter than **width**, pad it on the right with **fill** characters to reach the required width.
    _Related:_ `LPAD`

!!! function "`RTRIM` (**str**: _varchar_) → _varchar_"     
    Remove trailing whitespace from **str**.   
    _Related:_ `LTRIM`, `TRIM`

!!! function "`SOUNDEX` (**str**: _varchar_) → _varchar_"  
    Return a character string containing the phonetic representation of **str**. This is useful for finding similar-sounding words. See [Soundex 🡕](https://en.wikipedia.org/wiki/Soundex).   

!!! function "`SEARCH` (**str**: _varchar_, **substring**: _varchar_) → _boolean_:octicons-dot-16:"  
    **Will be deprecated after version 0.28**    
    Return `true` if **str** contains **substring**.  

!!! function "`SPLIT` (**str**: _varchar_) → _array_:octicons-dot-16:"   
    Splits **str** on commas (`,`) and returns an array.

!!! function "`SPLIT` (**str**: _varchar_, **delimiter**: _varchar_) → _array_:octicons-dot-16:"   
    Splits **str** on **delimiter** and returns an array.

!!! function "`SPLIT` (**str**: _varchar_, **delimiter**: _varchar_, **limit**: _integer_) → _array_:octicons-dot-16:"   
    Splits **str** on **delimiter** and returns an array of size at most **limit**. The last element in the array contains the remaining part of the string. **limit** must be greater than zero.

!!! function "`SUBSTRING` (**str**: _varchar_, **start**: _numeric_) → _varchar_:octicons-dot-16:" 
    Extract a substring from **str** starting at position **start** and continuing to the end of the string.  

!!! function "`SUBSTRING` (**str**: _varchar_, **start**: _numeric_, **length**: _numeric_) → _varchar_:octicons-dot-16:"  
    Extract a substring from **str** starting at position **start** for **length** characters.  
 
!!! function "`STARTS_WITH` (**str**: _varchar_, **value**: _varchar_) → _boolean_"  
    Return `true` if **str** starts with **value**.  
    _Related:_ `ENDS_WITH`

!!! function "`TITLE` (**str**: _varchar_) → _varchar_"  
    Return **str** with the first letter of each word capitalized.   
    _Related:_ `LOWER`, `UPPER`

!!! function "`TRIM` ( [ LEADING | TRAILING | BOTH ] [ **chars**: _varchar_ FROM ] **str**: _varchar_ ) → _varchar_"   
    Remove leading and/or trailing characters from **str**. If **chars** is not specified, whitespace is removed. Note that any character present in **chars** will be removed, regardless of order.  
    The **LEADING** modifier removes **chars** from the beginning of **str**.   
    The **TRAILING** modifier removes **chars** from the end of **str**.    
    The **BOTH** modifier removes **chars** from both the beginning and end of **str**. This is the default behavior if no modifier is specified.   
    _Related:_ `LTRIM`, `RTRIM`

!!! function "`UPPER` (**str**: _varchar_) → _varchar_"  
    Converts **str** to uppercase.   
    _Related:_ `LOWER`, `TITLE`

## Struct Functions

For more details, see [Working with Structs](../adv-working-with-structs/).

!!! function "_struct_ `->` _key_ → _value_ "    
    Return the value for **key** from **object**.   
    Struct values can be `VARCHAR` or `VARBINARY` formatted JSON strings.

!!! function "_struct_ `->>` _key_ → _varchar_ "   
    Return the value for **key** from **object**, non `null` values are cast to `VARCHAR`.   
    Struct values can be `VARCHAR` or `VARBINARY` formatted JSON strings.
    _Related:_ `->` operator

!!! function "_struct_ `@?` _key_ → _value_ "   
    Return true if _struct_ contains the key _key_.   
    Struct values can be `VARCHAR` or `VARBINARY` formatted JSON strings.  

!!! function "_struct_ `@?` _jsonpath_ → _value_"  
    :octicons-star-16: **New in 0.19**       
    Return true if _struct_ contains a value at _jsonpath_.   
    Struct values can be `VARCHAR` or `VARBINARY` formatted JSON strings. 

!!! function "**object**: _struct_`[`**key**: _varchar_`]` → _value_:octicons-dot-16:"  
    Subscript operator
    Alias of **object**`->`**key**  

!!! function "`GET` (**object**: _struct_, **key**: _varchar_) → _value_:octicons-dot-16:"  
    **Will be deprecated after version 0.28**    
    Alias of **object**`->`**key**    

!!! function "`JSONB_OBJECT_KEYS` (**object**: _struct_) → _array_:octicons-dot-16:"   
    Return an array of the keys in a struct value.   
    Struct values can be `STRUCT` values, or `VARCHAR` or `VARBINARY` formatted JSON strings.   

!!! function "`SEARCH` (**object**: _struct_, **value**: _varchar_) → _boolean_:octicons-dot-16:"  
    **Will be deprecated after version 0.28**    
    Return `true` if any of the values in **object** is **value**. Note `SEARCH` does not match struct keys.

## System Functions

!!! function "`VERSION` () → _varchar_"  
    Return the version of the query engine.

## Other Functions

!!! function "`BASE64_DECODE`  (**str**: _varchar_) → _varchar_"  
    Decode BASE64 encoded value, **str**. 
    _Related:_ `BASE64_ENCODE`

!!! function "`BASE64_ENCODE` (**str**: _varchar_) → _varchar_"  
    Encode **str** with BASE64 encoding.  
    _Related:_ `BASE64_DECODE`

!!! function "`BASE85_DECODE` (**str**: _varchar_) → _varchar_"  
    Decode BASE85 encoded value, **str**. 
    _Related:_ `BASE85_ENCODE`

!!! function "`BASE85_ENCODE` (**str**: _varchar_) → _varchar_"  
    Encode **str** with BASE85 encoding.  
    _Related:_ `BASE85_DECODE`

!!! function "`COALESCE` (**arg1**, **arg2**, ...) → _value_"  
    Return the first item from args which is not `null`.    
    _Related:_ `IFNULL`

!!! function "`COSINE_SIMILARITY`  (**str**: _varchar_, **value**: _varchar_) → _double_"     
    Calculate the cosine similarity between **str** and **value**. This measures the similarity of two text strings based on their content.   
    _Note:_ Values in `$stop_words` are ignored.

!!! function "`GENERATE_SERIES` (**start**: _numeric_, **stop**: _numeric_) → _array_<_numeric_>:octicons-dot-16:"   
    Generate an array of numbers from **start** to **stop** (inclusive) with a step of 1.

!!! function "`GENERATE_SERIES` (**start**: _numeric_, **stop**: _numeric_, **step**: _numeric_) → _array_<_numeric_>:octicons-dot-16:"  
    Generate an array of numbers from **start** to **stop** (inclusive) with an increment of **step**.

!!! function "`GENERATE_SERIES` (**start**: _timestamp_, **stop**: _timestamp_, _interval_) → _array_<_timestamp_>:octicons-dot-16:"    
    Generate an array of timestamps from **start** to **stop** (inclusive) with the specified _interval_.     

!!! function "`HASH` (**value**: _any_) → _varchar_"  
    Calculate the [CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) (64-bit) hash value of **value**.

!!! function "`HEX_DECODE` (**str**: _varchar_) → _varchar_"  
    Decode a hexadecimal (BASE16) encoded string **str**.    
    _Related:_ `HEX_ENCODE`

!!! function "`HEX_ENCODE` (**str**: _varchar_) → _varchar_"  
    Encode **str** using hexadecimal (BASE16) encoding.  
    _Related:_ `HEX_DECODE`

!!! function "`IIF` (**condition**, **true_value**, **false_value**) → _input type_"  
    Return **true_value** if **condition** evaluates to `True`, otherwise return **false_value**. This is a shorthand for a simple `CASE` expression.

!!! function "`IFNOTNULL` (**check_expression**: _any_, **replacement_value**: _any_) → _input type_"  
    :octicons-star-16: **New in 0.19**   
    Return **check_expression** if it is not `null`, otherwise return **replacement_value**.   
    _Related:_ `IFNULL`   

!!! function "`IFNULL` (**check_expression**: _any_, **replacement_value**: _any_) → _input type_"  
    Return **check_expression** if it is not `null`, otherwise return **replacement_value**.   
    _Related:_ `COALESCE`, `IFNOTNULL` 

!!! function "`NORMAL` () → _numeric_"  
    Generate a random number from a normal (Gaussian) distribution with mean 0.0 and standard deviation 1.0. A different value is generated for each row.

!!! function "`NULLIF` (**value1**: _any_, **value2**: _any_) → _input type_"  
    Return `null` if **value1** equals **value2**, otherwise return **value1**. This is useful for converting specific values to `null`.

!!! function "`MD5` (**str**: _varchar_) → _varchar_"  
    Calculate the MD5 hash of **str**.

!!! function "`RAND` () → _numeric_"  
    Generate a random number between 0 and 1. A different value is generated for each row.

!!! function "`RANDOM` () → _numeric_"  
    Alias of `RAND`

!!! function "`RANDOM_STRING` (**length**: _numeric_) → _varchar_"  
    Generate a random string of lowercase alphabetic characters with the specified **length**. A different value is generated for each row.

!!! function "`SHA1` (**str**: _varchar_) → _varchar_"  
    Calculate the SHA1 hash of **str**.  
    _Related:_ `SHA224`, `SHA256`, `SHA384`, `SHA512`

!!! function "`SHA224` (**str**: _varchar_) → _varchar_"  
    Calculate the SHA224 hash of **str**.  
    _Related:_ `SHA1`, `SHA256`, `SHA384`, `SHA512`

!!! function "`SHA256` (**str**: _varchar_) → _varchar_"  
    Calculate the SHA256 hash of **str**.  
    _Related:_ `SHA1`, `SHA224`, `SHA384`, `SHA512`

!!! function "`SHA384` (**str**: _varchar_) → _varchar_"  
    Calculate the SHA384 hash of **str**.  
    _Related:_ `SHA1`, `SHA224`, `SHA256`, `SHA512`

!!! function "`SHA512` (**str**: _varchar_) → _varchar_"  
    Calculate the SHA512 hash of **str**.  
    _Related:_ `SHA1`, `SHA224`, `SHA256`, `SHA384`

!!! function "`UNNEST` (**array**: _array_) → _relation_"  
    Convert an array into a virtual relation where each array element becomes a separate row.

