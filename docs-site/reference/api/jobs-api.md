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
`/api/v1/jobs/{identifier}/cancel` | `POST` | Cancel job execution
`/api/v1/jobs/{identifier}/download` | `GET` | Download job results
`/api/v1/jobs/{identifier}/results` | `GET` | Get job results
`/api/v1/jobs/{identifier}/status` | `GET` | Get job status
`/health` | `GET` | Health

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

## Cancel job execution

**Request:** `[POST] /api/v1/jobs/{identifier}/cancel`

**Tags:** Jobs Management

Cancel a running job.

### Path Parameters

- **identifier** `string` [path; required]

### Header Parameters

- **authorization** `string | null` [header; optional]

### Responses

- **200** — Successful Response (`application/json` `JobCancelResponse`)
- **422** — Validation Error (`application/json` `HTTPValidationError`)

## Download job results

**Request:** `[GET] /api/v1/jobs/{identifier}/download`

**Tags:** Jobs Management

Download the results of a previously submitted job as CSV or JSON lines.

### Path Parameters

- **identifier** `string` [path; required]

### Query Parameters

- **file_format** `string` [query; optional]
- **limit** `integer` [query; optional]
- **offset** `integer` [query; optional]

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
- **offset** `integer` [query; optional]
- **verbose** `boolean` [query; optional]

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

## Health

**Request:** `[GET] /health`

**Tags:** service

### Responses

- **200** — Successful Response (`application/json` `object`)
