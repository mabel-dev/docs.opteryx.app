---
title: IP contained by — Opteryx Operator
description: Returns true when the left IPv4 address falls inside the network given on the right in CIDR notation, for example `ip <<= '10.0.0.0/8'`. Comparison is on the underlying 32-bit address, so it is a single mask-and-compare per row with no text parsing. Symbol: <<=
---

# IP contained by

Returns true when the left IPv4 address falls inside the network given on the right in CIDR notation, for example `ip <<= '10.0.0.0/8'`. Comparison is on the underlying 32-bit address, so it is a single mask-and-compare per row with no text parsing.

**Category:** comparison

**SQL symbol:** `<<=`

## Notes

Spelling follows PostgreSQL, CockroachDB and DuckDB's inet extension. A NULL address is not contained by any network and yields false. An invalid or prefix-less CIDR raises rather than matching nothing.
