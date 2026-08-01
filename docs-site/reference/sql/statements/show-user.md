---
title: SHOW USER Statement — Opteryx Reference
description: SQL SHOW USER statement syntax and examples for inspecting the current connection's identity in Opteryx
---

# SHOW USER

The `SHOW USER` statement returns identity details for the current connection — billing account and workspace memberships.

## Basic Syntax

~~~sql
SHOW USER;
~~~

## Result Columns

| Column | Description |
|--------|-------------|
| `attribute` | `billing_account` or `membership` (one row per membership) |
| `value` | The attribute's value |
| `type` | Value's data type |

## Notes

- Returns one `membership` row per workspace the caller belongs to, plus one `billing_account` row.
