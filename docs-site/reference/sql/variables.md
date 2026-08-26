---
title: System Variables — Opteryx Reference
description: Every Opteryx system variable, its type, and who is permitted to set it.
---

# System Variables

Opteryx exposes 24 system variables that a session can read. Use [SHOW VARIABLES](statements/show-variables) to list them, and [SET](statements/set) to change the ones you are permitted to change.

> Be Aware: Most system variables are **not** settable from SQL. A session runs at the `USER` tier, so only `USER`-owned variables are reachable by `SET` at all. Everything else is fixed by the server or stamped per session.

> Note: This page lists the variables a session can see. An embedded build of `opteryx-core` may display additional variables that are internal to the hosted service and not part of the documented SQL surface.

## Settable by any session

| Variable | Type | Default |
|---|---|---|
| `disable_runtime_minmax_join_filter` | BOOL | `False` |
| `like_selectivity_decay` | FLOAT64 | env `LIKE_SELECTIVITY_DECAY` |
| `match_threshold` | FLOAT64 | env `MATCH_THRESHOLD` |
| `trace` | BOOL | env `OPTERYX_TRACE` |
| `write_coalesce_rows` | INT64 | env `WRITE_COALESCE_ROWS` |

## Not settable from SQL

Read-only from a session. Server-owned values are fixed when the server starts; session-identity values are stamped from the connection.

| Variable | Type | Default |
|---|---|---|
| `array_agg_memory_budget_bytes` | INT64 | `536870912` |
| `billing_account` | VARCHAR | _per session_ |
| `build` | INT64 | _from the build_ |
| `character_set_client` | VARCHAR | `utf8` |
| `cidr_agg_emit_budget_bytes` | INT64 | `536870912` |
| `cidr_agg_state_budget_bytes` | INT64 | `536870912` |
| `default_storage_engine` | VARCHAR | `rugo-parquet` |
| `external_user` | VARCHAR | _per session_ |
| `job_retention_days` | INT64 | `14` |
| `max_execution_time` | INT64 | `1200` |
| `max_sql_length` | INT64 | `256000` |
| `median_memory_budget_bytes` | INT64 | `2147483648` |
| `result_retention_days` | INT64 | `7` |
| `sql_mode` | VARCHAR | `opteryx` |
| `sql_select_limit` | INT64 | `1073741824` |
| `system_time_zone` | VARCHAR | `UTC` |
| `user_entitlements` | ARRAY<VARIANT> | _per session_ |
| `user_memberships` | ARRAY<VARIANT> | _per session_ |
| `version` | VARCHAR | _from the build_ |

## Where defaults come from

- **`env KEY`** — read from that environment variable when the server starts. The shipped fallback lives in the engine's configuration, not here: recording a value generated on one machine would describe that machine rather than the product.
- **detected from the host** — derived at startup (CPU count, memory limits, platform).
- **per session** — identity asserted by the connecting service, not configuration. See [SHOW USER](statements/show-user) and [SHOW GRANTS](statements/show-grants).
