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
<svg viewBox="0 0 680 256" width="100%" role="img" aria-labelledby="select-project-title select-project-desc" style="font-family: var(--font-body); font-size: 13px;">
<title id="select-project-title">WHERE chooses rows, SELECT chooses columns</title>
<desc id="select-project-desc">The query SELECT name, number_of_moons FROM $planets WHERE number_of_moons &lt; 2, drawn over five rows of $planets: Mercury, Venus, Earth, Mars and Jupiter, with columns id, name, gravity and number_of_moons. WHERE keeps Mercury, Venus and Earth, which have fewer than two moons; Mars and Jupiter are faded as failing it. SELECT keeps the name and number_of_moons columns; id and gravity are marked not selected. Arrows carry the three surviving rows into the result: Mercury 0, Venus 0, Earth 1.</desc>
<text x="0" y="16" style="fill: var(--text-deep); font-size: 12px; font-family: var(--font-mono);">SELECT name, number_of_moons FROM $planets WHERE number_of_moons &lt; 2</text>
<text x="0" y="53" style="fill: var(--text-deep); font-size: 13px; font-weight: 600; font-family: var(--font-display);">$planets</text>
<rect x="0" y="62" width="322" height="166" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<text x="10" y="79" style="fill: var(--muted-2); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">id</text>
<path d="M40.5 88 V 62.5 H 123.5 V 88 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.16;"/>
<rect x="40.5" y="88.5" width="83" height="27" style="fill: var(--opteryx-teal); fill-opacity: 0.09;"/>
<rect x="40.5" y="116.5" width="83" height="27" style="fill: var(--opteryx-teal); fill-opacity: 0.09;"/>
<rect x="40.5" y="144.5" width="83" height="27" style="fill: var(--opteryx-teal); fill-opacity: 0.09;"/>
<text x="50" y="79" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">name</text>
<text x="134" y="79" style="fill: var(--muted-2); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">gravity</text>
<path d="M194.5 88 V 62.5 H 316.0 Q 321.5 62.5 321.5 68.0 V 88 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.16;"/>
<rect x="194.5" y="88.5" width="127" height="27" style="fill: var(--opteryx-teal); fill-opacity: 0.09;"/>
<rect x="194.5" y="116.5" width="127" height="27" style="fill: var(--opteryx-teal); fill-opacity: 0.09;"/>
<rect x="194.5" y="144.5" width="127" height="27" style="fill: var(--opteryx-teal); fill-opacity: 0.09;"/>
<text x="204" y="79" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">number_of_moons</text>
<line x1="0" y1="88" x2="322" y2="88" style="stroke: var(--border-2);"/>
<g><text x="10" y="106" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">1</text><text x="50" y="106" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Mercury</text><text x="134" y="106" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">3.7</text><text x="204" y="106" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">0</text></g>
<line x1="0" y1="116" x2="322" y2="116" style="stroke: var(--border);"/>
<g><text x="10" y="134" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">2</text><text x="50" y="134" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Venus</text><text x="134" y="134" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">8.9</text><text x="204" y="134" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">0</text></g>
<line x1="0" y1="144" x2="322" y2="144" style="stroke: var(--border);"/>
<g><text x="10" y="162" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">3</text><text x="50" y="162" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Earth</text><text x="134" y="162" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">9.8</text><text x="204" y="162" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">1</text></g>
<line x1="0" y1="172" x2="322" y2="172" style="stroke: var(--border);"/>
<g opacity="0.4"><text x="10" y="190" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">4</text><text x="50" y="190" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">Mars</text><text x="134" y="190" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">3.7</text><text x="204" y="190" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">2</text></g>
<line x1="0" y1="200" x2="322" y2="200" style="stroke: var(--border);"/>
<g opacity="0.4"><text x="10" y="218" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">5</text><text x="50" y="218" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">Jupiter</text><text x="134" y="218" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">23.1</text><text x="204" y="218" style="fill: var(--muted-2); font-size: 12.5px; font-family: var(--font-body);">79</text></g>
<text x="334" y="204" style="fill: var(--muted); font-size: 11.5px; font-style: italic; font-family: var(--font-body);">fails WHERE</text>
<text x="0" y="246" style="fill: var(--muted); font-size: 11.5px; font-style: italic; font-family: var(--font-body);">id and gravity are faded: not in SELECT</text>
<text x="456" y="53" style="fill: var(--opteryx-teal); font-size: 13px; font-weight: 600; font-family: var(--font-display);">result</text>
<rect x="456" y="62" width="212" height="110" rx="6" style="fill: var(--surface); stroke: var(--border-2);"/>
<path d="M456.5 88 V 68.0 Q 456.5 62.5 462.0 62.5 H 539.5 V 88 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.16;"/>
<text x="466" y="79" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">name</text>
<path d="M540.5 88 V 62.5 H 662.0 Q 667.5 62.5 667.5 68.0 V 88 Z" style="fill: var(--opteryx-teal); fill-opacity: 0.16;"/>
<text x="550" y="79" style="fill: var(--text-deep); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);">number_of_moons</text>
<line x1="456" y1="88" x2="668" y2="88" style="stroke: var(--border-2);"/>
<text x="466" y="106" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Mercury</text>
<text x="550" y="106" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">0</text>
<path d="M328 102 C 391.0 102, 383.0 102, 446 102" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="446,98 454,102 446,106" style="fill: var(--opteryx-teal);"/>
<circle cx="328" cy="102" r="2.5" style="fill: var(--opteryx-teal);"/>
<line x1="456" y1="116" x2="668" y2="116" style="stroke: var(--border);"/>
<text x="466" y="134" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Venus</text>
<text x="550" y="134" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">0</text>
<path d="M328 130 C 391.0 130, 383.0 130, 446 130" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="446,126 454,130 446,134" style="fill: var(--opteryx-teal);"/>
<circle cx="328" cy="130" r="2.5" style="fill: var(--opteryx-teal);"/>
<line x1="456" y1="144" x2="668" y2="144" style="stroke: var(--border);"/>
<text x="466" y="162" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">Earth</text>
<text x="550" y="162" style="fill: var(--text-deep); font-size: 12.5px; font-family: var(--font-body);">1</text>
<path d="M328 158 C 391.0 158, 383.0 158, 446 158" style="fill: none; stroke: var(--opteryx-teal); stroke-width: 1.5; stroke-opacity: 0.85;"/>
<polygon points="446,154 454,158 446,162" style="fill: var(--opteryx-teal);"/>
<circle cx="328" cy="158" r="2.5" style="fill: var(--opteryx-teal);"/>
</svg>
</figure>

For example, the following query returns planets with fewer than 10 moons and a day longer than 24 hours:

~~~sql
SELECT name,
       length_of_day,
       number_of_moons
  FROM $planets
 WHERE length_of_day > 24
   AND number_of_moons < 10;
~~~

Result:

~~~
name    | length_of_day | number_of_moons
--------+---------------+-----------------
Mercury |        4222.6 |               0
Venus   |          2802 |               0
Mars    |          24.7 |               2
Pluto   |         153.3 |               5
~~~

The order of results is not guaranteed and should not be relied upon. If you request the results of the query below, you might get Mercury or Venus in either order. 

> Be Aware: The same query, on the same data in the same version of the query engine, will likely return results in the same order. Don't expect to test result order non-determinism by rerunning the query millions of times and looking for differences. These differences may manifest across different versions, or from subtle differences in the query statement or data.

~~~sql
SELECT name,
       number_of_moons
  FROM $planets
 WHERE number_of_moons = 0;
~~~

Result:

~~~
name    | number_of_moons
--------+-----------------
Mercury |               0
Venus   |               0
~~~