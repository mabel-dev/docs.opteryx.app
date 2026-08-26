---
title: IP_TRUNC — Opteryx Function
description: Applies a network mask to an IPv4 address, returning the network address: `IP_TRUNC(ip, 24)` on `192.168.1.1` returns `192.168.1.0`. The operation is a bitwise AND with the netmask for the prefix. Name and signature follow BigQuery's NET.IP_TRUNC — the prefix is an argument because an Opteryx IPv4 address carries no prefix length of its own, unlike a PostgreSQL `inet`.
---

<!-- GENERATED FILE - DO NOT EDIT.
     Regenerate with `make sql-docs` from the docs repo root.
     To change what this page says, change the source it is generated from
     (a registrar in opteryx-core, or a service's own OpenAPI description)
     and re-export - a hand edit here is silently overwritten. -->

# IP_TRUNC

Applies a network mask to an IPv4 address, returning the network address: `IP_TRUNC(ip, 24)` on `192.168.1.1` returns `192.168.1.0`. The operation is a bitwise AND with the netmask for the prefix. Name and signature follow BigQuery's NET.IP_TRUNC — the prefix is an argument because an Opteryx IPv4 address carries no prefix length of its own, unlike a PostgreSQL `inet`.

**Category:** Utility Functions

## Syntax

```sql
IP_TRUNC(ip, prefix)
```

## Arguments

- **ip** `integer`
    Integer input value.
- **prefix** `integer`
    Integer input value.

## Returns

**IPV4** — Returns the computed result as `IPV4`.
