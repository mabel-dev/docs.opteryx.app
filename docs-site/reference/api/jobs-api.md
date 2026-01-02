# Jobs API

**Status:** Published

Base URL: https://jobs.opteryx.app

## Overview

The Jobs service accepts SQL statements for execution and exposes job status and results endpoints. Incoming requests must present a valid Bearer JWT verified against the Authentication service JWKS.

**Endpoints**

End Point            | GET | POST | PATCH | DELETE
-------------------- | --- | ---- | ----- | ----
`/api/v1/jobs` | - | Create Job | - | -
`/api/v1/jobs/{identifier}/status` | Get Job Status | - | - | -
`/api/v1/jobs/{identifier}/results` | Get Job Results | - | - | -
`/api/v1/jobs/{identifier}/cancel` | - | Cancel Job | - | -

## Create Statement

**Request:** `[POST] /api/v1/jobs`

Request JSON: `{ "sql_text": "SELECT ...", "parameters": {...} }`

Response (201): `execution_id`, `status`, `created_at`, `status_url`.

## Get Statement Status

**Request:** `[GET] /api/v1/jobs/{identifier}/status`

Response: `execution_id`, `status`, `finished_at`, `results_url`, `error_message`.

## Get Statement Results

**Request:** `[GET] /api/v1/jobs/{identifier}/results?num_rows={num_rows}&offset={offset}`

Response: `execution_id`, `created_at`, `sql_text`, `total_rows`, `data` (array of row objects), `next_page`.

## Errors and Codes
- 201 Created, 200 OK, 400 Bad Request, 403 Forbidden, 404 Not Found, 504 Dependent service unavailable.

Authentication
- Bearer JWT required for protected endpoints. Tokens are validated against JWKS from the Authentication service. `JOBS_AUDIENCE` expected in `aud` claim.

