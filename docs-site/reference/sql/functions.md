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

... (truncated)
