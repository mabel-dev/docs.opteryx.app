---
title: SQL Introduction Tutorial - Learn SQL with Opteryx
description: Beginner-friendly SQL tutorial using Opteryx. Learn SELECT, WHERE, JOIN, and aggregate functions with sample data.
---

# SQL Introduction

> This tutorial is reworked from the [DuckDB](https://duckdb.org/docs/sql/introduction) tutorial.

## Overview

This page provides an overview of how to perform simple operations in SQL. This tutorial is only intended to give you an introduction and is not a complete SQL tutorial.

All queries use the internal sample NASA datasets and should work regardless of what data your installation and setup has access to.

## Concepts

[Opteryx](https://github.com/mabel-dev/opteryx) is a system for querying ad hoc data stored in files as [relations](https://en.wikipedia.org/wiki/Relation_(database)). A relation is a mathematical term for a data table.

Each relation is a named collection of rows, organized into columns, where each column should have a common datatype. 

As an ad hoc query engine, relations and their schemas do not need to be predefined; they are determined when the query is executed. This is one of the reasons Opteryx cannot be considered an RDBMS (relational database management system), even though it can be used to query data using SQL.

## Querying Relations

To retrieve data from a relation, you query it using a SQL `SELECT` statement. Basic statements consist of three parts: the list of columns to be returned, the list of relations to retrieve data from, and optional clauses to shape and filter the returned data.

~~~sql
SELECT *
  FROM $planets;
~~~

The `*` is shorthand for "all columns". By convention, keywords are capitalized, and `;` optionally terminates the query.

~~~sql
SELECT id,
       name
  FROM $planets
 WHERE name = 'Earth';
~~~

The output of the above query should be 

~~~
 id	|  name
----+-------
  3	| Earth
~~~

You can write functions, not just simple column references, in the select list. For example, you can write:

~~~sql
SELECT id, 
       UPPER(name) AS uppercase_name
  FROM $planets
 WHERE id = 3;
~~~

This should give:

~~~
 id	| uppercase_name
----+----------------
  3	| EARTH
~~~

Notice how the `AS` clause is used to relabel the output column. (The `AS` clause is optional.)

A query can be “qualified” by adding a `WHERE` clause that specifies which rows are wanted. The `WHERE` clause contains a Boolean (truth value) expression, and only rows for which the Boolean expression is true are returned. The usual Boolean operators (`AND`, `OR`, and `NOT`) are allowed in the qualification. 

The `SELECT` clause can be thought of as choosing which columns we want from the relation, and the `WHERE` clause as choosing which rows we want from the relation.

![WHERE and SELECT](select-project.svg)

For example, the following query returns planets with fewer than 10 moons and a day longer than 24 hours:

~~~sql
SELECT *
  FROM $planets
 WHERE lengthOfDay > 24
   AND numberOfMoons < 10;
~~~

Result:

~~~
name  	| lengthOfDay | numberOfMoons
--------+-------------+---------------
Mercury	|      4222.6 |             0
Venus  	|        2802 |             0
Mars   	|        24.7 |             2
Pluto  	|       153.3 |             5
~~~

The order of results is not guaranteed and should not be relied upon. If you request the results of the query below, you might get Mercury or Venus in either order. 

!!! note
    The same query, on the same data in the same version of the query engine, will likely return results in the same order. Don't expect to test result order non-determinism by rerunning the query millions of times and looking for differences. These differences may manifest across different versions, or from subtle differences in the query statement or data.

~~~sql
SELECT name,
       numberOfMoons
  FROM $planets
 WHERE numberOfMoons = 0;
~~~

Result:

~~~
name  	| lengthOfDay | numberOfMoons
--------+-------------+---------------
Mercury	|      4222.6 |             0
Venus   |        2802 |             0
~~~