---
title: System Variables — Opteryx Reference
description: Every Opteryx system variable, its type, and who is permitted to set it.
---

# System Variables

Opteryx exposes 59 system variables. Use [SHOW VARIABLES](statements/show-variables) to see the ones your session can read, and [SET](statements/set) to change the ones you are permitted to change.

> Be Aware: Most system variables are **not** settable from SQL. A session runs at the `USER` tier, so only `USER`-owned variables are reachable by `SET` at all, and those marked `RESTRICTED` additionally require the `platform_admin` entitlement. Everything else is fixed by the server or stamped per session.

## Settable by any session

| Variable | Type | Default |
|---|---|---|
| `like_selectivity_decay` | FLOAT64 | env `LIKE_SELECTIVITY_DECAY` |
| `match_threshold` | FLOAT64 | env `MATCH_THRESHOLD` |
| `trace` | BOOL | env `OPTERYX_TRACE` |

## Settable with `platform_admin`

These are `USER`-owned but `RESTRICTED`, so they are hidden from `SHOW VARIABLES` and refused by `SET` unless the caller holds the `platform_admin` entitlement.

| Variable | Type | Default |
|---|---|---|
| `disable_http2` | BOOL | env `OPTERYX_HTTP_DISABLE_HTTP2` |
| `disable_http_multiplexing` | BOOL | env `OPTERYX_HTTP_DISABLE_MULTIPLEXING` |
| `http_max_connections_per_host` | INT64 | env `OPTERYX_HTTP_MAX_HOST_CONNECTIONS` |
| `http_max_retries` | INT64 | env `OPTERYX_HTTP_MAX_RETRIES` |
| `http_min_bandwidth_mbps` | FLOAT64 | env `OPTERYX_HTTP_MIN_BW_MBPS` |
| `http_pipewait` | BOOL | env `OPTERYX_HTTP_PIPEWAIT` |
| `http_request_timeout_floor_ms` | INT64 | env `OPTERYX_HTTP_TIMEOUT_FLOOR_MS` |
| `max_execution_workers` | INT64 | env `MAX_EXECUTION_WORKERS` |
| `parquet_gcs_io_workers` | INT64 | env `PARQUET_GCS_IO_WORKERS` |
| `parquet_io_coalesce_max_bytes` | INT64 | env `PARQUET_IO_COALESCE_MAX_BYTES` |
| `parquet_io_coalesce_waste_ratio` | FLOAT64 | env `PARQUET_IO_COALESCE_WASTE_RATIO` |
| `parquet_io_in_flight_limit` | INT64 | env `PARQUET_IO_IN_FLIGHT_LIMIT` |
| `parquet_local_io_workers` | INT64 | env `PARQUET_LOCAL_IO_WORKERS` |

## Not settable from SQL

Read-only from a session. Server-owned values are fixed when the server starts; session-identity values are stamped from the connection.

| Variable | Type | Default |
|---|---|---|
| `access_policies` | ARRAY<VARIANT> | _per session_ |
| `architecture` | ARRAY<VARIANT> | _detected from the host_ |
| `array_agg_memory_budget_bytes` | INT64 | `536870912` |
| `billing_account` | VARCHAR | _per session_ |
| `character_set_client` | VARCHAR | `utf8` |
| `cidr_agg_emit_budget_bytes` | INT64 | `536870912` |
| `cidr_agg_state_budget_bytes` | INT64 | `536870912` |
| `cpu_count` | INT64 | _detected from the host_ |
| `default_storage_engine` | VARCHAR | `rugo-parquet` |
| `disable_gc_during_query` | BOOL | env `OPTERYX_DISABLE_GC_DURING_QUERY` |
| `disable_optimizer` | BOOL | env `DISABLE_OPTIMIZER` |
| `external_user` | VARCHAR | _per session_ |
| `footer_remote_location` | VARCHAR | env `OPTERYX_FOOTER_CACHE_LOCATION` |
| `gcp_project_id` | VARCHAR | env `GCP_PROJECT_ID` |
| `instrument_engine` | BOOL | env `OPTERYX_INSTRUMENT_ENGINE` |
| `job_retention_days` | INT64 | `14` |
| `kvstore_key_prefix` | VARCHAR | env `KVSTORE_KEY_PREFIX` |
| `kvstore_location` | VARCHAR | env `KVSTORE_LOCATION` |
| `local_store_root` | VARCHAR | env `OPTERYX_LOCAL_STORE` |
| `manifest_cache_bytes` | INT64 | env `OPTERYX_MANIFEST_CACHE_BYTES` |
| `manifest_cache_path` | VARCHAR | env `OPTERYX_MANIFEST_CACHE_PATH` |
| `manifest_remote_location` | VARCHAR | env `OPTERYX_MANIFEST_CACHE_LOCATION` |
| `max_consecutive_cache_failures` | INT64 | env `MAX_CONSECUTIVE_CACHE_FAILURES` |
| `max_execution_time` | INT64 | `1200` |
| `max_sql_length` | INT64 | `256000` |
| `median_memory_budget_bytes` | INT64 | `536870912` |
| `memory_limit_bytes` | INT64 | _detected from the host_ |
| `operating_system` | VARCHAR | _detected from the host_ |
| `opteryx_debug` | BOOL | env `OPTERYX_DEBUG` |
| `parquet_late_materialization_abandon_after` | INT64 | env `PARQUET_LATE_MATERIALIZATION_ABANDON_AFTER` |
| `parquet_late_materialization_max_selectivity` | FLOAT64 | env `PARQUET_LATE_MATERIALIZATION_MAX_SELECTIVITY` |
| `physical_memory_bytes` | INT64 | _detected from the host_ |
| `python_version` | VARCHAR | _detected from the host_ |
| `result_retention_days` | INT64 | `7` |
| `skene_late_materialization_max_selectivity` | FLOAT64 | env `SKENE_LATE_MATERIALIZATION_MAX_SELECTIVITY` |
| `skene_late_materialization_min_deferred_columns` | INT64 | env `SKENE_LATE_MATERIALIZATION_MIN_DEFERRED_COLUMNS` |
| `sql_mode` | VARCHAR | `opteryx` |
| `sql_select_limit` | INT64 | `1073741824` |
| `system_time_zone` | VARCHAR | `UTC` |
| `user_entitlements` | ARRAY<VARIANT> | _per session_ |
| `user_memberships` | ARRAY<VARIANT> | _per session_ |
| `validate_optimizer_plans` | BOOL | env `VALIDATE_OPTIMIZER_PLANS` |
| `version` | VARCHAR | _from the build_ |

## Where defaults come from

- **`env KEY`** — read from that environment variable when the server starts. The shipped fallback lives in the engine's configuration, not here: recording a value generated on one machine would describe that machine rather than the product.
- **detected from the host** — derived at startup (CPU count, memory limits, platform).
- **per session** — identity asserted by the connecting service, not configuration. See [SHOW USER](statements/show-user) and [SHOW GRANTS](statements/show-grants).
