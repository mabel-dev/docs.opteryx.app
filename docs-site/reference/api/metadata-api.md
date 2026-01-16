
# Metadata API

**Status:** Published

Base URL: https://metadata.opteryx.app

## Overview

Exposes catalog-backed metadata (tables, views).

**Endpoints**

End Point            | GET | POST | PATCH | DELETE
-------------------- | --- | ---- | ----- | ----
/v1/table/{workspace}/{collection}/{name} | Read Table Metadata | - | - | -
/v1/view/{workspace}/{schema}/{name} | Read View Metadata | - | - | -

## Get Table Metadata

**Request:** `[GET] /v1/table/{workspace}/{collection}/{name}`

Response (200): table metadata including `id`, `workspace`, `collection`, `table`, `type`, `last_modified_at`, `columns` and optional `snapshot` info.

## Get View Metadata

**Request:** `[GET] /v1/view/{workspace}/{schema}/{name}`

Response (200): view metadata with `definition` and `columns` when available.

## Notes
- Paths are normalized to lowercase. Service prefers catalog-backed lookup and may fall back to Firestore.
