# Upload API

Base URL: https://upload.opteryx.app

## Overview

Multipart upload sessions, part upload and deletion, session inspection, and commit flows for ingesting files into Opteryx.

## Endpoints

Endpoint | Method | Summary
--- | --- | ---
`/health` | `GET` | Health
`/v1/upload/session` | `POST` | Start Upload Session
`/v1/upload/{session_id}` | `PUT` | Upload Part
`/v1/upload/{session_id}/commit` | `POST` | Commit Session
`/v1/upload/{session_id}/inspect` | `GET` | Inspect Session
`/v1/upload/{session_id}/part/{part}` | `DELETE` | Delete Part

## Health

**Request:** `[GET] /health`

**Tags:** service

### Responses

- **200** — Successful Response (`application/json` `object`)

## Start Upload Session

**Request:** `[POST] /v1/upload/session`

**Tags:** upload

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **201** — Successful Response (`application/json` `StartSessionResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Upload Part

**Request:** `[PUT] /v1/upload/{session_id}`

**Tags:** upload

### Path Parameters

- **session_id** `string` [path; required]

### Query Parameters

- **part** `integer` [query; required]
- **content_type** `string | null` [query; optional]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **201** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Commit Session

**Request:** `[POST] /v1/upload/{session_id}/commit`

**Tags:** upload

### Path Parameters

- **session_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `CommitRequest`
  - **target** `Target` [required]
  - **snapshot_message** `string | null` [optional]
  - **conflict_resolution** `ConflictResolution` [optional]
    Allowed values: `fail`, `overwrite`, `append`

### Responses

- **200** — Successful Response (`application/json` `CommitResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Inspect Session

**Request:** `[GET] /v1/upload/{session_id}/inspect`

**Tags:** upload

### Path Parameters

- **session_id** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `InspectResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Delete Part

**Request:** `[DELETE] /v1/upload/{session_id}/part/{part}`

**Tags:** upload

### Path Parameters

- **session_id** `string` [path; required]
- **part** `integer` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)
