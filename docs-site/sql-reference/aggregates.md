---
title: SQL Aggregate Functions - Opteryx Reference
description: Complete guide to SQL aggregate functions in Opteryx. Learn how to use COUNT, SUM, AVG, MIN, MAX, and other aggregation functions.
---

# Aggregates

Aggregates are functions that combine multiple rows into a single value. Aggregates can only be used in the `SELECT` and `HAVING` clauses of a SQL query.

When an `ORDER BY` clause is provided within an aggregate function, the input values are sorted before being aggregated. 

Aggregate functions generally ignore `null` values when performing calculations.

Definitions noted with a :octicons-square-16: are only supported in statements that include a `GROUP BY` clause.

New aggregates for this version are annotated with the :octicons-star-16: icon.

## General Functions

!!! function "`ANY_VALUE` (**column**) → _any_"  
    Select an arbitrary single value from **column** within the grouping. The specific value returned is not guaranteed.  

!!! function "`APPROXIMATE_MEDIAN` (**column**: _numeric_) → _numeric_"  
    Calculate an approximate median of **column** using the T-Digest algorithm. This is faster than computing the exact median for large datasets.

!!! function "`ARRAY_AGG` ([ DISTINCT ] **column** [ LIMIT **n** ]) → _array_ :octicons-square-16:"   
    Collect all values of **column** within the group into an array.   
    The **DISTINCT** modifier optionally filters the array to contain only unique values.   
    The **LIMIT** clause restricts the array to a maximum of **n** items.     

!!! function "`AVG` (**column**: _numeric_) → _numeric_"  
    Calculate the arithmetic mean (average) of values in **column**.   

!!! function "`COUNT` (*) → _numeric_"  
    Count the total number of rows.

!!! function "`COUNT` ([ DISTINCT ] **column**) → _numeric_"  
    Count the number of non-`null` values in **column**.   
    The **DISTINCT** modifier counts only unique values. Note that when using **DISTINCT**, `null` values are included in the count if present.  

!!! function "`COUNT_DISTINCT` (**column**) → _numeric_"  
    Count the number of distinct (unique) values in **column**.    
    Alias of `COUNT(DISTINCT column)`

!!! function ":octicons-beaker-24: `HISTOGRAM` (**column**) → _struct_"    
    Generate a histogram showing the frequency distribution of values in **column**.

!!! function "`MAX` (**column**) → _any_"  
    The maximum value in **column**.  

!!! function "`MIN` (**column**) → _any_"  
    The minimum value in **column**.  

!!! function "`MIN_MAX` (**column**) → _struct_"  
    Return both the minimum and maximum values in **column** as a struct.  

!!! function "`ONE` (**column**) → _any_"  
    Alias for `ANY_VALUE`.  

!!! function "`PRODUCT` (**column**: _numeric_) → _numeric_"  
    Calculate the product (multiplication) of all values in **column**.  

!!! function "`STDDEV` (**column**: _numeric_) → _numeric_"  
    Calculate the standard deviation of values in **column**.  

!!! function "`SUM` (**column**: _numeric_) → _numeric_"  
    Calculate the sum (total) of all values in **column**.  

!!! function "`VARIANCE` (**column**: _numeric_) → _numeric_"  
    Calculate the variance of values in **column**.  

