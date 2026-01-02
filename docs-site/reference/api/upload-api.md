
# Upload API

**Status:** Published

Base URL: https://upload.opteryx.app (storage endpoints may use storage.opteryx.app)

## Overview

Multi-part upload service. Start upload sessions, upload parts (PUT), inspect session contents, delete parts, and commit sessions into tables/snapshots.

**Endpoints**

End Point                                           | GET  | POST           | PUT / PATCH            | DELETE
--------------------------------------------------- | ---- | -------------- | ---------------------- | ----
/v1/upload/session                                  | -    | Create Session | -                      | -
/v1/upload/{session_id}?part={part_number}          | -    | -              | Upload Part (PUT)      | -
/v1/upload/{session_id}/part/{part_number}          | -    | -              | -                      | Delete Part
/v1/upload/{session_id}/inspect                     | Inspect (204/200) | - | -                    | -
/v1/upload/{session_id}/commit                      | -    | Commit         | -                      | -

## Start Session

**Request:** `[POST] /v1/upload/session`

Response: `session_id`, `url`, `expires_at`, `parts`.

## Upload Part

**Request:** `[PUT] /v1/upload/{session_id}?part={part_number}`

Headers: `Authorization: Bearer <token>`, optional `x-file-name`, `Content-Type: application/octet-stream`.

Body: raw file bytes (Parquet, CSV, NDJSON). Max part size: 30MB.

## Inspect Session

**Request:** `[GET] /v1/upload/{session_id}/inspect`

Responses: 204 No Content (no parts) or 200 OK with `rows_estimate`, `schema`, `parts`, `issues`.

## Commit Session

**Request:** `[POST] /v1/upload/{session_id}/commit`

Request JSON: `{ "snapshot_message": "...", "create_table_if_missing": true }`

Response: `table`, `commit_id`, `rows_written`, `files_created`.

## Errors
- 413 Payload Too Large (part > 30MB)
- 422 Unprocessable Entity (unsupported/malformed file)
- 401 / 403 auth errors, 404 session not found
