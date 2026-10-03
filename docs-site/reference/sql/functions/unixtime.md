---
title: UNIXTIME — Opteryx Function
description: Converts a DATE or TIMESTAMP to whole Unix epoch seconds as an INTEGER; sub-second detail is discarded. With no argument, gives the epoch seconds at which the query's connection was opened - the same value as UNIXTIME(NOW()).
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# UNIXTIME

Converts a DATE or TIMESTAMP to whole Unix epoch seconds as an INTEGER; sub-second detail is discarded. With no argument, gives the epoch seconds at which the query's connection was opened - the same value as UNIXTIME(NOW()).

**Category:** Date & Time Functions

## Syntax

```sql
UNIXTIME(date)
```

```sql
UNIXTIME()
```

## Arguments

- **date** `temporal`
    Date or timestamp value to evaluate.

## Returns

**INTEGER** — Returns the computed result as `INTEGER`.
