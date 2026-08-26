---
title: RANDOM — Opteryx Function
description: Computes uniform random float(s) in [0, 1).
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# RANDOM

Computes uniform random float(s) in [0, 1).

**Category:** Utility Functions

## Syntax

```sql
RANDOM(n)
```

```sql
RANDOM()
```

## Arguments

- **n** `integer`
    Number of random values to generate.

## Returns

**FLOAT** — Returns the computed result as `FLOAT`.

## Usage Notes

This function is volatile. The integer argument controls how many values are generated, not a seed.
