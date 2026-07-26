# Jobs API

Base URL: https://jobs.opteryx.app

## Overview

Job submission, execution status tracking, result retrieval, cancellation, and recent-query listing.

## Endpoints

Endpoint | Method | Summary
--- | --- | ---
`/api/v1/jobs` | `POST` | Create and execute SQL job
`/api/v1/jobs/estimate` | `POST` | Estimate result size
`/api/v1/jobs/recent` | `GET` | Retrieve recent user queries
`/api/v1/jobs/{identifier}/download` | `GET` | Download job results
`/api/v1/jobs/{identifier}/results` | `GET` | Get job results
`/api/v1/jobs/{identifier}/status` | `GET` | Get job status

## Create and execute SQL job

**Request:** `[POST] /api/v1/jobs`

**Tags:** Jobs Management

Submit a SQL job for execution.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `JobCreateRequest`
  - **sql_text** `string` [required]
    SQL statement to execute
  - **client_info** `object | null` [optional]
    Client information, e.g. application name/version
  - **parameters** `object | null` [optional]
    Query parameters, key-value pairs

### Responses

- **201** — Successful Response (`application/json` `JobCreateResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Estimate result size

**Request:** `[POST] /api/v1/jobs/estimate`

**Tags:** Jobs Management

Return a coarse estimate of the bytes for a job result. Accepts a JSON body with the SQL job.

### Header Parameters

- **authorization** `string | null` [header; optional]

### Request Body

- **Content-Type:** `application/json`
  Schema: `EstimateRequest`
  - **sql_text** `string` [required]
    SQL statement to estimate
  - **parameters** `object | null` [optional]
    Optional query parameters

### Responses

- **200** — Successful Response (`application/json` `EstimateResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Retrieve recent user queries

**Request:** `[GET] /api/v1/jobs/recent`

**Tags:** Jobs Management

Get recent user queries.

### Query Parameters

- **filter** `string | null` [query; optional]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `array<QueryJob>`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

### Try it live

Supply your own bearer token in the embed's Authorization tab — requests run against the real service.

<iframe src="https://hopp.sh/e/GEx6emtbbKch" title="Hoppscotch Embed" style="width: 100%; height: 480px; border-radius: 4px; border: 1px solid rgba(0, 0, 0, 0.1);"></iframe>

## Download job results

**Request:** `[GET] /api/v1/jobs/{identifier}/download`

**Tags:** Jobs Management

Download the results of a previously submitted job as CSV or JSON lines.

### Path Parameters

- **identifier** `string` [path; required]

### Query Parameters

- **file_format** `string` [query; optional]
  Allowed values: `csv`, `json`
  Default: `csv`
- **limit** `integer` [query; optional]
  Default: `10000`
- **offset** `integer` [query; optional]
  Default: `0`

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `object`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Get job results

**Request:** `[GET] /api/v1/jobs/{identifier}/results`

**Tags:** Jobs Management

Retrieve the results of a previously submitted job.

### Path Parameters

- **identifier** `string` [path; required]

### Query Parameters

- **num_rows** `integer` [query; optional]
  Default: `5000`
- **offset** `integer` [query; optional]
  Default: `0`
- **verbose** `boolean` [query; optional]
  Default: `false`

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `JobResultsResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Get job status

**Request:** `[GET] /api/v1/jobs/{identifier}/status`

**Tags:** Jobs Management

Retrieve the execution status of a previously submitted job.

### Path Parameters

- **identifier** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `JobStatusResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)
