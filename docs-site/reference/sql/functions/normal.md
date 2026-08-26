---
title: NORMAL — Opteryx Function
description: Computes normally-distributed random float(s).
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# NORMAL

Computes normally-distributed random float(s).

**Category:** Utility Functions

## Syntax

```sql
NORMAL(n)
```

```sql
NORMAL()
```

## Arguments

- **n** `integer`
    Number of random values to generate.

## Returns

**FLOAT** — Returns the computed result as `FLOAT`.

## Usage Notes

This function is volatile. The integer argument controls how many values are generated, not a seed.
