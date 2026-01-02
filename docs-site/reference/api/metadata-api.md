
# Metadata API

**Status:** Published

Base URL: https://metadata.opteryx.app

## Overview

Exposes catalog-backed metadata (tables, views) and provides user-scoped recent query history.

**Endpoints**

End Point            | GET | POST | PATCH | DELETE
-------------------- | --- | ---- | ----- | ----
/v1/user/queries/recent | Read Recent Queries | - | - | -
/v1/table/{workspace}/{collection}/{name} | Read Table Metadata | - | - | -
/v1/view/{workspace}/{schema}/{name} | Read View Metadata | - | - | -

## Get Table Metadata

**Request:** `[GET] /v1/table/{workspace}/{collection}/{name}`

Response (200): table metadata including `id`, `workspace`, `collection`, `table`, `type`, `last_modified_at`, `columns` and optional `snapshot` info.

## Get View Metadata

**Request:** `[GET] /v1/view/{workspace}/{schema}/{name}`

Response (200): view metadata with `definition` and `columns` when available.

## Get Recent User Queries

**Request:** `[GET] /v1/user/queries/recent?filter={value}`

Requires Bearer token. Returns array of recent query job objects: `id`, `sql_text`, `created_at`, `llm_described`, `time_taken_s`.

## Notes
- Paths are normalized to lowercase. Service prefers catalog-backed lookup and may fall back to Firestore.
