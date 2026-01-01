---
title: Time Travel Queries in Opteryx - Query Historical Data
description: Use Opteryx time travel feature to query data as it existed at specific points in time. Access historical snapshots and temporal data for analytics.
---

# Time Travel

Opteryx supports temporality, the ability to view things as they were at a different point in time.

For datasets which are snapshots, this allows you to recall the data of that snapshot as at a point in the past. For datasets which are logs, this allows you to prune queries to just the dates which contain relevant data.

!!! Note  
    - Data must be Mabel partitioned or using a custom partition schema which supports data partitioning.
    - Data returned for previous days will be the latest data as at today. For example if a backfill updates data from seven days ago, when querying that data today the backfilled data will be returned.
    - There is no implicit deduplication of records as they are returned.

Partition schemes that supports temporal queries allow you to view data from a different date by using a `FOR` clause after the dateset name in the SQL statement. `FOR` clauses state the date, or date range, a query should retrieve results for.
  
If no temporal clause is provided and the schema supports it, `FOR TODAY` is assumed.

!!! Warning     
    Temporal clauses operate on calendar days in UTC. For example, from midnight `FOR TODAY` will return no data until data is written for that day.

## Single Dates

Data from a specific, single, date can be obtained using the `FOR date` syntax. 

~~~
FOR date
~~~

Date values in `FOR` clauses must either be in 'YYYY-MM-DD [HH:MM]' format or a recognised date placeholder, for example.

- `FOR TODAY`
- `FOR YESTERDAY`
- `FOR '2022-02-14'`
- `FOR '2023-09-17 23:00'`

## Date Ranges

Data within a range of dates can be specified using `FOR DATES BETWEEN`, `FOR DATES SINCE` or `FOR DATES IN` syntax. Where data is retrieved for multiple dates, the datasets for each day have an implicit `UNION ALL` applied to them.

~~~
FOR DATES BETWEEN start AND end
~~~
~~~
FOR DATES SINCE start
~~~
~~~
FOR DATES IN range
~~~
~~~
FOR LAST count DAYS
~~~

`SINCE` clauses select a temporal range which spans from the provided start time until now.

Date values in `BETWEEN` and `SINCE` clauses must either be in 'YYYY-MM-DD [HH:MM]' format or a recognized date placeholder, for example:

- `FOR DATES BETWEEN '2000-01-01' AND TODAY`
- `FOR DATES BETWEEN '2020-04-01' AND '2020-04-30'`

Date range values in `IN` clauses must be recognized date range placeholders, for example:

- `FOR DATES IN LAST_MONTH`

## Placeholders

Our system supports a variety of placeholders for date and time conditions in queries. These placeholders allow you to dynamically reference specific time periods without specifying exact dates. Below is a table of available placeholders, their applicability, and descriptions:

Placeholder  | Applicability   | Description
------------ | --------------- | ------------
`TODAY`      | FOR, BETWEEN    | Refers to the current calendar day.
`YESTERDAY`  | FOR, BETWEEN    | Refers to the day immediately before the current calendar day.
DAY OF WEEK  | FOR, BETWEEN    | Represents the most recent past date of the specified day of the week (e.g., `MONDAY` refers to the most recent Monday).
`THIS_MONTH` | IN              | Covers the period starting from the first day of the current month up to the current date.
`LAST_MONTH` | IN              | Denotes the entire previous calendar month. PREVIOUS_MONTH can also be used as an alternative.

!!! caution  
    - `FOR` clauses cannot contain comments or reference column values or aliases  
    - The default partition scheme does not support Temporal queries  
    - Temporal clauses must follow the relation name they relate to, and they only apply to that relation.

## Time Travel

You can query dates or date ranges using a `FOR` clause in your query. For example to view the contents of partition

~~~sql
SELECT *
  FROM $planets
   FOR YESTERDAY;
~~~

This technique is well suited to viewing snapshotted datasets from a previoud point in time. 

The '$planets' sample dataset has special handling to respond to temporal queries; Uranus was discovered in 1846 and Pluto was discovered in 1930, we and use the `FOR` clause to query the '$planets' relation from before those planets were discovered like this:

~~~sql
SELECT name
  FROM $planets
   FOR '1846-01-01';
~~~

Returns:

~~~
name
-------
Mercury
Venus
Earth
Mars
Jupiter
Saturn
Neptune
~~~

## Accumulation

For datasets which are continually added to, such as logs, the `FOR` clause can be used to quickly filter ranges of records to search over. The `FOR` clause will most likely record the date the record was written (the 'SYSTEM_TIME' for the record) which may not be the same as the logical or effective date for a record, especially in situations where there is a lag in the records being recorded.

The `BETWEEN` keyword can be used to describe ranges of records, this is useful for querying logged data between two dates.

~~~sql
SELECT name
  FROM $planets
   FOR DATES BETWEEN '2021-01-01' and '2022-12-31';
~~~

## Temporal Self-Joins

Having multiple snapshots of the same table available in the same query creates oppurtunities for finding deltas. For example, to find which planets were not known about in 1600 which are known about today we can `LEFT ANTI JOIN` on the '$planets' dataset on those two dates like this:

~~~sql
 SELECT today.name
  FROM $planets FOR TODAY AS today
  LEFT ANTI JOIN $planets FOR '1600-01-01' AS sixteen
    ON sixteen.id = today.id
~~~

Returns:
~~~
today.name
-----------
Uranus
Neptune
Pluto
~~~