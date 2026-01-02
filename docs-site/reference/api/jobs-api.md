```markdown
# Jobs API

**Status:** Published

Base URL: https://jobs.opteryx.app

## Overview

The Jobs service accepts SQL statements for execution and exposes job status and results endpoints. Incoming requests must present a valid Bearer JWT verified against the Authentication service JWKS.

**Endpoints**

End Point            | GET | POST | PATCH | DELETE
-------------------- | --- | ---- | ----- | ----
`/api/v1/statements` | - | Create Statement | - | -
`/api/v1/statements/{identifier}/status` | Get Statement Status | - | - | -
`/api/v1/statements/{identifier}/results` | Get Statement Results | - | - | -
`/api/v1/statements/{identifier}/cancel` | - | Cancel Statement | - | -

## Create Statement

**Request:** `[POST] /api/v1/statements`

Request JSON: `{ "sql_text": "SELECT ...", "parameters": {...} }`

Response (201): `execution_id`, `status`, `created_at`, `status_url`.

## Get Statement Status

**Request:** `[GET] /api/v1/statements/{identifier}/status`

Response: `execution_id`, `status`, `finished_at`, `results_url`, `error_message`.

## Get Statement Results

**Request:** `[GET] /api/v1/statements/{identifier}/results?num_rows={num_rows}&offset={offset}`

Response: `execution_id`, `created_at`, `sql_text`, `total_rows`, `data` (array of row objects), `next_page`.

## Errors and Codes
- 201 Created, 200 OK, 400 Bad Request, 403 Forbidden, 404 Not Found, 504 Dependent service unavailable.

Authentication
- Bearer JWT required for protected endpoints. Tokens are validated against JWKS from the Authentication service. `JOBS_AUDIENCE` expected in `aud` claim.

```
