---
title: SQL Operators — Opteryx Reference
description: Reference for SQL operators.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# Operators

The following operators are supported by Opteryx.  Click a name for details.

## Binary

- [Division `/`](operators/divide)
- [Subtraction `-`](operators/minus)
- [Modulo `%`](operators/modulo)
- [Multiplication `*`](operators/multiply)
- [Integer division `DIV`](operators/myintegerdivide)
- [Addition `+`](operators/plus)
- [Concatenation `||`](operators/stringconcat)

## Bitwise

- [Bitwise AND `&`](operators/bitwiseand)
- [Bitwise OR `|`](operators/bitwiseor)
- [Bitwise XOR `^`](operators/bitwisexor)
- [Left shift `<<`](operators/shiftleft)
- [Right shift `>>`](operators/shiftright)

## Comparison

- [Array contains all `@>>`](operators/arraycontainsall)
- [Array contains any `@>`](operators/atarrow)
- [JSON path exists `@?`](operators/atquestion)
- [Equals `=`](operators/eq)
- [Greater than `>`](operators/gt)
- [Greater than or equal `>=`](operators/gteq)
- [Case-insensitive like `ILIKE`](operators/ilike)
- [IP contained by `<<=`](operators/ipcontainedby)
- [IP contains `>>=`](operators/ipcontains)
- [In list `IN`](operators/inlist)
- [Like `LIKE`](operators/like)
- [Less than `<`](operators/lt)
- [Less than or equal `<=`](operators/lteq)
- [Not equals `!=`](operators/noteq)
- [Not case-insensitive like `NOT ILIKE`](operators/notilike)
- [Not in list `NOT IN`](operators/notinlist)
- [Not like `NOT LIKE`](operators/notlike)
- [Not regex like `NOT RLIKE`](operators/notrlike)
- [Regex like `RLIKE`](operators/rlike)

## Extraction

- [JSON extract `->`](operators/arrow)
- [JSON extract text `->>`](operators/longarrow)
- [Subscript access `[]`](operators/mapaccess)

## Logical

- [Logical AND `AND`](operators/and)
- [Logical OR `OR`](operators/or)
- [Logical XOR `XOR`](operators/xor)

## Operator precedence

When an expression is written without parentheses, operators higher in this list bind first. Operators on the same line bind equally and group left to right, so `a - b + c` is `(a - b) + c`. A prefix operator applies to everything that binds tighter than it: `NOT a = b` is `NOT (a = b)`, and `-a * b` is `(-a) * b`. Parentheses always override.

Some of these differ from other SQL engines; where they do, the line says so.

1. [`@>>`](operators/arraycontainsall) [`->`](operators/arrow) [`@>`](operators/atarrow) [`@?`](operators/atquestion) [`->>`](operators/longarrow) — Opteryx's own choice, above `::` and `[]`: `payload->>'id'::INTEGER` casts the extracted value, and `a->'b'[1]` indexes the extracted value. Postgres binds `::` tighter and casts the key. A cast on a containment operand regroups too: `a @> ['x']::ARRAY<VARCHAR>` is `(a @> ['x'])::ARRAY<VARCHAR>`.
2. [`[]`](operators/mapaccess) `::`
3. unary `-` unary `+`
4. [`/`](operators/divide) [`%`](operators/modulo) [`*`](operators/multiply) [`DIV`](operators/myintegerdivide) [`||`](operators/stringconcat) — `||` binds like `*`. Postgres puts `||` below `+` and `-`; the two only meet in an expression that mixes strings and numbers.
5. [`-`](operators/minus) [`+`](operators/plus)
6. [`&`](operators/bitwiseand)
7. [`^`](operators/bitwisexor) [`<<=`](operators/ipcontainedby) [`>>=`](operators/ipcontains) [`<<`](operators/shiftleft) [`>>`](operators/shiftright) — `^`, `<<` and `>>` share one tier, between `&` and `|`. MySQL binds `^` above `*` and the shifts above `&`, so `a & b << c` is `(a & b) << c` here and `a & (b << c)` in MySQL. The IPv4 containment operators `<<=` and `>>=` begin with the shift tokens and bind at this tier, not as comparisons.
8. [`|`](operators/bitwiseor)
9. [`=`](operators/eq) [`>`](operators/gt) [`>=`](operators/gteq) [`IN`](operators/inlist) [`<`](operators/lt) [`<=`](operators/lteq) [`!=`](operators/noteq) [`<>`](operators/noteq) [`NOT IN`](operators/notinlist) `BETWEEN` `NOT BETWEEN`
10. [`ILIKE`](operators/ilike) [`LIKE`](operators/like) [`NOT ILIKE`](operators/notilike) [`NOT LIKE`](operators/notlike) [`NOT RLIKE`](operators/notrlike) [`RLIKE`](operators/rlike) `SIMILAR TO` `NOT SIMILAR TO` — Pattern matching binds LOOSER than comparison. Postgres has it tighter, so `a = b LIKE c` is `(a = b) LIKE c` here and `a = (b LIKE c)` there.
11. `IS FALSE` `IS JSON ARRAY` `IS JSON OBJECT` `IS JSON SCALAR` `IS JSON` `IS NOT FALSE` `IS NOT JSON ARRAY` `IS NOT JSON OBJECT` `IS NOT JSON SCALAR` `IS NOT JSON` `IS NOT NULL` `IS NOT TRUE` `IS NULL` `IS TRUE` `IS DISTINCT FROM` `IS NOT DISTINCT FROM`
12. unary `NOT`
13. [`AND`](operators/and)
14. [`XOR`](operators/xor)
15. [`OR`](operators/or)
