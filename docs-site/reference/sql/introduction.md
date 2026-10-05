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

<figure class="doc-figure">
<svg viewBox="0 0 680 192" width="100%" role="img" aria-labelledby="select-project-title select-project-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="select-project-title">WHERE chooses rows, SELECT chooses columns</title>
<desc id="select-project-desc">A table with columns A to E and four rows, where column A holds 1 to 4. WHERE A &lt; 3 picks the first two rows; SELECT C, D picks columns C and D. The four cells where those rows and columns meet are highlighted, and form the result: columns C and D, two rows.</desc>
<text x="228" y="16" text-anchor="middle" style="fill: var(--opteryx-teal); font-size: 12px; font-weight: 700; font-family: var(--font-mono);">SELECT C, D</text>
<path d="M192 30 V 24 H 264 V 30" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5;"/>
<text x="104" y="108" text-anchor="end" style="fill: var(--opteryx-teal); font-size: 12px; font-weight: 700; font-family: var(--font-mono);">WHERE A &lt; 3</text>
<path d="M116 78 H 110 V 130 H 116" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5;"/>
<rect x="120" y="52" width="36" height="26" style="fill: var(--panel-2); stroke: var(--border-2);"/>
<text x="138" y="69" text-anchor="middle" style="fill: var(--text-deep); font-weight: 700; font-family: var(--font-mono);">A</text>
<rect x="156" y="52" width="36" height="26" style="fill: var(--panel-2); stroke: var(--border-2);"/>
<text x="174" y="69" text-anchor="middle" style="fill: var(--text-deep); font-weight: 700; font-family: var(--font-mono);">B</text>
<rect x="192" y="52" width="36" height="26" style="fill: var(--panel-2); stroke: var(--border-2);"/>
<text x="210" y="69" text-anchor="middle" style="fill: var(--text-deep); font-weight: 700; font-family: var(--font-mono);">C</text>
<rect x="228" y="52" width="36" height="26" style="fill: var(--panel-2); stroke: var(--border-2);"/>
<text x="246" y="69" text-anchor="middle" style="fill: var(--text-deep); font-weight: 700; font-family: var(--font-mono);">D</text>
<rect x="264" y="52" width="36" height="26" style="fill: var(--panel-2); stroke: var(--border-2);"/>
<text x="282" y="69" text-anchor="middle" style="fill: var(--text-deep); font-weight: 700; font-family: var(--font-mono);">E</text>
<rect x="120" y="78" width="36" height="26" style="fill: var(--accent-soft); stroke: var(--border-2);"/>
<text x="138" y="95" text-anchor="middle" style="fill: var(--text); font-family: var(--font-mono);">1</text>
<rect x="156" y="78" width="36" height="26" style="fill: var(--accent-soft); stroke: var(--border-2);"/>
<rect x="192" y="78" width="36" height="26" style="fill: var(--opteryx-teal); stroke: var(--opteryx-teal);"/>
<rect x="228" y="78" width="36" height="26" style="fill: var(--opteryx-teal); stroke: var(--opteryx-teal);"/>
<rect x="264" y="78" width="36" height="26" style="fill: var(--accent-soft); stroke: var(--border-2);"/>
<rect x="120" y="104" width="36" height="26" style="fill: var(--accent-soft); stroke: var(--border-2);"/>
<text x="138" y="121" text-anchor="middle" style="fill: var(--text); font-family: var(--font-mono);">2</text>
<rect x="156" y="104" width="36" height="26" style="fill: var(--accent-soft); stroke: var(--border-2);"/>
<rect x="192" y="104" width="36" height="26" style="fill: var(--opteryx-teal); stroke: var(--opteryx-teal);"/>
<rect x="228" y="104" width="36" height="26" style="fill: var(--opteryx-teal); stroke: var(--opteryx-teal);"/>
<rect x="264" y="104" width="36" height="26" style="fill: var(--accent-soft); stroke: var(--border-2);"/>
<rect x="120" y="130" width="36" height="26" style="fill: var(--panel); stroke: var(--border-2);"/>
<text x="138" y="147" text-anchor="middle" style="fill: var(--text); font-family: var(--font-mono);">3</text>
<rect x="156" y="130" width="36" height="26" style="fill: var(--panel); stroke: var(--border-2);"/>
<rect x="192" y="130" width="36" height="26" style="fill: var(--accent-soft); stroke: var(--border-2);"/>
<rect x="228" y="130" width="36" height="26" style="fill: var(--accent-soft); stroke: var(--border-2);"/>
<rect x="264" y="130" width="36" height="26" style="fill: var(--panel); stroke: var(--border-2);"/>
<rect x="120" y="156" width="36" height="26" style="fill: var(--panel); stroke: var(--border-2);"/>
<text x="138" y="173" text-anchor="middle" style="fill: var(--text); font-family: var(--font-mono);">4</text>
<rect x="156" y="156" width="36" height="26" style="fill: var(--panel); stroke: var(--border-2);"/>
<rect x="192" y="156" width="36" height="26" style="fill: var(--accent-soft); stroke: var(--border-2);"/>
<rect x="228" y="156" width="36" height="26" style="fill: var(--accent-soft); stroke: var(--border-2);"/>
<rect x="264" y="156" width="36" height="26" style="fill: var(--panel); stroke: var(--border-2);"/>
<path d="M330 104 H 380" style="fill: none; stroke: var(--muted); stroke-width: 1.5;"/>
<polygon points="380,99 390,104 380,109" style="fill: var(--muted);"/>
<rect x="414" y="65" width="36" height="26" style="fill: var(--panel-2); stroke: var(--border-2);"/>
<text x="432" y="82" text-anchor="middle" style="fill: var(--text-deep); font-weight: 700; font-family: var(--font-mono);">C</text>
<rect x="414" y="91" width="36" height="26" style="fill: var(--opteryx-teal); stroke: var(--opteryx-teal);"/>
<rect x="414" y="117" width="36" height="26" style="fill: var(--opteryx-teal); stroke: var(--opteryx-teal);"/>
<rect x="450" y="65" width="36" height="26" style="fill: var(--panel-2); stroke: var(--border-2);"/>
<text x="468" y="82" text-anchor="middle" style="fill: var(--text-deep); font-weight: 700; font-family: var(--font-mono);">D</text>
<rect x="450" y="91" width="36" height="26" style="fill: var(--opteryx-teal); stroke: var(--opteryx-teal);"/>
<rect x="450" y="117" width="36" height="26" style="fill: var(--opteryx-teal); stroke: var(--opteryx-teal);"/>
<text x="414" y="57" style="fill: var(--muted); font-size: 12px;">result</text>
</svg>
</figure>

For example, the following query returns planets with fewer than 10 moons and a day longer than 24 hours:

~~~sql
SELECT name,
       lengthOfDay,
       numberOfMoons
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

> Be Aware: The same query, on the same data in the same version of the query engine, will likely return results in the same order. Don't expect to test result order non-determinism by rerunning the query millions of times and looking for differences. These differences may manifest across different versions, or from subtle differences in the query statement or data.

~~~sql
SELECT name,
       numberOfMoons
  FROM $planets
 WHERE numberOfMoons = 0;
~~~

Result:

~~~
name  	| numberOfMoons
--------+---------------
Mercury	|             0
Venus   |             0
~~~